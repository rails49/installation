// Updating the box and going back (#65 decisions 8 to 12), applying the
// setup at the release the box runs (#69 decisions 14 and 15), and downloading
// a release, whose run is in `download.mjs` (#121). `start()` is
// what `box` does on a press: it starts the one-shot container
// `rails49-update` from the target release's `installation-box` image, with
// the socket, in no compose project. `run()` is what that container does,
// run as
//
//     node /box/update.mjs <update|back|apply|download> <from> <to>
//
// It brings the release's box files to `/var/lib/rails49/releases/<to>/`,
// pulls every image of every declared stack through the Engine API, and only
// then brings the stacks up in order. It passes when every container is still running after 60
// seconds and the probe passes. It appends one line to the record, and after
// a pass prunes what neither release uses. Applying the setup first stops and
// removes the containers of each stack no longer declared, keeping their
// data, and neither appends to the record nor prunes. What it is doing is in
// `PROGRESS`, which the status page reads: the step, and while an image is
// pulled, which one of how many and its bytes (#96); and the steps this run
// takes, the one it is at and when that began (#111).
//
// The docker CLI, the Engine API's pull, the box's files, GitHub, the probe
// and the clock are handed in as `io`, so this reads nothing itself.

import { execFile } from "node:child_process";
import { request } from "node:http";
import { createInterface } from "node:readline";
import { appendFile, mkdir, readdir, readFile, rename, rm, statfs, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";

import {
  backTo,
  CHECK,
  currentRelease,
  declared,
  DOWNLOADING,
  inspected,
  manifestPath,
  message,
  named,
  older,
  PROGRESS,
  RECORD,
  RELEASES,
  STACKS,
} from "./status.mjs";

export const DOWNLOAD = "https://github.com/rails49/installation/releases/download";
const CONTAINER = "rails49-update";
const WAIT = 60_000;
/** The least time between two writes of the progress file while it pulls. */
const EVERY = 1000;

/**
 * One message of the Engine API's `POST /images/create` stream: a layer's
 * `status`, with `progressDetail` while it downloads, or an `error`.
 *
 * @typedef {{
 *   status?: string,
 *   id?: string,
 *   progressDetail?: { current?: number, total?: number },
 *   error?: string,
 *   errorDetail?: { message?: string },
 * }} PullMessage
 *
 * The image being pulled, its place among every image the run pulls, and
 * the bytes downloaded of its total, summed over the layers whose size the
 * stream has said. `run` is the bytes downloaded of every image the run
 * pulls, of the run's total, or null where the manifest lists no layers
 * (#118). A page from an older release reads only the rest.
 *
 * @typedef {{ image: string, index: number, count: number, current: number, total: number, run?: Bytes | null }} Pull
 *
 * @typedef {{ current: number, total: number }} Bytes
 *
 * One layer of an image, as the manifest's `layers` lists it: its digest and
 * compressed size. The manifest lists them by the image's digest, then by
 * platform, `linux/amd64` and `linux/arm64`.
 *
 * @typedef {{ digest: string, size: number }} Layer
 * @typedef {Record<string, Record<string, Layer[] | undefined> | undefined>} Layers
 */

/**
 * @typedef {{
 *   docker: (args: string[]) => Promise<string>,
 *   pull: (image: string) => AsyncIterable<PullMessage>,
 *   download: (url: string, path: string) => Promise<void>,
 *   unpack: (archive: string, dir: string) => Promise<void>,
 *   rename: (from: string, to: string) => Promise<void>,
 *   remove: (path: string) => Promise<void>,
 *   list: (dir: string) => Promise<string[]>,
 *   read: (path: string) => Promise<string | null>,
 *   write: (path: string, text: string) => Promise<void>,
 *   append: (path: string, text: string) => Promise<void>,
 *   probe: (args: string[]) => Promise<{ ok: boolean, output: string }>,
 *   sleep: (ms: number) => Promise<void>,
 *   now: () => Date,
 * }} Io
 *
 * `docker` is the CLI's stdout, and throws with what it said on stderr.
 * `pull` pulls one image and streams what the Engine API says while it does,
 * and throws where the Engine refuses the pull. `download` writes what a URL answers to a file. `unpack` unpacks a
 * `.tar.gz` into a directory. `remove` removes a file or a directory and what
 * is in it, and nothing where there is none. `list` is the names in a
 * directory. `append` makes the file's directory where there is none.
 * `probe` runs `scripts/probe.sh` with the arguments.
 *
 * @typedef {{ BOX_DOMAIN: string, BOX_UIS: string, hostname: string, address: string }} Env
 *
 * @typedef {import("./status.mjs").Container} Container
 */

/** A step that failed, said in a sentence. */
class Failure extends Error {}

/**
 * A step of a run, as the progress file lists it: downloading the release,
 * pulling the images, stopping the stacks no longer chosen, starting the
 * stacks, watching them for 60 seconds, probing, and removing what neither
 * release uses.
 *
 * @typedef {"download" | "pull" | "stop" | "start" | "watch" | "probe" | "prune"} Step
 */

/**
 * The progress file's text: what runs, the step it is at in a sentence, the
 * image it pulls or null, and once it has finished, when, whether it passed,
 * and why not. A run also lists its steps, the one it is at, null once it has
 * passed, when that began, and whether JMRI is being built. A page from an
 * older release reads only the sentence and the pull.
 *
 * @param {{ action: "update" | "back" | "apply", from: string, to: string, started: string, steps?: Step[], at?: Step | null, since?: string, step: string, pull: Pull | null, building?: boolean }} run
 * @param {{ finished: Date, passed: boolean, failure: string | null } | null} result
 */
function progressText(run, result) {
  const finished = result?.finished.toISOString() ?? null;
  return `${JSON.stringify({ ...run, finished, passed: result?.passed ?? null, failure: result?.failure ?? null })}\n`;
}

/**
 * @param {"update" | "back" | "apply"} action
 * @param {string} from the release the box runs, or `-`
 * @param {string} to
 * @param {Env} env
 * @param {Io} io
 */
export async function run(action, from, to, env, io) {
  const started = io.now().toISOString();
  let written = -Infinity;
  /** @type {Step[]} */
  let steps = [];
  /** @type {Step | null} */
  let at = null;
  let since = started;
  /**
   * @param {Step | null} id the step, null once passed
   * @param {string} step
   * @param {{ result?: { passed: boolean, failure: string | null }, pull?: Pull, building?: boolean }} [more]
   */
  const progress = (id, step, { result, pull, building = false } = {}) => {
    if (id !== at) [at, since] = [id, io.now().toISOString()];
    written = io.now().getTime();
    return io.write(
      PROGRESS,
      progressText(
        { action, from, to, started, steps, at, since, step, pull: pull ?? null, building },
        result ? { ...result, finished: io.now() } : null,
      ),
    );
  };

  const stacks = declared(env.BOX_UIS);
  /** @param {(typeof stacks)[number]} stack @param {string[]} args */
  const compose = (stack, args) => composed(stack, to, env, io.docker, args);

  /** @type {string | null} */
  let failure = null;
  /** @type {Set<string>} */
  let ran = new Set();
  try {
    const missing = (await io.read(manifestPath(to))) === null;
    const all = await inspected(io.docker);
    ran = new Set(own(all, stacks).map((c) => c.Image));
    // Applying the setup stops each stack no longer declared that has a
    // container.
    const undeclared = STACKS.filter((stack) => !stacks.includes(stack));
    const stopping = action === "apply" ? undeclared.filter((stack) => own(all, [stack]).length) : [];
    steps = [
      ...(missing ? /** @type {const} */ (["download"]) : []),
      "pull",
      ...(stopping.length ? /** @type {const} */ (["stop"]) : []),
      "start",
      "watch",
      "probe",
      ...(action === "update" ? /** @type {const} */ (["prune"]) : []),
    ];

    if (missing) {
      await progress("download", `Downloading release ${to}.`);
      await download(to, io).catch((error) => {
        throw new Failure(`Could not download release ${to}: ${sentence(error)}`);
      });
    }

    /** @param {(typeof stacks)[number]} stack @param {unknown} error */
    const unpulled = (stack, error) =>
      new Failure(`Could not pull ${stack.stack}'s images for release ${to}: ${sentence(error)}`);
    // Every image is counted before the first is pulled, so the page can say
    // how many there are. JMRI is built on the box and counts none.
    /** @type {Map<(typeof stacks)[number], string[]>} */
    const images = new Map();
    for (const stack of stacks.filter(({ stack }) => stack !== "jmri")) {
      const listed = await compose(stack, ["config", "--images"]).catch((error) => {
        throw unpulled(stack, error);
      });
      images.set(stack, listed.split("\n").filter(Boolean));
    }
    const count = [...images.values()].flat().length;
    const bytes = await tally([...images.values()].flat(), to, io);
    let index = 0;
    for (const stack of stacks) {
      const step = `Pulling ${stack.stack}'s images.`;
      try {
        if (stack.stack === "jmri") {
          await progress("pull", step, { building: true });
          await compose(stack, ["build", "--pull"]);
          continue;
        }
        await progress("pull", step);
        for (const image of images.get(stack) ?? []) {
          index += 1;
          await pull(image, index, count, bytes, io, async (pulled) => {
            if (io.now().getTime() - written >= EVERY) await progress("pull", step, { pull: pulled });
          });
        }
      } catch (error) {
        throw unpulled(stack, error);
      }
    }

    for (const stack of stopping) {
      await progress("stop", `Stopping ${stack.stack}.`);
      await io.docker(["compose", "-p", stack.project, "down"]);
    }

    for (const stack of stacks) {
      await progress("start", `Starting ${stack.stack}.`);
      await compose(stack, ["up", "-d", "--no-build", "--pull", "never", "--remove-orphans"]).catch((error) => {
        throw new Failure(`${stack.stack} did not start on release ${to}: ${sentence(error)}`);
      });
    }

    await progress("watch", "Waiting 60 seconds to see that every container keeps running.");
    const before = await containers(stacks, io);
    await io.sleep(WAIT);
    const after = await containers(stacks, io);
    for (const stack of stacks) {
      const problems = after
        .filter((c) => c.Config.Labels?.["com.docker.compose.project"] === stack.project)
        .flatMap((c) => {
          const name = c.Name.slice(1);
          if (c.State.Status !== "running") return [`${name} is ${c.State.Status}`];
          const was = before.find((b) => b.Name === c.Name);
          return was && was.State.StartedAt !== c.State.StartedAt ? [`${name} restarted`] : [];
        });
      if (problems.length) {
        throw new Failure(`${stack.stack} is not running 60 seconds after ${named(action, to).after}: ${problems.join(", ")}.`);
      }
    }

    await progress("probe", "Probing every way into every UI.");
    const labels = env.BOX_UIS.split(/\s+/).filter(Boolean);
    const probed = await io.probe([env.address, env.hostname, env.BOX_DOMAIN, ...labels]);
    if (!probed.ok) {
      const wrong = probed.output.split("\n").filter((line) => line.startsWith("FAIL"));
      throw new Failure(`The probe got answers it did not want: ${wrong.join("; ")}`);
    }
  } catch (error) {
    failure = error instanceof Failure ? error.message : `${named(action, to).stopped} stopped: ${sentence(error)}`;
  }

  const passed = failure === null;
  // Applying the setup moves the box to no other release.
  if (action !== "apply") {
    await io.append(RECORD, `${started.slice(0, 19)}Z  ${from}  ->  ${to}  ${passed ? "passed" : "failed"}\n`);
  }
  // Only after an update: going back after a failed one would otherwise
  // leave the release before it with no files and no images.
  if (passed && action === "update") {
    await progress("prune", "Removing what neither release uses.");
    await prune([to, from].filter((release) => release !== "-"), ran, io);
  }
  // A run that failed stays at the step that failed.
  await progress(passed ? null : at, passed ? "Done." : "Failed.", { result: { passed, failure } });
}

/**
 * The docker compose command for one stack of a release, from that release's
 * box files: with `box.env` and the stack's own settings, its compose files,
 * and its HTTPS routers only with a box name (#92).
 *
 * @param {(typeof STACKS)[number]} stack
 * @param {string} release
 * @param {{ BOX_DOMAIN: string }} env
 * @param {Io["docker"]} docker
 * @param {string[]} args
 */
export function composed(stack, release, env, docker, args) {
  const files = [...stack.files, ...(env.BOX_DOMAIN && stack.https ? [stack.https] : [])];
  return docker([
    "compose",
    "--env-file",
    "/etc/rails49/box.env",
    ...(stack.env ? ["--env-file", `/etc/rails49/${stack.env}`] : []),
    ...files.flatMap((file) => ["-f", `${RELEASES}/${release}/${file}`]),
    ...args,
  ]);
}

/**
 * The layers a run downloads, each by the first 12 hex digits of its digest,
 * as Docker's stream names it, with the bytes downloaded of its size; or null
 * where the release's manifest lists no layers for an image the box does not
 * have. Every layer of every image the run pulls counts once, for the box's
 * platform, but those of the images already on the box (#118).
 *
 * @typedef {Map<string, { size: number, current: number, gone: boolean }>} Tally
 *
 * @param {string[]} images
 * @param {string} release
 * @param {Pick<Io, "docker" | "read">} io
 * @returns {Promise<Tally | null>}
 */
export async function tally(images, release, io) {
  /** @type {{ layers?: Layers }} */
  const manifest = JSON.parse((await io.read(manifestPath(release))) ?? "{}");
  const layers = manifest.layers;
  if (!layers) return null;
  const platform = (await io.docker(["version", "--format", "{{.Server.Os}}/{{.Server.Arch}}"])).trim();
  const listed = await io.docker(["image", "ls", "--digests", "--no-trunc", "--format", "{{json .}}"]);
  const have = new Set(
    listed
      .split("\n")
      .filter(Boolean)
      .map((line) => /** @type {{ Repository: string, Digest: string }} */ (JSON.parse(line)))
      .map(({ Repository, Digest }) => `${Repository}@${Digest}`),
  );
  /** @param {string} image */
  const digest = (image) => image.split("@")[1] ?? "";
  /** @param {string} image */
  const of = (image) => (digest(image) ? layers[digest(image)]?.[platform] : undefined);
  /** @param {string} image */
  const there = (image) => have.has(`${repository({ image })}@${digest(image)}`);
  const pulled = images.filter((image) => !there(image));
  if (pulled.some((image) => !of(image))) return null;
  const had = new Set(images.filter(there).flatMap((image) => (of(image) ?? []).map((layer) => layer.digest)));
  /** @type {Tally} */
  const tally = new Map();
  for (const image of pulled) {
    for (const { digest, size } of of(image) ?? []) {
      if (!had.has(digest)) tally.set(digest.replace(/^sha256:/, "").slice(0, 12), { size, current: 0, gone: false });
    }
  }
  return tally;
}

/** The bytes the run has downloaded, of its total.
 *  @param {Tally} tally @returns {Bytes} */
export function counted(tally) {
  let current = 0;
  let total = 0;
  for (const layer of tally.values()) {
    if (layer.gone) continue;
    current += layer.current;
    total += layer.size;
  }
  return { current, total };
}

/** The image without its tag and digest.
 *  @param {{ image: string }} pull */
function repository({ image }) {
  return image.replace(/@.*$/, "").replace(/:[^/:]*$/, "");
}

/**
 * Pulls one image, and hands `report` how far it has got at its start and at
 * each message of the stream. A layer's bytes count once the stream has said
 * its size, and all of them once it says the layer is downloaded. A layer the
 * box already has counts none.
 *
 * The run's bytes are counted in `bytes` the same way, over the layers it
 * counts, and none goes down. A layer the stream says the box already has,
 * of which this run downloaded nothing, comes off the run's total.
 *
 * @param {string} image @param {number} index @param {number} count
 * @param {Tally | null} bytes @param {Pick<Io, "pull">} io
 * @param {(pull: Pull) => Promise<void>} report
 */
export async function pull(image, index, count, bytes, io, report) {
  /** @type {Map<string, { current: number, total: number }>} */
  const layers = new Map();
  const sum = () => {
    let current = 0;
    let total = 0;
    for (const layer of layers.values()) {
      current += layer.current;
      total += layer.total;
    }
    return { image, index, count, current, total, run: bytes && counted(bytes) };
  };
  await report(sum());
  for await (const message of io.pull(image)) {
    if (message.error !== undefined) throw new Error(message.errorDetail?.message || message.error);
    const { id, status, progressDetail } = message;
    if (id !== undefined && status === "Downloading" && progressDetail?.total) {
      layers.set(id, { current: progressDetail.current ?? 0, total: progressDetail.total });
    }
    const layer = id === undefined ? undefined : layers.get(id);
    if (layer && status === "Download complete") layer.current = layer.total;
    const ours = id === undefined ? undefined : bytes?.get(id);
    if (ours) {
      if (status === "Downloading" && progressDetail?.current !== undefined) {
        ours.current = Math.max(ours.current, Math.min(progressDetail.current, ours.size));
      } else if (status === "Download complete" || status === "Pull complete") {
        ours.current = ours.size;
      } else if (status === "Already exists" && ours.current === 0) {
        ours.gone = true;
      }
    }
    await report(sum());
  }
}

/**
 * The release's manifest and box files, unpacked beside it into a directory
 * that only gets the release's name once all of it is there.
 *
 * @param {string} release
 * @param {Pick<Io, "remove" | "download" | "unpack" | "rename">} io
 */
export async function download(release, io) {
  const part = `${RELEASES}/${release}.part`;
  await io.remove(part);
  await io.download(`${DOWNLOAD}/${release}/manifest.json`, `${part}/manifest.json`);
  await io.download(`${DOWNLOAD}/${release}/box-files.tar.gz`, `${part}/box-files.tar.gz`);
  await io.unpack(`${part}/box-files.tar.gz`, part);
  await io.remove(`${part}/box-files.tar.gz`);
  await io.rename(part, `${RELEASES}/${release}`);
}

/**
 * The containers of the declared stacks.
 *
 * @param {{ project: string }[]} stacks
 * @param {Io} io
 * @returns {Promise<Container[]>}
 */
async function containers(stacks, io) {
  return own(await inspected(io.docker), stacks);
}

/**
 * The containers among `all` that belong to the stacks.
 *
 * @param {Container[]} all
 * @param {{ project: string }[]} stacks
 */
function own(all, stacks) {
  const projects = stacks.map((s) => s.project);
  return all.filter((c) => projects.includes(c.Config.Labels?.["com.docker.compose.project"] ?? ""));
}

/**
 * Every image the releases' manifests pin, as `<repository>@<digest>`, and
 * the repositories of their stock images. A release whose files are not on
 * the box pins none.
 *
 * @param {string[]} releases
 * @param {Pick<Io, "read">} io
 */
export async function pinned(releases, io) {
  /** @type {Set<string>} */
  const used = new Set();
  /** @type {Set<string>} */
  const stock = new Set();
  for (const release of releases) {
    /** @type {{ stacks: Record<string, { images: Record<string, string> }>, stock: Record<string, string> }} */
    const manifest = JSON.parse((await io.read(manifestPath(release))) ?? "{}");
    for (const { images } of Object.values(manifest.stacks ?? {})) {
      for (const [image, digest] of Object.entries(images)) used.add(`ghcr.io/rails49/${image}@${digest}`);
    }
    for (const [ref, digest] of Object.entries(manifest.stock ?? {})) {
      const repository = ref.replace(/:[^/]*$/, "");
      stock.add(repository);
      used.add(`${repository}@${digest}`);
    }
  }
  return { used, stock };
}

/**
 * Decision 12: every rails49 image and pinned stock image that neither kept
 * release uses goes, except the images the stacks ran before this update,
 * which are one step back. A local build two steps back goes with the rest.
 * Other images are left alone, and so are the files of the kept releases.
 *
 * @param {string[]} keep the releases kept
 * @param {Set<string>} ran the IDs of the images the stacks ran before
 * @param {Io} io
 */
async function prune(keep, ran, io) {
  const { used, stock } = await pinned(keep, io);

  const listed = await io.docker(["image", "ls", "--digests", "--no-trunc", "--format", "{{json .}}"]);
  for (const line of listed.split("\n").filter(Boolean)) {
    /** @type {{ Repository: string, Tag: string, Digest: string, ID: string }} */
    const image = JSON.parse(line);
    const ours = image.Repository.startsWith("ghcr.io/rails49/") || stock.has(image.Repository);
    const pinned = image.Digest !== "<none>";
    if (!ours || ran.has(image.ID) || (pinned && used.has(`${image.Repository}@${image.Digest}`))) continue;
    const ref = pinned ? `${image.Repository}@${image.Digest}` : `${image.Repository}:${image.Tag}`;
    // An image a container still uses stays, and that is no failure.
    await io.docker(["image", "rm", ref]).catch((error) => console.error(`pruning ${ref}: ${message(error)}`));
  }

  for (const name of await io.list(RELEASES)) {
    if (!keep.includes(name)) await io.remove(`${RELEASES}/${name}`);
  }
}

/** Why the setup is not applied on a box never updated. */
export const NO_RELEASE = "This box runs no release yet, so there is none to apply the setup at.";

/** Why nothing else starts while `rails49-update` runs. */
export const BUSY = "The box is already updating, going back or applying the setup.";

/** The state of `rails49-update`'s container, `running` while one runs, and
 *  empty where there is none.
 *  @param {Io["docker"]} docker */
export async function updater(docker) {
  return stateOf(CONTAINER, docker);
}

/** The state of the container named `name`, empty where there is none.
 *  @param {string} name @param {Io["docker"]} docker */
export async function stateOf(name, docker) {
  return (await docker(["ps", "-a", "--filter", `name=^${name}$`, "--format", "{{.State}}"])).trim();
}

/**
 * Starts `rails49-update` for an update to the latest release, for going
 * back, or for applying the setup, and answers null; or answers in a sentence
 * why not. `install.sh` starts it the same way on a new box. Nothing it runs takes anything from the request: the release is
 * the latest the last check found, the one the record says the box ran
 * before, or the one it runs. `env.BOX_UIS` is what the container brings up.
 * An update is to a release the box has downloaded (#121), so its files are
 * on the box.
 *
 * @param {"update" | "back" | "apply"} action
 * @param {Omit<Env, "address"> & { address: string | null }} env
 * @param {{ docker: Io["docker"], read: Io["read"], write: Io["write"], now: Io["now"] }} io
 * @returns {Promise<string | null>}
 */
export async function start(action, env, io) {
  if ((await updater(io.docker)) === "running") return BUSY;

  const from = (await currentRelease(io.read)) ?? "-";
  /** @type {string | null} */
  let to;
  if (action === "update") {
    const text = await io.read(CHECK);
    /** @type {string | null} */
    const latest = text ? JSON.parse(text).latest : null;
    if (!latest || latest === from) return "This box runs the latest release.";
    if (from !== "-" && older(latest, from)) return `This box runs ${from}, newer than the latest release, ${latest}.`;
    to = latest;
    /** @type {{ release?: string, downloaded?: boolean } | null} */
    const got = JSON.parse((await io.read(DOWNLOADING)) || "null");
    if (got?.release !== to || !got.downloaded) return `Release ${to} is not downloaded yet.`;
  } else {
    to = action === "back" ? await backTo(io.read) : await currentRelease(io.read);
    if (to === null) return action === "back" ? "There is no release to go back to." : NO_RELEASE;
  }
  const image = await boxImage(to, io.read);
  if (image === null) return `Release ${to}'s files are not on this box.`;

  // The probe asks for `<hostname>.local`, which nothing in a container
  // resolves, so it is named here.
  const host = env.address ? ["--add-host", `${env.hostname}.local:${env.address}`] : [];
  const started = await oneShot(
    CONTAINER,
    image,
    ["-e", `BOX_HOSTNAME=${env.hostname}`, "-e", `BOX_ADDRESS=${env.address ?? ""}`, ...host],
    ["node", "/box/update.mjs", action, from, to],
    env,
    io,
    // The page reads this file while the container runs, so the last run's
    // progress is replaced before it starts.
    () =>
      io.write(
        PROGRESS,
        progressText({ action, from, to, started: io.now().toISOString(), step: "Starting.", pull: null }, null),
      ),
  );
  return started ? null : BUSY;
}

/** A release's `installation-box` image, from its manifest on the box, or
 *  null where its files are not on the box.
 *  @param {string} release @param {Io["read"]} read */
export async function boxImage(release, read) {
  /** @type {{ stacks: { installation: { commit: string, images: Record<string, string> } } } | null} */
  const manifest = JSON.parse((await read(manifestPath(release))) || "null");
  if (manifest === null) return null;
  const { commit, images } = manifest.stacks.installation;
  return `ghcr.io/rails49/installation-box:${commit}@${images["installation-box"]}`;
}

/**
 * Starts the one-shot container `name` from `image` with the Docker socket,
 * `/etc/rails49` read-only and `/var/lib/rails49`, in no compose project, and
 * `BOX_DOMAIN` and `BOX_UIS` set; `more` is more of `docker create`'s options,
 * and `command` what the container runs. The image is pulled first where the box does not
 * have it, and the container of the last one is removed. `starting` writes
 * what the page reads before the container starts. Answers false, starting
 * nothing, where one runs, or another start took the name first.
 *
 * @param {string} name
 * @param {string} image
 * @param {string[]} more
 * @param {string[]} command
 * @param {{ BOX_DOMAIN: string, BOX_UIS: string }} env
 * @param {{ docker: Io["docker"] }} io
 * @param {() => Promise<void>} starting
 */
export async function oneShot(name, image, more, command, env, io, starting) {
  // Pulled before the state is read, so the name is taken just after.
  await io.docker(["image", "inspect", image]).catch(() => io.docker(["pull", image]));
  const state = await stateOf(name, io.docker);
  if (state === "running") return false;
  if (state) await io.docker(["rm", name]);
  try {
    await io.docker([
      "create",
      "--name",
      name,
      "-v",
      "/var/run/docker.sock:/var/run/docker.sock",
      "-v",
      "/etc/rails49:/etc/rails49:ro",
      "-v",
      "/var/lib/rails49:/var/lib/rails49",
      "-e",
      `BOX_DOMAIN=${env.BOX_DOMAIN}`,
      "-e",
      `BOX_UIS=${env.BOX_UIS}`,
      ...more,
      image,
      ...command,
    ]);
  } catch (error) {
    // Another start took the name first. It runs, and what it wrote stays.
    if (message(error).includes("is already in use")) return false;
    throw error;
  }
  await starting();
  await io.docker(["start", name]);
  return true;
}

/** An error's message as the end of a sentence.
 *  @param {unknown} error */
export function sentence(error) {
  return `${message(error).trim().replace(/\.$/, "")}.`;
}

const exec = promisify(execFile);

/** The docker CLI, throwing with what it said on stderr.
 *  @param {string[]} args */
export async function docker(args) {
  try {
    return (await exec("docker", args, { maxBuffer: 64 * 1024 * 1024 })).stdout;
  } catch (error) {
    const { stderr } = /** @type {{ stderr?: string }} */ (error);
    throw new Error(stderr?.trim() || message(error));
  }
}

const SOCKET = "/var/run/docker.sock";

/**
 * Pulls an image through the Engine API on the socket, as `POST
 * /images/create`, and yields each message it streams. `docker pull` says
 * the same only on a terminal. An image named by a digest is pulled by it.
 *
 * @param {string} image
 * @param {string} [socket] the Engine's socket
 * @returns {AsyncIterable<PullMessage>}
 */
export async function* pullImage(image, socket = SOCKET) {
  const [ref = "", digest] = image.split("@");
  const tag = ref.match(/:([^/:]+)$/)?.[1];
  const name = tag === undefined ? ref : ref.slice(0, -tag.length - 1);
  const query = new URLSearchParams({ fromImage: name, tag: digest ?? tag ?? "latest" });
  /** @type {import("node:http").IncomingMessage} */
  const answer = await new Promise((resolve, reject) => {
    const asked = request({ socketPath: socket, method: "POST", path: `/images/create?${query}` }, resolve);
    asked.on("error", reject);
    asked.end();
  });
  answer.setEncoding("utf8");
  if (answer.statusCode !== 200) {
    let body = "";
    for await (const chunk of answer) body += chunk;
    /** @type {{ message?: string }} */
    let said = {};
    try {
      said = JSON.parse(body);
    } catch {}
    throw new Error(said.message || `the Engine answered ${answer.statusCode}`);
  }
  for await (const line of createInterface({ input: answer, crlfDelay: Infinity })) {
    if (line.trim()) yield /** @type {PullMessage} */ (JSON.parse(line));
  }
}

/** A file's text, or null where there is none.
 *  @param {string} path */
export async function read(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code === "ENOENT") return null;
    throw error;
  }
}

