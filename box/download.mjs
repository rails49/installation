// Downloading a release (#121): fetching a newer release's files and images
// while the box keeps running its current release, so that updating to it
// only restarts the stacks. `begin()` is what `box` does after a check and
// as it starts: where the last check named a release newer than the one the
// box runs and not the one it has downloaded (#126), it starts the one-shot
// container `rails49-download` from that release's `installation-box` image,
// as ADR-0006 starts `rails49-update`. `run()` is what that container does,
// run as
//
//     node /box/update.mjs download <from> <to>
//
// It brings the release's box files to `/var/lib/rails49/releases/<to>/`,
// removes the release it downloaded before, with the images neither the
// release the box runs nor the one to go back to uses, and pulls every image
// of every declared stack. It stops or recreates no container. Before the
// first pull it compares the bytes it is to download with free disk, and
// between pulls it stops where less than `SPARE` is free (#129). What it is
// doing is in `DOWNLOADING`, which the status page reads.

import {
  backTo,
  CHECK,
  currentRelease,
  declared,
  DOWNLOADING,
  gb,
  manifestPath,
  message,
  older,
  PROGRESS,
  RELEASES,
} from "./status.mjs";
import { boxImage, composed, counted, download, DOWNLOAD, oneShot, pinned, pull, sentence, stateOf, tally, toPull, updater } from "./update.mjs";

const CONTAINER = "rails49-download";
/** What a download leaves free on the disk, beyond what it downloads. */
export const SPARE = 1e9;
/** The least time between two writes of the file while it pulls. */
const EVERY = 1000;

/**
 * What `DOWNLOADING` holds: the release, when the download began and when it
 * finished, null until then, whether it has downloaded every file and image,
 * why not in a sentence, and the run's bytes downloaded of its total, null
 * where the manifest lists no layers. `disk` is what it needed and what was
 * free where it did not download for want of room, or what the box keeps
 * free and what was where it stopped between image pulls (#129).
 *
 * @typedef {{
 *   release: string,
 *   started: string,
 *   finished: string | null,
 *   downloaded: boolean,
 *   failure: string | null,
 *   disk: { needs: number, free: number } | { keeps: number, free: number } | null,
 *   bytes: import("./update.mjs").Bytes | null,
 * }} Download
 *
 * @typedef {Pick<import("./update.mjs").Io, "docker" | "pull" | "download" | "unpack" | "rename" | "remove" | "list" | "read" | "write" | "now"> & { free: () => Promise<number> }} Io
 *
 * `free` is the bytes free on the file system Docker keeps its images on.
 *
 * @typedef {{ docker: Io["docker"], read: Io["read"], write: Io["write"], now: Io["now"], fetch: (url: string, init?: RequestInit) => Promise<Response> }} StartIo
 *
 * What `begin()` is handed: the release's manifest comes from GitHub.
 */

/** A step that failed, said in a sentence. */
class Failure extends Error {}

/** @param {Download} download */
function text(download) {
  return `${JSON.stringify(download)}\n`;
}

/**
 * @param {string} from the release the box runs, or `-`
 * @param {string} to
 * @param {{ BOX_DOMAIN: string, BOX_UIS: string }} env
 * @param {Io} io
 */
export async function run(from, to, env, io) {
  /** @type {Download} */
  const state = {
    release: to,
    started: io.now().toISOString(),
    finished: null,
    downloaded: false,
    failure: null,
    disk: null,
    bytes: null,
  };
  let written = -Infinity;
  const save = () => {
    written = io.now().getTime();
    return io.write(DOWNLOADING, text(state));
  };
  await save();

  try {
    if ((await io.read(manifestPath(to))) === null) {
      await download(to, io).catch((error) => {
        throw new Failure(sentence(error));
      });
    }

    // The box keeps the release it runs, the one to go back to, and this one.
    const back = await backTo(io.read);
    const keep = [from, back, to].filter((release) => release !== null && release !== "-");
    await drop(/** @type {string[]} */ (keep), io);

    // JMRI is built on the box, by the update.
    const stacks = declared(env.BOX_UIS).filter(({ stack }) => stack !== "jmri");
    /** @type {string[]} */
    const images = [];
    for (const stack of stacks) {
      const listed = await composed(stack, to, env, io.docker, ["config", "--images"]).catch((error) => {
        throw new Failure(`Could not list ${stack.stack}'s images: ${sentence(error)}`);
      });
      images.push(...listed.split("\n").filter(Boolean));
    }

    const bytes = await tally(images, to, io);
    if (bytes) {
      const needs = counted(bytes).total + SPARE;
      const free = await io.free();
      if (free < needs) {
        state.disk = { needs, free };
        throw new Failure(`Not enough free disk to download ${to}: it needs ${gb(needs)}, ${gb(free)} is free.`);
      }
      state.bytes = counted(bytes);
    }

    const pulling = await toPull(images, io);
    let index = 0;
    for (const image of pulling) {
      // An image unpacks to more than its layers, and the registry says not
      // how much: the box keeps SPARE free as it pulls (#129).
      if (index > 0) {
        const free = await io.free();
        if (free < SPARE) {
          state.disk = { keeps: SPARE, free };
          throw new Failure(`Stopped downloading ${to}: ${gb(free)} is free, and the box keeps ${SPARE / 1e9} GB free.`);
        }
      }
      index += 1;
      await pull(image, index, pulling.length, bytes, io, async ({ run }) => {
        state.bytes = run ?? null;
        if (io.now().getTime() - written >= EVERY) await save();
      }).catch((error) => {
        throw new Failure(`Could not pull ${image.replace(/@.*$/, "")}: ${sentence(error)}`);
      });
    }
    state.downloaded = true;
  } catch (error) {
    state.failure = error instanceof Failure ? error.message : sentence(error);
  }
  state.finished = io.now().toISOString();
  await save();
}

