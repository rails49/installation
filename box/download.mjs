// Downloading a release (#121): fetching a newer release's files and images
// while the box keeps running its current release, so that updating to it
// only restarts the stacks. `begin()` is what `box` does after a check and
// as it starts: where the last check named a release newer than both the one
// the box runs and the one it has downloaded, it starts the one-shot
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
// first pull it compares the bytes it is to download with free disk. What it
// is doing is in `DOWNLOADING`, which the status page reads.

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
  RELEASES,
} from "./status.mjs";
import { boxImage, composed, counted, download, DOWNLOAD, oneShot, pinned, pull, sentence, stateOf, tally, updater } from "./update.mjs";

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
 * free where it did not download for want of room.
 *
 * @typedef {{
 *   release: string,
 *   started: string,
 *   finished: string | null,
 *   downloaded: boolean,
 *   failure: string | null,
 *   disk: { needs: number, free: number } | null,
 *   bytes: import("./update.mjs").Bytes | null,
 * }} Download
 *
 * @typedef {Pick<import("./update.mjs").Io, "docker" | "pull" | "download" | "unpack" | "rename" | "remove" | "list" | "read" | "write" | "now"> & { free: () => Promise<number> }} Io
 *
 * `free` is the bytes free on the file system Docker keeps its images on.
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

    let index = 0;
    for (const image of images) {
      index += 1;
      await pull(image, index, images.length, bytes, io, async ({ run }) => {
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
 * The release to download now, or null: the one the last check named, where
 * it is newer than the one the box runs and than the one it has downloaded or
 * is downloading. A download of it that stopped before it finished, as at a
 * reboot, carries on. One that failed is tried again only after a check that
 * came after it.
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
  if (last === null || older(last.release, latest)) return latest;
  if (last.release !== latest) return null;
  if (last.downloaded) return (await read(manifestPath(latest))) === null ? latest : null;
  if (last.finished !== null && !(check.checked && check.checked > last.finished)) return null;
  return latest;
}

/**
 * Starts `rails49-download` for the release `wanted()` names, and answers
 * it; or answers null and starts nothing, where there is none, where a
 * download runs already, or while the box updates, goes back or applies the
 * setup. The release's manifest comes from GitHub, for its box image.
 *
 * @param {{ BOX_DOMAIN: string, BOX_UIS: string }} env
 * @param {{ docker: Io["docker"], read: Io["read"], write: Io["write"], now: Io["now"], fetch: (url: string, init?: RequestInit) => Promise<Response> }} io
 * @returns {Promise<string | null>}
 */
export async function begin(env, io) {
  const to = await wanted(io.read);
  if (to === null) return null;
  if ((await stateOf(CONTAINER, io.docker)) === "running" || (await updater(io.docker)) === "running") return null;
  const from = (await currentRelease(io.read)) ?? "-";
  const image =
    (await boxImage(to, io.read)) ??
    (await (async () => {
      const answer = await io.fetch(`${DOWNLOAD}/${to}/manifest.json`, { signal: AbortSignal.timeout(30_000) });
      if (!answer.ok) throw new Error(`could not read release ${to}'s manifest: GitHub answered ${answer.status}`);
      const { commit, images } = (await answer.json()).stacks.installation;
      return `ghcr.io/rails49/installation-box:${commit}@${images["installation-box"]}`;
    })());
  const started = await oneShot(CONTAINER, image, [], ["node", "/box/update.mjs", "download", from, to], env, io, () =>
    io.write(
      DOWNLOADING,
      text({
        release: to,
        started: io.now().toISOString(),
        finished: null,
        downloaded: false,
        failure: null,
        disk: null,
        bytes: null,
      }),
    ),
  );
  return started ? to : null;
}
