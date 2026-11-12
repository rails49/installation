/**
 * The setup on the status page (#69 decisions 10 to 15), asserted against
 * `form()`, what the page shows, and `apply()`, what a press of "Apply"
 * does. The box's files, its `/dev`, the docker CLI and starting
 * `rails49-update` are handed in, so a test needs no box.
 */

import { describe, expect, it } from "vitest";

import { apply, form, type Io } from "../box/setup.mjs";

const BOX = "/etc/rails49/box.env";
const DCCEX = "/etc/rails49/dccex.env";
const OCCUPANCY = "/etc/rails49/occupancy.env";
const RECORD = "/var/lib/rails49/deploys/installation";

const STATION = "/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0";
const CAMERA = "/dev/v4l/by-id/usb-046d_HD_Pro_Webcam_C920-video-index0";

/** A box on release 2026.11.0 with the files given, a station and a camera
 *  plugged in, and no update running unless `state` says so. */
function box(options: { files?: Record<string, string>; state?: string; refusal?: string | null } = {}) {
  const files: Record<string, string> = {
    [BOX]: 'BOX_DOMAIN=\nBOX_UIS=\n',
    [RECORD]: "2026-11-10T09:00:00Z  -  ->  2026.11.0  passed\n",
    ...options.files,
  };
  const started: string[] = [];
  const io: Io = {
    read: async (path) => files[path] ?? null,
    write: async (path, text) => void (files[path] = text),
    list: async (dir) =>
      ({
        "/dev/serial/by-id": ["usb-1a86_USB_Serial-if00-port0"],
        "/dev/v4l/by-id": ["usb-046d_HD_Pro_Webcam_C920-video-index0", "usb-046d_HD_Pro_Webcam_C920-video-index1"],
      })[dir] ?? [],
    docker: async () => options.state ?? "",
    start: async (uis) => {
      started.push(uis);
      return options.refusal ?? null;
    },
  };
  return { io, files, started };
}

/** A form as the page posts it. */
function post(uis: string[], station = "/dev/serial/by-id/none", camera = "/dev/v4l/by-id/none") {
  const body = new URLSearchParams(uis.map((ui) => ["ui", ui]));
  body.set("station", station);
  body.set("camera", camera);
  return body;
}

describe("applying", () => {
  it("writes BOX_UIS with control ticked for dccex, keeping every other line", async () => {
    const { io, files, started } = box({
      files: { [BOX]: "# the box\nBOX_DOMAIN=\nBOX_UIS=\nEXTRA=1\n" },
    });
    expect(await apply(post(["dccex"]), io)).toBeNull();
    expect(files[BOX]).toBe('# the box\nBOX_DOMAIN=\nBOX_UIS="control dccex"\nEXTRA=1\n');
    expect(started).toEqual(["control dccex"]);
  });
});

describe("applying the devices", () => {
  it("writes the station into dccex.env and the camera into occupancy.env, keeping a line added by hand", async () => {
    const { io, files } = box({
      files: {
        [DCCEX]: "DCCEX_STORE_URL=http://store:8765\nDCCEX_STATION_DEVICE=/dev/serial/by-id/old\n",
        [OCCUPANCY]: "TC49_UID=999\nOCCUPANCY_ARCHIVES=/var/lib/rails49/tc49/occupancy\n",
      },
    });
    expect(await apply(post(["dccex", "occupancy"], STATION, CAMERA), io)).toBeNull();
    expect(files[DCCEX]).toBe(`DCCEX_STORE_URL=http://store:8765\nDCCEX_STATION_DEVICE=${STATION}\n`);
    expect(files[OCCUPANCY]).toBe(
      `TC49_UID=999\nOCCUPANCY_ARCHIVES=/var/lib/rails49/tc49/occupancy\nOCCUPANCY_CAMERA=${CAMERA}\n`,
    );
  });

  it("writes a path that names no device for none, and makes a file where there is none", async () => {
    const { io, files } = box();
    expect(await apply(post(["control"]), io)).toBeNull();
    expect(files[DCCEX]).toBe("DCCEX_STATION_DEVICE=/dev/serial/by-id/none\n");
    expect(files[OCCUPANCY]).toBe("OCCUPANCY_CAMERA=/dev/v4l/by-id/none\n");
  });

  it("keeps a device written by hand that is not plugged in now", async () => {
    const away = "/dev/v4l/by-id/usb-away-video-index0";
    const { io, files } = box({ files: { [OCCUPANCY]: `OCCUPANCY_CAMERA=${away}\n` } });
    expect(await apply(post(["occupancy"], STATION, away), io)).toBeNull();
    expect(files[OCCUPANCY]).toBe(`OCCUPANCY_CAMERA=${away}\n`);
  });
});

