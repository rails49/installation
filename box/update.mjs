// Updating the box and going back (#65 decisions 8 to 12). `start()` is what
// `box` does on a press: it starts the one-shot container `rails49-update`
// from the target release's `installation-box` image, with the socket, in no
// compose project. `run()` is what that container does, run as
//
//     node /box/update.mjs <update|back> <from> <to>
//
// It brings the release's box files to `/var/lib/rails49/releases/<to>/`,
// pulls every image of every declared stack, and only then brings the stacks
// up in order. It passes when every container is still running after 60
// seconds and the probe passes. It appends one line to the record, and after
// a pass prunes what neither release uses. What it is doing is in `PROGRESS`,
// which the status page reads.
//
// The docker CLI, the box's files, GitHub, the probe and the clock are handed
// in as `io`, so this reads nothing itself.

import { execFile } from "node:child_process";
import { appendFile, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";

import { backTo, CHECK, currentRelease, declared, manifestPath, message, PROGRESS, RECORD, RELEASES } from "./status.mjs";

const DOWNLOAD = "https://github.com/rails49/installation/releases/download";
const CONTAINER = "rails49-update";
const WAIT = 60_000;

/**
 * @typedef {{
 *   docker: (args: string[]) => Promise<string>,
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
 * `download` writes what a URL answers to a file. `unpack` unpacks a
 * `.tar.gz` into a directory. `remove` removes a file or a directory and what
 * is in it, and nothing where there is none. `list` is the names in a
 * directory. `append` makes the file's directory where there is none.
 * `probe` runs `scripts/probe.sh` with the arguments.
 *
 * @typedef {{ BOX_DOMAIN: string, BOX_UIS: string, hostname: string, address: string }} Env
 *
 * @typedef {{ Name: string, Image: string, State: { Status: string, StartedAt: string }, Config: { Labels: Record<string, string> | null } }} Container
 */

/** A step that failed, said in a sentence. */
class Failure extends Error {}

/**
 * The progress file's text: what runs, the step it is at, and once it has
 * finished, when, whether it passed, and why not.
 *
 * @param {{ action: "update" | "back", from: string, to: string, started: string, step: string }} run
 * @param {{ finished: Date, passed: boolean, failure: string | null } | null} result
 */
function progressText(run, result) {
  const finished = result?.finished.toISOString() ?? null;
  return `${JSON.stringify({ ...run, finished, passed: result?.passed ?? null, failure: result?.failure ?? null })}\n`;
}

/**
 * @param {"update" | "back"} action
 * @param {string} from the release the box runs, or `-`
 * @param {string} to
 * @param {Env} env
 * @param {Io} io
 */
export async function run(action, from, to, env, io) {
  const started = io.now().toISOString();
  /** @param {string} step @param {{ passed: boolean, failure: string | null } | null} [result] */
  const progress = (step, result = null) =>
    io.write(PROGRESS, progressText({ action, from, to, started, step }, result && { ...result, finished: io.now() }));

  const stacks = declared(env.BOX_UIS);
  const dir = `${RELEASES}/${to}`;
  /** @param {(typeof stacks)[number]} stack @param {string[]} args */
  const compose = (stack, args) =>
    io.docker([
      "compose",
      "--env-file",
      "/etc/rails49/box.env",
      ...(stack.env ? ["--env-file", `/etc/rails49/${stack.env}`] : []),
      ...stack.files.flatMap((file) => ["-f", `${dir}/${file}`]),
      ...args,
    ]);

  /** @type {string | null} */
  let failure = null;
  /** @type {Set<string>} */
  let ran = new Set();
  try {
    if ((await io.read(manifestPath(to))) === null) {
      await progress(`Downloading release ${to}.`);
      await download(to, io).catch((error) => {
        throw new Failure(`Could not download release ${to}: ${sentence(error)}`);
      });
    }

    ran = new Set((await containers(stacks, io)).map((c) => c.Image));

    for (const stack of stacks) {
      await progress(`Pulling ${stack.stack}'s images.`);
      try {
        if (stack.stack === "jmri") {
          await compose(stack, ["build", "--pull"]);
        } else {
          const images = (await compose(stack, ["config", "--images"])).split("\n").filter(Boolean);
          for (const image of images) await io.docker(["pull", image]);
        }
      } catch (error) {
        throw new Failure(`Could not pull ${stack.stack}'s images for release ${to}: ${sentence(error)}`);
      }
    }

    for (const stack of stacks) {
      await progress(`Starting ${stack.stack}.`);
      await compose(stack, ["up", "-d", "--no-build", "--pull", "never", "--remove-orphans"]).catch((error) => {
        throw new Failure(`${stack.stack} did not start on release ${to}: ${sentence(error)}`);
      });
    }

    await progress("Waiting 60 seconds to see that every container keeps running.");
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
        const after = action === "update" ? "the update" : "going back";
        throw new Failure(`${stack.stack} is not running 60 seconds after ${after}: ${problems.join(", ")}.`);
      }
    }

    await progress("Probing every way into every UI.");
    const labels = env.BOX_UIS.split(/\s+/).filter(Boolean);
    const probed = await io.probe([env.address, env.hostname, env.BOX_DOMAIN, ...labels]);
    if (!probed.ok) {
      const wrong = probed.output.split("\n").filter((line) => line.startsWith("FAIL"));
      throw new Failure(`The probe got answers it did not want: ${wrong.join("; ")}`);
    }
  } catch (error) {
    const what = action === "update" ? "update to" : "going back to";
    failure = error instanceof Failure ? error.message : `The ${what} ${to} stopped: ${sentence(error)}`;
  }

  const passed = failure === null;
  await io.append(RECORD, `${started.slice(0, 19)}Z  ${from}  ->  ${to}  ${passed ? "passed" : "failed"}\n`);
  // Only after an update: going back after a failed one would otherwise
  // leave the release before it with no files and no images.
  if (passed && action === "update") {
    await progress("Removing what neither release uses.");
    await prune([to, from].filter((release) => release !== "-"), ran, io);
  }
  await progress(passed ? "Done." : "Failed.", { passed, failure });
}