/**
 * Removes the files of every release but the kept ones, and each image they
 * pin that no kept release pins and no container runs. Nothing goes where no
 * other release's files are on the box.
 *
 * @param {string[]} keep
 * @param {Io} io
 */
async function drop(keep, io) {
  const stale = (await io.list(RELEASES)).filter((name) => !keep.includes(name));
  if (!stale.length) return;
  const { used } = await pinned(keep, io);
  const { used: theirs } = await pinned(stale, io);
  const ids = (await io.docker(["ps", "-aq"])).split("\n").filter(Boolean);
  const ran = new Set(
    ids.length ? (await io.docker(["inspect", "--format", "{{.Image}}", ...ids]).catch(() => "")).split("\n") : [],
  );
  const listed = await io.docker(["image", "ls", "--digests", "--no-trunc", "--format", "{{json .}}"]);
  for (const line of listed.split("\n").filter(Boolean)) {
    /** @type {{ Repository: string, Digest: string, ID: string }} */
    const image = JSON.parse(line);
    const ref = `${image.Repository}@${image.Digest}`;
    if (!theirs.has(ref) || used.has(ref) || ran.has(image.ID)) continue;
    await io.docker(["image", "rm", ref]).catch((error) => console.error(`removing ${ref}: ${message(error)}`));
  }
  for (const name of stale) await io.remove(`${RELEASES}/${name}`);
}

/**
 * Whether the check's latest release is downloaded: `download`, what
 * `DOWNLOADING` holds, names it and has downloaded it. The page's "Update to"
 * offer, `start("update")` and `wanted()` each ask this (#126).
 *
 * @param {string | null | undefined} latest
 * @param {{ release?: string, downloaded?: boolean } | null | undefined} download
 * @returns {boolean}
 */
export function isDownloaded(latest, download) {
  return Boolean(latest) && download?.release === latest && download?.downloaded === true;
}

/**
 * The release the status page offers "Update to" for, or null: the one the
 * last check named, where it is newer than the one the box runs and
 * downloaded, and no update, going back or applying the setup runs. It reads
 * files and runs no Docker command (#147), so it takes a run to be going
 * until `update.json` says when it finished. After a run that stopped before
 * it finished, as at a reboot, the page offers the update again and this
 * answers null until the next run.
 *
 * @param {(path: string) => Promise<string | null>} read
 * @returns {Promise<string | null>}
 */
export async function offered(read) {
  /** @type {{ finished: string | null } | null} */
  const progress = JSON.parse((await read(PROGRESS)) || "null");
  if (progress !== null && progress.finished === null) return null;
  /** @type {{ latest?: string | null }} */
  const check = JSON.parse((await read(CHECK)) || "{}");
  const latest = check.latest ?? null;
  const runs = await currentRelease(read);
  if (latest === null || (runs !== null && !older(runs, latest))) return null;
  return isDownloaded(latest, JSON.parse((await read(DOWNLOADING)) || "null")) ? latest : null;
}

/**
 * The release to download now, or null: the one the last check named, where
 * it is newer than the one the box runs and not the one it has downloaded or
 * is downloading. The downloaded release follows the check: one the check no
 * longer names, newer or older, goes as this one downloads (#126). A download
 * of it that stopped before it finished, as at a reboot, carries on. One that
 * failed is tried again only after a check that came after it.
 *
 * @param {(path: string) => Promise<string | null>} read
 * @returns {Promise<string | null>}
 */
export async function wanted(read) {
  /** @type {{ latest?: string | null, checked?: string | null }} */
  const check = JSON.parse((await read(CHECK)) || "{}");
  const latest = check.latest ?? null;
  const runs = await currentRelease(read);
  if (latest === null || (runs !== null && !older(runs, latest))) return null;
  /** @type {Download | null} */
  const last = JSON.parse((await read(DOWNLOADING)) || "null");
  if (last === null || last.release !== latest) return latest;
  if (isDownloaded(latest, last)) return (await read(manifestPath(latest))) === null ? latest : null;
  if (last.finished !== null && !(check.checked && check.checked > last.finished)) return null;
  return latest;
}