// Running, only when run rather than imported.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const [action, from, to] = process.argv.slice(2);
  if (!["update", "back", "apply", "download"].includes(action ?? "") || !from || !to) {
    console.error("usage: node /box/update.mjs <update|back|apply|download> <from> <to>");
    process.exit(2);
  }
  const env = {
    BOX_DOMAIN: process.env.BOX_DOMAIN ?? "",
    BOX_UIS: process.env.BOX_UIS ?? "",
    hostname: process.env.BOX_HOSTNAME ?? "",
    address: process.env.BOX_ADDRESS ?? "",
  };
  /** @type {Io} */
  const io = {
    docker,
    pull: pullImage,
    download: async (url, path) => {
      const answer = await fetch(url, { signal: AbortSignal.timeout(10 * 60_000) });
      if (!answer.ok) throw new Error(`GitHub answered ${answer.status} for ${url}`);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, Buffer.from(await answer.arrayBuffer()));
    },
    unpack: async (archive, dir) => void (await exec("tar", ["-xzf", archive, "-C", dir])),
    rename,
    remove: (path) => rm(path, { recursive: true, force: true }),
    list: (dir) => readdir(dir).catch(() => []),
    read,
    write: (path, text) => writeFile(path, text),
    append: async (path, text) => {
      await mkdir(dirname(path), { recursive: true });
      await appendFile(path, text);
    },
    probe: async (args) => {
      try {
        return { ok: true, output: (await exec("bash", ["/scripts/probe.sh", ...args])).stdout };
      } catch (error) {
        return { ok: false, output: /** @type {{ stdout?: string }} */ (error).stdout ?? message(error) };
      }
    },
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    now: () => new Date(),
  };
  if (action === "download") {
    // The file system Docker keeps its images on, as `box` reads it.
    const free = async () => {
      const disk = await statfs("/");
      return disk.bavail * disk.bsize;
    };
    const { run: downloading } = await import("./download.mjs");
    await downloading(from, to, env, { ...io, free });
  } else {
    await run(/** @type {"update" | "back" | "apply"} */ (action), from, to, env, io);
  }
}
