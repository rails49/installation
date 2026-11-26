// The release group while nothing runs: the release the box runs, what the
// last check found and how far its download has got, Update to, Revert to,
// the railroad, the last check and its switches.

import { describe, expect, it } from "vitest";

import { BoxRelease } from "../src/box-release.js";
import type { Download, Status } from "../src/status.js";
import { STATUS } from "./box.js";
import { mounted, part, reads } from "./mounted.js";

const RESTARTS = "The railroad stops while its stacks restart.";

/** STATUS on a box where no container of a declared stack runs but the
 *  installation's, which serves the page. */
const IDLE: Status = {
  ...STATUS,
  stacks: [STATUS.stacks[0]!, ...STATUS.stacks.slice(1).map((stack) => ({ ...stack, state: "stopped" as const }))],
};

/** A box with no box name that runs no release and has never checked. */
const PLAIN: Status = {
  ...STATUS,
  name: "box",
  release: null,
  update: {
    latest: null,
    prerelease: false,
    prereleases: false,
    download: true,
    available: false,
    newer: false,
    checked: null,
    succeeded: null,
    could_not_check: false,
    downloaded: false,
  },
  back: null,
};

/** `box-release`, mounted with `status`, `box` answering unless said. */
async function release(status: Status, answering = true): Promise<BoxRelease> {
  const shown = document.createElement("box-release");
  shown.status = status;
  shown.answering = answering;
  return mounted(shown);
}

/** Each row of the group, as `[what it says, its buttons and switches]`. A
 *  switch reads "<label>: on" or "off". */
function rows(shown: BoxRelease): [string, string[]][] {
  return [...shown.renderRoot.querySelectorAll(".row")].map((row) => [
    (row.querySelector("p")?.textContent ?? "").replace(/\s+/g, " ").trim(),
    [...row.querySelectorAll("sl-button, sl-switch")].map((control) => {
      const label = (control.textContent ?? "").trim();
      return control.localName === "sl-switch"
        ? `${label}: ${(control as HTMLInputElement).checked ? "on" : "off"}`
        : label;
    }),
  ]);
}

/** What the group says outside its rows, as the railroad sentence. */
function said(shown: BoxRelease): string[] {
  return [...shown.renderRoot.querySelectorAll("fieldset > p")].map((p) => (p.textContent ?? "").trim());
}

/** STATUS whose update is `update` and whose download is `download`,
 *  over STATUS's. */
function with_(update: Partial<Status["update"]>, download: Partial<Download> | null = {}): Status {
  return {
    ...STATUS,
    update: { ...STATUS.update, ...update },
    download: download && { ...STATUS.download!, ...download },
  };
}