describe("applying is refused, and writes nothing,", () => {
  async function refused(on: ReturnType<typeof box>, posted: URLSearchParams) {
    const before = { ...on.files };
    const refusal = await apply(posted, on.io);
    expect(on.files).toEqual(before);
    expect(on.started).toEqual([]);
    return refusal;
  }

  it("while an update, going back or applying runs", async () => {
    expect(await refused(box({ state: "running\n" }), post(["control"]))).toBe(
      "The box is already updating, going back or applying the setup.",
    );
  });

  it("on a box that runs no release", async () => {
    expect(await refused(box({ files: { [RECORD]: "" } }), post(["control"]))).toBe(
      "This box runs no release yet, so there is none to apply the setup at.",
    );
  });

  it("for a stack the box cannot run", async () => {
    expect(await refused(box(), post(["control", "turntable"]))).toBe("turntable is not a stack this box can run.");
    expect(await refused(box(), post(["control\nBOX_DOMAIN=evil.example"]))).toBe(
      "control\nBOX_DOMAIN=evil.example is not a stack this box can run.",
    );
  });

  it("for a device that is not plugged in", async () => {
    expect(await refused(box(), post(["dccex"], "/dev/serial/by-id/usb-other"))).toBe(
      "/dev/serial/by-id/usb-other is not a command station plugged into this box.",
    );
    expect(await refused(box(), post(["occupancy"], STATION, "/dev/video0\nX=1"))).toBe(
      "/dev/video0\nX=1 is not a camera plugged into this box.",
    );
    expect(await refused(box(), post(["occupancy"], STATION, STATION))).toBe(
      `${STATION} is not a camera plugged into this box.`,
    );
  });
});

describe("applying when the update will not start", () => {
  it("answers why", async () => {
    const { io } = box({ refusal: "Release 2026.11.0's files are not on this box." });
    expect(await apply(post(["control"]), io)).toBe("Release 2026.11.0's files are not on this box.");
  });
});

describe("what the page offers", () => {
  it("is the stacks box.env declares, and each device named and plugged in", async () => {
    const { io } = box({
      files: {
        [BOX]: 'BOX_DOMAIN=\nBOX_UIS="control occupancy"\n',
        [OCCUPANCY]: `OCCUPANCY_CAMERA=${CAMERA}\n`,
      },
    });
    const offered = await form(io);
    expect(offered.uis).toEqual(["control", "occupancy"]);
    expect(offered.devices.map(({ field, none, current, found }) => ({ field, none, current, found }))).toEqual([
      { field: "station", none: "/dev/serial/by-id/none", current: null, found: [STATION] },
      {
        field: "camera",
        none: "/dev/v4l/by-id/none",
        current: CAMERA,
        found: [CAMERA, "/dev/v4l/by-id/usb-046d_HD_Pro_Webcam_C920-video-index1"],
      },
    ]);
  });

  it("leaves out a device whose name an env file cannot hold unquoted", async () => {
    const { io } = box();
    io.list = async (dir) => (dir === "/dev/serial/by-id" ? ["usb-$HOME", "usb a", "usb-ok_1:2"] : []);
    expect((await form(io)).devices[0]!.found).toEqual(["/dev/serial/by-id/usb-ok_1:2"]);
  });

  it("is nothing ticked on a box that serves nothing yet", async () => {
    expect((await form(box().io)).uis).toEqual([]);
  });
});