/**
 * The release's manifest and box files, unpacked beside it into a directory
 * that only gets the release's name once all of it is there.
 *
 * @param {string} release
 * @param {Io} io
 */
async function download(release, io) {
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
  const ids = (await io.docker(["ps", "-aq"])).split("\n").filter(Boolean);
  /** @type {Container[]} */
  const all = ids.length ? JSON.parse(await io.docker(["inspect", ...ids])) : [];
  const projects = stacks.map((s) => s.project);
  return all.filter((c) => projects.includes(c.Config.Labels?.["com.docker.compose.project"] ?? ""));
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
  /** @type {Set<string>} */
  const used = new Set();
  /** @type {Set<string>} */
  const stock = new Set();
  for (const release of keep) {
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

/**
 * Starts `rails49-update` for an update to the latest release or for going
 * back, and answers null; or answers in a sentence why not. Nothing it runs
 * takes anything from the request: the release is the latest the last check
 * found, or the one the record says the box ran before.
 *
 * @param {"update" | "back"} action
 * @param {Omit<Env, "address"> & { address: string | null }} env
 * @param {{ docker: Io["docker"], read: Io["read"], write: Io["write"], now: Io["now"], fetch: (url: string, init?: RequestInit) => Promise<Response> }} io
 * @returns {Promise<string | null>}
 */
export async function start(action, env, io) {
  const state = (await io.docker(["ps", "-a", "--filter", `name=^${CONTAINER}$`, "--format", "{{.State}}"])).trim();
  if (state === "running") return "An update or going back is running.";

  const from = (await currentRelease(io.read)) ?? "-";
  /** @type {string | null} */
  let to;
  /** @type {{ stacks: { installation: { commit: string, images: Record<string, string> } } }} */
  let manifest;
  if (action === "update") {
    const text = await io.read(CHECK);
    /** @type {string | null} */
    const latest = text ? JSON.parse(text).latest : null;
    if (!latest || latest === from) return "This box runs the latest release.";
    to = latest;
    const answer = await io.fetch(`${DOWNLOAD}/${to}/manifest.json`, { signal: AbortSignal.timeout(30_000) });
    if (!answer.ok) return `Could not read release ${to}'s manifest: GitHub answered ${answer.status}.`;
    manifest = /** @type {typeof manifest} */ (await answer.json());
  } else {
    to = await backTo(io.read);
    if (to === null) return "There is no release to go back to.";
    manifest = JSON.parse((await io.read(manifestPath(to))) ?? "null");
    if (manifest === null) return `Release ${to}'s files are not on this box.`;
  }
  const { commit, images } = manifest.stacks.installation;
  const image = `ghcr.io/rails49/installation-box:${commit}@${images["installation-box"]}`;

  if (state) await io.docker(["rm", CONTAINER]);
  // The page reads this file while the container runs, so the last run's
  // progress is replaced before it starts.
  await io.write(PROGRESS, progressText({ action, from, to, started: io.now().toISOString(), step: "Starting." }, null));
  // The probe asks for `<hostname>.local`, which nothing in a container
  // resolves, so it is named here.
  const host = env.address ? ["--add-host", `${env.hostname}.local:${env.address}`] : [];
  await io.docker([
    "run",
    "-d",
    "--name",
    CONTAINER,
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
    "-e",
    `BOX_HOSTNAME=${env.hostname}`,
    "-e",
    `BOX_ADDRESS=${env.address ?? ""}`,
    ...host,
    image,
    "node",
    "/box/update.mjs",
    action,
    from,
    to,
  ]);
  return null;
}

/** An error's message as the end of a sentence.
 *  @param {unknown} error */
function sentence(error) {
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
  if ((action !== "update" && action !== "back") || !from || !to) {
    console.error("usage: node /box/update.mjs <update|back> <from> <to>");
    process.exit(2);
  }
  const env = {
    BOX_DOMAIN: process.env.BOX_DOMAIN ?? "",
    BOX_UIS: process.env.BOX_UIS ?? "",
    hostname: process.env.BOX_HOSTNAME ?? "",
    address: process.env.BOX_ADDRESS ?? "",
  };
  await run(action, from, to, env, {
    docker,
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
  });
}