describe("box-release", () => {
  it("says the release the box runs, what is out with the update to it, going back, and the last check", async () => {
    expect(reads(await release(STATUS), "fieldset.group legend")).toBe("Release");
    expect(rows(await release(STATUS))).toEqual([
      ["This box runs release 2026.11.0.", []],
      ["New release 2026.11.1 is available.", ["Update to 2026.11.1"]],
      ["", ["Revert to 2026.10.2"]],
      ["Checked at 2026-11-12 08:00 UTC.", ["Check for update"]],
      ["", ["Pre-releases: off", "Download automatically: on"]],
    ]);
    expect(rows(await release(PLAIN))).toEqual([
      ["This box runs no release yet.", []],
      ["Not checked yet.", ["Check for update"]],
      ["", ["Pre-releases: off", "Download automatically: on"]],
    ]);
  });

  it("says when the box runs the latest release, or none is out", async () => {
    const latest = await release(with_({ latest: "2026.11.0", available: false }));
    expect(rows(latest)[1]).toEqual(["It is the latest release.", []]);
    const none = await release({ ...with_({ latest: null, available: false }), release: null, back: null });
    expect(rows(none)[1]).toEqual(["No release is out yet.", []]);
  });

  it("says when the box runs a release newer than the latest, and offers no update to it", async () => {
    const newer = await release({
      ...with_({ latest: "2026.11.3", available: false, newer: true, downloaded: false }),
      release: "2026.11.5",
    });
    expect(rows(newer).slice(0, 2)).toEqual([
      ["This box runs release 2026.11.5.", []],
      ["It is newer than the latest release, 2026.11.3.", []],
    ]);
  });

  it("says it could not check, as the failure says", async () => {
    const offline = await release(with_({ checked: "2026-11-12T09:00:00.000Z", could_not_check: true }));
    expect(rows(offline).at(-2)).toEqual([
      "Could not check. The last check that succeeded was at 2026-11-12 08:00 UTC.",
      ["Check for update"],
    ]);
    const never = await release(with_({ checked: "2026-11-12T09:00:00.000Z", succeeded: null, could_not_check: true }));
    expect(rows(never).at(-2)![0]).toBe("Could not check. No check has succeeded yet.");
  });

  it("shows each switch on when it is on", async () => {
    const on = await release(with_({ prereleases: true, download: false }));
    expect(rows(on).at(-1)).toEqual(["", ["Pre-releases: on", "Download automatically: off"]]);
  });

  it("names a pre-release that is out, and the update to it, as a pre-release", async () => {
    const pre = await release(
      with_({ latest: "2026.11.2", prerelease: true, prereleases: true }, { release: "2026.11.2" }),
    );
    expect(rows(pre)[1]).toEqual(["New pre-release 2026.11.2 is available.", ["Update to pre-release 2026.11.2"]]);
  });

  it("says the railroad stops after Update to and Revert to, before the last check", async () => {
    const shown = await release(STATUS);
    expect(said(shown)).toEqual([RESTARTS]);
    const stops = part(shown, "fieldset > p");
    expect(stops.previousElementSibling?.textContent).toContain("Revert to 2026.10.2");
    expect(stops.nextElementSibling?.textContent).toContain("Checked at");
    // Update to alone, or Revert to alone, is enough.
    expect(said(await release({ ...STATUS, back: null }))).toEqual([RESTARTS]);
    expect(said(await release(with_({ latest: "2026.11.0", available: false })))).toEqual([RESTARTS]);
  });

  it("offers neither on a box with no newer release and nothing to go back to, and says nothing of the railroad", async () => {
    const shown = await release(PLAIN);
    expect(rows(shown).flatMap(([, controls]) => controls)).toEqual([
      "Check for update",
      "Pre-releases: off",
      "Download automatically: on",
    ]);
    expect(said(shown)).toEqual([]);
  });

  it("says nothing of the railroad stopping where no declared stack runs", async () => {
    const idle = await release(IDLE);
    expect(rows(idle)[1]).toEqual(["New release 2026.11.1 is available.", ["Update to 2026.11.1"]]);
    expect(said(idle)).toEqual([]);
    expect(said(await release({ ...STATUS, stacks: STATUS.stacks.slice(0, 1) }))).toEqual([]);
    // One stack running is enough.
    expect(said(await release({ ...IDLE, stacks: [...IDLE.stacks.slice(0, 2), STATUS.stacks[2]!] }))).toEqual([
      RESTARTS,
    ]);
  });

  it("offers going back alone when there is no newer release", async () => {
    const latest = await release(with_({ latest: "2026.11.0", available: false }));
    expect(rows(latest).flatMap(([, controls]) => controls).slice(0, 2)).toEqual([
      "Revert to 2026.10.2",
      "Check for update",
    ]);
  });

  it("disables every button and switch while box does not answer", async () => {
    const count = (shown: BoxRelease, disabled: boolean) =>
      [...shown.renderRoot.querySelectorAll("sl-button, sl-switch")].filter(
        (control) => (control as HTMLButtonElement).disabled === disabled,
      ).length;
    const quiet = await release(STATUS, false);
    expect([count(quiet, true), count(quiet, false)]).toEqual([5, 0]);
    quiet.answering = true;
    await quiet.updateComplete;
    expect([count(quiet, true), count(quiet, false)]).toEqual([0, 5]);
  });
});