/**
 * The `begin()` in flight: `named` settles once it has written `DOWNLOADING`
 * or has ended, and `written` says it has written it (#132).
 *
 * @type {{ named: Promise<void>, written: boolean } | null}
 */
let flight = null;

/**
 * Whether a `begin()` has named its release in `DOWNLOADING` and not yet
 * ended: from then until `rails49-download` starts, as the release's box
 * image pulls, the download runs (#132).
 */
export function starting() {
  return flight?.written ?? false;
}

/**
 * Starts `rails49-download` for the release `wanted()` names, and answers
 * it; or answers null and starts nothing, where there is none, where a
 * download runs already, or while the box updates, goes back or applies the
 * setup. The release's manifest comes from GitHub, for its box image.
 *
 * It writes `DOWNLOADING` before its first step that can fail, and a step
 * that fails before the container starts is the download's failure there, as
 * one inside the container is (#124); it then throws, for the log. `begun`
 * is called once `DOWNLOADING` names the release, before the image pulls.
 *
 * A `begin()` while another is in flight starts nothing and leaves
 * `DOWNLOADING` alone. It answers null once the other has written it or has
 * ended (#132).
 *
 * @param {{ BOX_DOMAIN: string, BOX_UIS: string }} env
 * @param {StartIo} io
 * @param {() => void} [begun]
 * @returns {Promise<string | null>}
 */
export async function begin(env, io, begun = () => {}) {
  if (flight) {
    await flight.named;
    return null;
  }
  let settle = () => {};
  const mine = { named: new Promise((resolve) => (settle = /** @type {() => void} */ (resolve))), written: false };
  flight = mine;
  try {
    return await launch(env, io, () => {
      mine.written = true;
      settle();
      begun();
    });
  } finally {
    flight = null;
    settle();
  }
}

/**
 * `begin()` with none in flight.
 *
 * @param {{ BOX_DOMAIN: string, BOX_UIS: string }} env
 * @param {StartIo} io
 * @param {() => void} begun
 * @returns {Promise<string | null>}
 */
async function launch(env, io, begun) {
  const to = await wanted(io.read);
  if (to === null) return null;
  if ((await stateOf(CONTAINER, io.docker)) === "running" || (await updater(io.docker)) === "running") return null;
  const from = (await currentRelease(io.read)) ?? "-";
  /** @type {Download} */
  const state = {
    release: to,
    started: io.now().toISOString(),
    finished: null,
    downloaded: false,
    failure: null,
    disk: null,
    bytes: null,
  };
  await io.write(DOWNLOADING, text(state));
  begun();
  try {
    const image = (await boxImage(to, io.read)) ?? (await fetchedBoxImage(to, io.fetch));
    const command = ["node", "/box/update.mjs", "download", from, to];
    const started = await oneShot(CONTAINER, image, [], command, env, io, async () => {}).catch((error) => {
      throw new Failure(`Could not start ${CONTAINER}: ${sentence(error)}`);
    });
    return started ? to : null;
  } catch (error) {
    state.failure = error instanceof Failure ? error.message : sentence(error);
    state.finished = io.now().toISOString();
    await io.write(DOWNLOADING, text(state));
    throw new Error(state.failure);
  }
}

/**
 * What `box` does after a check: `begin()`, answered once `DOWNLOADING` names
 * the release, or once there is none to download, while the release's box
 * image may still pull (#125). A failure goes to the log, and `begin()` has
 * recorded it in `DOWNLOADING` (#124); this never rejects.
 *
 * @param {{ BOX_DOMAIN: string, BOX_UIS: string }} env
 * @param {StartIo} io
 * @returns {Promise<void>}
 */
export function beginDownload(env, io) {
  return new Promise((resolve) => {
    begin(env, io, resolve).then(
      () => resolve(),
      (error) => {
        console.error(`downloading a new release: ${message(error)}`);
        resolve();
      },
    );
  });
}

/**
 * The box image of a release not on the box, from its manifest on GitHub.
 *
 * @param {string} release
 * @param {(url: string, init?: RequestInit) => Promise<Response>} fetch
 */
async function fetchedBoxImage(release, fetch) {
  const answer = await fetch(`${DOWNLOAD}/${release}/manifest.json`, { signal: AbortSignal.timeout(30_000) }).catch(
    (error) => {
      throw new Failure(`Could not read release ${release}'s manifest from GitHub: ${sentence(error)}`);
    },
  );
  if (!answer.ok) throw new Failure(`GitHub answered ${answer.status} for release ${release}'s manifest.`);
  /** @type {{ stacks: { installation: { commit: string, images: Record<string, string> } } }} */
  const manifest = await answer.json().catch((error) => {
    throw new Failure(`Could not read release ${release}'s manifest from GitHub: ${sentence(error)}`);
  });
  const { commit, images } = manifest.stacks.installation;
  return `ghcr.io/rails49/installation-box:${commit}@${images["installation-box"]}`;
}
