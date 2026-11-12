// The setup on the status page (#69 decisions 10 to 15): which stacks the box
// runs, and the station's and the camera's devices. `form()` is what the page
// shows. `apply()` is a press of "Apply": it writes `BOX_UIS` into `box.env`
// and the device lines into `dccex.env` and `occupancy.env`, keeping every
// line it does not write, and starts `rails49-update` at the current release.
//
// The box's files, its `/dev`, the docker CLI and starting the update are
// handed in as `io`, so this reads nothing itself.

import { currentRelease, STACKS } from "./status.mjs";
import { BUSY, NO_RELEASE, updater } from "./update.mjs";

/**
 * @typedef {{
 *   read: (path: string) => Promise<string | null>,
 *   write: (path: string, text: string) => Promise<void>,
 *   list: (dir: string) => Promise<string[]>,
 *   docker: (args: string[]) => Promise<string>,
 *   start: (uis: string, domain: string) => Promise<string | null>,
 * }} Io
 *
 * `read` is a file's text, or null where there is none. `list` is the names
 * in a directory of the box's `/dev`, and none where there is none. `start`
 * starts `rails49-update` at the current release for the stacks `uis`
 * declares and the box name `domain`, and answers null, or why not in a
 * sentence.
 */

const BOX = "/etc/rails49/box.env";

/** The labels the page offers, in the order `BOX_UIS` lists them. */
export const LABELS = STACKS.flatMap(({ label }) => (label ? [label] : []));

/** The devices the page offers: the form's field, the directory of the box's
 *  `/dev` it lists, which of the names there it offers, and the line it
 *  writes into which stack's file. `none` is a path in that directory that
 *  names no device, with which the stack still runs and reports the device
 *  missing. */
const DEVICES = [
  {
    field: "station",
    what: "command station",
    dir: "/dev/serial/by-id",
    offers: () => true,
    key: "DCCEX_STATION_DEVICE",
    path: "/etc/rails49/dccex.env",
  },
  {
    field: "camera",
    what: "camera",
    dir: "/dev/v4l/by-id",
    // udev ends the name with the device's sysfs `index`, which is 0 on the
    // one that captures video; a UVC camera's `index1` is its metadata
    // device, which gives no picture (#87).
    /** @param {string} name */
    offers: (name) => name.endsWith("-video-index0"),
    key: "OCCUPANCY_CAMERA",
    path: "/etc/rails49/occupancy.env",
  },
].map((device) => ({ ...device, none: `${device.dir}/none` }));

/** A name under `by-id` that can stand unquoted in an env file. A name
 *  outside it is not offered. */
const NAME = /^[\w.:+@-]+$/;

/**
 * What the page offers: the stacks `box.env` declares, and for each device
 * the one its stack's file names, or null, and the ones plugged in.
 *
 * @param {Io} io
 */
export async function form(io) {
  const uis = (setting((await io.read(BOX)) ?? "", "BOX_UIS") ?? "").split(/\s+/).filter(Boolean);
  const devices = await Promise.all(
    DEVICES.map(async (device) => ({ field: device.field, what: device.what, none: device.none, ...(await offered(device, io)) })),
  );
  return { uis, devices };
}

/**
 * The device the stack's file names, or null, and the ones plugged in.
 *
 * @param {(typeof DEVICES)[number]} device @param {Io} io
 */
async function offered({ dir, offers, key, path }, io) {
  return {
    current: setting((await io.read(path)) ?? "", key),
    found: (await io.list(dir)).filter((name) => NAME.test(name) && offers(name)).map((name) => `${dir}/${name}`),
  };
}

/**
 * Applies the form the page posted, and answers null; or answers in a
 * sentence why not, having written nothing.
 *
 * @param {URLSearchParams} posted
 * @param {Io} io
 * @returns {Promise<string | null>}
 */
export async function apply(posted, io) {
  const ticked = posted.getAll("ui");
  const unknown = ticked.find((label) => !LABELS.includes(label));
  if (unknown !== undefined) return `${unknown} is not a stack this box can run.`;
  // Each of the others dials control's broker or reads `control.env`, so
  // ticking any of them ticks control (decision 10).
  const uis = LABELS.filter((label) => (label === "control" ? ticked.length > 0 : ticked.includes(label))).join(" ");

  // A device the page did not offer is refused; one left out of the form is
  // left as it is.
  /** @type {[(typeof DEVICES)[number], string][]} */
  const chosen = [];
  for (const device of DEVICES) {
    const value = posted.get(device.field);
    if (value === null) continue;
    const { current, found } = await offered(device, io);
    if (value !== device.none && value !== current && !found.includes(value)) {
      return `${value} is not a ${device.what} plugged into this box.`;
    }
    chosen.push([device, value]);
  }

  if ((await updater(io.docker)) === "running") return BUSY;
  if ((await currentRelease(io.read)) === null) return NO_RELEASE;

  await rewrite(BOX, "BOX_UIS", `"${uis}"`, io);
  for (const [{ key, path }, value] of chosen) await rewrite(path, key, value, io);
  // The box name as `box.env` declares it now, which a person may have
  // written there since `box` started (README's "A box name").
  return await io.start(uis, setting((await io.read(BOX)) ?? "", "BOX_DOMAIN") ?? "");
}

/**
 * The value the env file's text sets `key` to, without its quotes, or null
 * where it sets none.
 *
 * @param {string} text @param {string} key
 */
function setting(text, key) {
  const value = text.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim();
  return value === undefined ? null : value.replace(/^(["'])(.*)\1$/, "$2");
}

/**
 * Writes `key=value` into the file at `path` in place of the line that set
 * `key`, or at its end, and keeps every other line.
 *
 * @param {string} path @param {string} key @param {string} value @param {Io} io
 */
async function rewrite(path, key, value, io) {
  const text = (await io.read(path)) ?? "";
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  const rewritten = pattern.test(text) ? text.replace(pattern, line) : `${text}${text && !text.endsWith("\n") ? "\n" : ""}${line}\n`;
  await io.write(path, rewritten);
}