describe("box-release while a newer release downloads", () => {
  const DOWNLOADING: Partial<Download> = {
    finished: null,
    downloaded: false,
    bytes: { current: 300e6, total: 1.6e9 },
    running: true,
  };
  /** STATUS with the download changed, `update.downloaded` as box derives
   *  it from the download. */
  const downloading = (download: Partial<Download> | null, update: Partial<Status["update"]> = {}) =>
    with_({ downloaded: false, ...update }, download);

  it("while it runs, says how far it has got under a bar of it, and offers no update", async () => {
    const shown = await release(downloading(DOWNLOADING));
    expect(rows(shown)[1]).toEqual(["New release 2026.11.1 is available. Downloaded 300 MB of 1.6 GB.", []]);
    const bar = part(shown, ".row sl-progress-bar");
    expect(bar.previousElementSibling?.localName).toBe("p");
    expect(bar.getAttribute("value")).toBe(String((300e6 / 1.6e9) * 100));
    expect(bar.getAttribute("label")).toBe("300 MB of 1.6 GB");
    const unsized = await release(downloading({ ...DOWNLOADING, bytes: null }));
    expect(rows(unsized)[1]![0]).toBe("New release 2026.11.1 is available. Downloading it.");
    expect(unsized.renderRoot.querySelector("sl-progress-bar")).toBeNull();
  });

  it("once downloaded, offers the update, and says the railroad stops while its stacks restart", async () => {
    const shown = await release(STATUS);
    expect(rows(shown)[1]).toEqual(["New release 2026.11.1 is available.", ["Update to 2026.11.1"]]);
    expect(said(shown)).toEqual([RESTARTS]);
    expect(shown.renderRoot.querySelector("sl-progress-bar")).toBeNull();
  });

  it("offers no update to a release not yet downloaded, or to an older one downloaded", async () => {
    expect(rows(await release(downloading(null)))[1]).toEqual(["New release 2026.11.1 is available.", []]);
    expect(rows(await release(downloading({ release: "2026.11.0" })))[1]).toEqual([
      "New release 2026.11.1 is available.",
      [],
    ]);
  });

  it("that failed says why, and that the box tries again at its next check", async () => {
    const failed = await release(
      downloading({ downloaded: false, failure: "Could not pull ghcr.io/rails49/control:x: toomanyrequests." }),
    );
    expect(rows(failed)[1]).toEqual([
      "Could not download 2026.11.1: Could not pull ghcr.io/rails49/control:x: toomanyrequests. The box tries again at its next check.",
      [],
    ]);
  });

  it("that failed before its container started says why too", async () => {
    for (const failure of [
      "GitHub answered 404 for release 2026.11.1's manifest.",
      "Could not start rails49-download: Error response from daemon: toomanyrequests.",
      "Could not start rails49-download: Error response from daemon: no space left on device.",
    ]) {
      const failed = await release(downloading({ downloaded: false, failure, running: false }));
      expect(rows(failed)[1]).toEqual([`Could not download 2026.11.1: ${failure} The box tries again at its next check.`, []]);
    }
  });

  it("whose container stopped before it finished says so, and that the box tries again", async () => {
    const stopped = await release(downloading({ ...DOWNLOADING, running: false }));
    expect(rows(stopped)[1]).toEqual([
      "Could not download 2026.11.1: it stopped before it finished. Its log is in the log bundle. The box tries again at its next check.",
      [],
    ]);
    expect(stopped.renderRoot.querySelector("sl-progress-bar")).toBeNull();
  });

  it("refused for want of room says what it needs and what is free", async () => {
    const full = await release(
      downloading({
        downloaded: false,
        disk: { needs: 1.6e9, free: 0.9e9 },
        failure: "Not enough free disk to download 2026.11.1: it needs 1.6 GB, 0.9 GB is free.",
      }),
    );
    expect(rows(full)[1]).toEqual(["Not enough free disk to download 2026.11.1: it needs 1.6 GB, 0.9 GB is free.", []]);
  });

  it("stopped for want of room between image pulls says what is free, what the box keeps, and that it tries again", async () => {
    const stopped = await release(
      downloading({
        downloaded: false,
        disk: { keeps: 1e9, free: 0.9e9 },
        failure: "Stopped downloading 2026.11.1: 0.9 GB is free, and the box keeps 1 GB free.",
      }),
    );
    expect(rows(stopped)[1]).toEqual([
      "Stopped downloading 2026.11.1: 0.9 GB is free, and the box keeps 1 GB free. The box tries again at its next check.",
      [],
    ]);
  });

  it("on a box that downloads only on a press, says Check for update downloads it, and tries again", async () => {
    const off = async (download: Partial<Download> | null, downloaded = false) =>
      rows(await release(downloading(download, { download: false, downloaded })))[1]!;
    expect(await off(null)).toEqual(["New release 2026.11.1 is available. Check for update downloads it.", []]);
    expect((await off({ release: "2026.11.0" }))[0]).toBe(
      "New release 2026.11.1 is available. Check for update downloads it.",
    );
    expect((await off(DOWNLOADING))[0]).toBe("New release 2026.11.1 is available. Downloaded 300 MB of 1.6 GB.");
    expect(await off({}, true)).toEqual(["New release 2026.11.1 is available.", ["Update to 2026.11.1"]]);
    expect((await off({ downloaded: false, failure: "GitHub answered 502." }))[0]).toBe(
      "Could not download 2026.11.1: GitHub answered 502. Check for update tries again.",
    );
    expect((await off({ ...DOWNLOADING, running: false }))[0]).toBe(
      "Could not download 2026.11.1: it stopped before it finished. Its log is in the log bundle. Check for update tries again.",
    );
    expect((await off({ downloaded: false, disk: { keeps: 1e9, free: 0.9e9 }, failure: "Stopped." }))[0]).toBe(
      "Stopped downloading 2026.11.1: 0.9 GB is free, and the box keeps 1 GB free. Check for update tries again.",
    );
    expect((await off({ downloaded: false, disk: { needs: 1.6e9, free: 0.9e9 }, failure: "Not enough." }))[0]).toBe(
      "Not enough free disk to download 2026.11.1: it needs 1.6 GB, 0.9 GB is free. Check for update tries again.",
    );
  });

  it("names a pre-release as a pre-release", async () => {
    const shown = await release(downloading(DOWNLOADING, { prerelease: true, prereleases: true }));
    expect(rows(shown)[1]![0]).toBe("New pre-release 2026.11.1 is available. Downloaded 300 MB of 1.6 GB.");
  });
});
