/**
 * The status page at `/box/`, asserted against the HTML `render()` makes of
 * a status: what a person reads there, and the two things they can press.
 */

import { describe, expect, it } from "vitest";

import { render } from "../box/page.mjs";
import { isDownloaded } from "../box/download.mjs";
import { older } from "../box/status.mjs";
import { start } from "../box/update.mjs";
import type { Status } from "../status-page/src/status.ts";

const STATUS = {
  name: "example.org",
  address: "192.168.1.20",
  release: "2026.11.0",
  stacks: [
    { stack: "installation", state: "running", commit: "8f7e6d5c4b3a29180716253443526170819a0b1c", local_build: false, memory: 60 * 2 ** 20, disk: 365e6 },
    { stack: "control", state: "restarting", commit: "1c3f69b0e5a3d2c1b4a5968778695a4b3c2d1e0f", local_build: true, memory: 1200 * 2 ** 20, disk: 1.2e9 },
    { stack: "jmri", state: "running", commit: null, local_build: false, memory: 480 * 2 ** 20, disk: 650e6 },
  ],
  update: {
    latest: "2026.11.1",
    prerelease: false,
    prereleases: false,
    download: true,
    available: true,
    newer: false,
    checked: "2026-11-12T08:00:00.000Z",
    succeeded: "2026-11-12T08:00:00.000Z",
    could_not_check: false,
    downloaded: true,
  },
  disk: { free: 20e9, total: 64e9 },
  memory: { used: 2.5 * 2 ** 30, total: 8 * 2 ** 30 - 300 * 2 ** 20 },
  docker: { version: "29.1.3", tested: ["29.1.3", "29.0.4"], log_driver: "local" },
  certificate: { expires: "2027-01-30T00:00:00.000Z", valid: true },
  resolves: { addresses: ["192.168.1.20"], to_this_box: true },
  updating: null,
  download: {
    release: "2026.11.1",
    started: "2026-11-12T08:01:00.000Z",
    finished: "2026-11-12T08:20:00.000Z" as string | null,
    downloaded: true,
    failure: null as string | null,
    disk: null as { needs: number; free: number } | { keeps: number; free: number } | null,
    bytes: { current: 1.6e9, total: 1.6e9 } as { current: number; total: number } | null,
    running: false,
  },
  back: "2026.10.2",
  failures: ["control is restarting.", "A <script> & more."],
  notes: ["control runs a local build of `1c3f69b`, not release 2026.11.0."],
  setup: {
    uis: ["control", "jmri"],
    stacks: [
      { stack: "control", label: "control" },
      { stack: "dccex", label: "dccex" },
      { stack: "jmri", label: "jmri" },
      { stack: "occupancy-service", label: "occupancy" },
    ],
    devices: [
      {
        field: "station",
        what: "command station",
        none: "/dev/serial/by-id/none",
        current: "/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0",
        found: ["/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0", "/dev/serial/by-id/usb-2341_Mega-if00"],
      },
      {
        field: "camera",
        what: "camera",
        none: "/dev/v4l/by-id/none",
        current: "/dev/v4l/by-id/usb-away-video-index0",
        found: [],
      },
    ],
  },
} satisfies Status;

/** `status` with `update.downloaded` as `status()` derives it from the
 *  download. */
const derived = (status: Status): Status => ({
  ...status,
  update: { ...status.update, downloaded: isDownloaded(status.update.latest, status.download) },
});

/** STATUS while an update to 2026.11.1 runs. */
const UPDATING = {
  ...STATUS,
  updating: {
    action: "update" as const,
    from: "2026.11.0",
    to: "2026.11.1",
    started: "2026-11-12T09:58:00.000Z",
    step: "Starting control.",
    finished: null,
    passed: null,
    failure: null,
    running: true,
  },
};

const PLAIN = {
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
  docker: { ...STATUS.docker, tested: [] },
  certificate: null,
  resolves: null,
  back: null,
  failures: [],
  notes: [],
  setup: {
    uis: [],
    stacks: STATUS.setup.stacks,
    devices: STATUS.setup.devices.map((device) => ({ ...device, current: null, found: [] })),
  },
};

const page = render(STATUS);
const plain = render(PLAIN);

/** The group with this legend, from its tag to its end, or "". */
function group(html: string, legend: string) {
  return html.match(new RegExp(`<fieldset class="group[^"]*">\\s*<legend>${legend}</legend>[\\s\\S]*?</fieldset>`))?.[0] ?? "";
}

/** The groups' legends and the part headings, in the order the page has them. */
function outline(html: string) {
  return [...html.matchAll(/<h2>([^<]*)<\/h2>|<legend>([^<]*)<\/legend>/g)].map(([, h2, legend]) => h2 ?? legend);
}

describe("the status page", () => {
  it("carries look's band with the box's name, loaded from under /box", () => {
    expect(page).toContain('<script type="module" src="/box/look/look.bundle.js"></script>');
    expect(page).toMatch(/<look-band[^>]*><look-about name="example.org"><\/look-about><\/look-band>/);
    expect(page).toContain("<title>Server (box) status &amp; updates: example.org</title>");
    expect(plain).toContain('<look-about name="box">');
  });

  it("links look's stylesheet in its head, ahead of the bundle", () => {
    // So a phone draws the page styled the first time (#95).
    const head = page.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
    const link = head.indexOf('<link rel="stylesheet" href="/box/look/look.css">');
    expect(link).toBeGreaterThanOrEqual(0);
    expect(link).toBeLessThan(head.indexOf('<script type="module" src="/box/look/look.bundle.js">'));
  });

  it("is styled by its own stylesheet and nothing inline", () => {
    expect(page).toContain('<link rel="stylesheet" href="/box/page.css">');
    expect(page).not.toContain("<style");
    expect(page).not.toContain("style=");
  });

  it("is the errors and the notes, then the release and the setup, then the status, each in its groups", () => {
    expect(outline(page)).toEqual([
      "Errors",
      "Notes",
      "Release and setup",
      "Release",
      "Stacks to run",
      "Devices",
      "Status",
      "Stacks",
      "Box",
      "Docker",
    ]);
    expect(group(page, "Devices")).toMatch(/<div class="row"><button>Apply<\/button><\/div>\n<\/fieldset>$/);
    expect(page.indexOf('<a href="/box/bundle" download>Download the log bundle</a>')).toBeGreaterThan(
      page.indexOf("<legend>Docker</legend>"),
    );
  });
});

describe("the release group", () => {
  it("carries each switch as a button for a browser that runs no script, and loads the script that posts a change", () => {
    expect(page).toContain(
      '<sl-switch>Pre-releases</sl-switch><noscript><button aria-pressed="false">Pre-releases: off</button></noscript></form>',
    );
    expect(page).toContain(
      '<sl-switch checked>Download automatically</sl-switch><noscript><button aria-pressed="true">Download automatically: on</button></noscript></form>',
    );
    expect(page).toContain('<script type="module" src="/box/switch.js"></script>');
  });

});

describe("the setup on the status page", () => {
  /** The form, from its tag to its end. */
  const setup = (html: string) => html.match(/<form method="post" action="\/box\/setup"[\s\S]*?<\/form>/)?.[0] ?? "";

  it("offers Control, Occupancy, JMRI and the DCC-EX translator in that order, the declared ones ticked", () => {
    const boxes = [...group(page, "Stacks to run").matchAll(/<input type="checkbox" name="ui" value="(\w+)"( checked)?> ([^<]+)<\/label>/g)].map(
      ([, value, checked, name]) => `${value} ${name}${checked ? " ticked" : ""}`,
    );
    expect(boxes).toEqual(["control Control ticked", "occupancy Occupancy", "jmri JMRI ticked", "dccex DCC-EX translator"]);
    expect(setup(plain)).not.toContain("checked");
  });

  it("says Occupancy and the DCC-EX translator use Control's broker, and loads the script that ticks it", () => {
    expect(group(page, "Stacks to run")).toContain(
      "<p>Occupancy and DCC-EX translator use the broker installed with Control.</p>",
    );
    expect(page).toContain('<script type="module" src="/box/tick.js"></script>');
  });

  it("offers each station plugged in, or none, with the one dccex.env names chosen", () => {
    expect(group(page, "Devices")).toContain(
      [
        '<select name="station">',
        '<option value="/dev/serial/by-id/none">none</option>',
        '<option value="/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0" selected>usb-1a86_USB_Serial-if00-port0</option>',
        '<option value="/dev/serial/by-id/usb-2341_Mega-if00">usb-2341_Mega-if00</option>',
        "</select>",
      ].join("\n"),
    );
  });

  it("keeps a device named by hand that is not plugged in, and says when none is", () => {
    expect(group(page, "Devices")).toContain(
      [
        '<select name="camera">',
        '<option value="/dev/v4l/by-id/none">none</option>',
        '<option value="/dev/v4l/by-id/usb-away-video-index0" selected>usb-away-video-index0, not plugged in</option>',
        "</select>",
      ].join("\n"),
    );
    expect(setup(page)).toContain("<p>No camera is plugged in.</p>");
    expect(setup(page)).not.toContain("No command station is plugged in.");
    expect(setup(plain)).toContain('<option value="/dev/serial/by-id/none" selected>none</option>');
    expect(setup(plain)).toContain("<p>No command station is plugged in.</p>");
  });

  it("puts each device's choice on its row, at the right", () => {
    expect(group(page, "Devices")).toContain('<label class="row">Command station <select name="station">');
    expect(group(page, "Devices")).toContain('<label class="row">Camera <select name="camera">');
  });

  it("says nothing of the railroad, which the release group says", () => {
    expect(setup(page)).toContain("<button>Apply</button>");
    expect(setup(page)).not.toContain("railroad");
  });
});

describe("while an update, going back or applying runs", () => {
  // What the run says is in status-page/test/box-progress.test.ts.

  it("hides the setup", () => {
    expect(render(UPDATING)).not.toContain('action="/box/setup"');
  });

});

describe("the update the page offers (#126)", () => {
  const RECORD = "/var/lib/rails49/deploys/installation";
  const DIGEST = `sha256:${"4".repeat(64)}`;
  const manifest = JSON.stringify({ stacks: { installation: { commit: "inst4", images: { "installation-box": DIGEST } } } });
  const ENV = { BOX_DOMAIN: "example.org", BOX_UIS: "control jmri", hostname: "box", address: "192.168.1.20" };

  /** Whether `start("update")` accepts on a box that runs `runs`, whose
   *  last check found `latest`, and whose `download.json` holds `download`:
   *  its files are on the box where it is downloaded. */
  async function accepts(runs: string | null, latest: string | null, download: { release: string; downloaded: boolean } | null) {
    const files: Record<string, string> = {
      ...(runs ? { [RECORD]: `2026-11-10T09:00:00Z  -  ->  ${runs}  passed\n`, [`/var/lib/rails49/releases/${runs}/manifest.json`]: manifest } : {}),
      "/var/lib/rails49/check.json": JSON.stringify({ latest }),
      ...(download ? { "/var/lib/rails49/download.json": JSON.stringify(download) } : {}),
      ...(download?.downloaded ? { [`/var/lib/rails49/releases/${download.release}/manifest.json`]: manifest } : {}),
    };
    const io = {
      docker: async () => "",
      read: async (path: string) => files[path] ?? null,
      write: async (path: string, text: string) => void (files[path] = text),
      now: () => new Date("2026-11-16T10:00:00Z"),
    };
    return (await start("update", ENV, io)) === null;
  }

  /** Whether the page offers "Update to" for the same box, as `status()`
   *  says of it. */
  function offers(runs: string | null, latest: string | null, download: { release: string; downloaded: boolean } | null) {
    const html = render(derived({
      ...STATUS,
      release: runs,
      update: {
        ...STATUS.update,
        latest,
        available: latest !== null && (runs === null || older(runs, latest)),
        newer: latest !== null && runs !== null && older(latest, runs),
      },
      download: download && { ...STATUS.download, ...download },
    }));
    return html.includes('action="/box/update"');
  }

  it("exactly when start(\"update\") accepts, also with a newer pre-release downloaded than the check names", async () => {
    const out = ["2026.11.1", "2026.11.2", "2026.11.3"];
    const releases = [null, ...out];
    const downloads = [null, ...out.flatMap((release) => [{ release, downloaded: true }, { release, downloaded: false }])];
    let offered = 0;
    for (const runs of releases) {
      for (const latest of releases) {
        for (const download of downloads) {
          const said = `runs ${runs}, latest ${latest}, downloaded ${JSON.stringify(download)}`;
          const offer = offers(runs, latest, download);
          expect(offer, said).toBe(await accepts(runs, latest, download));
          if (offer) offered += 1;
        }
      }
    }
    expect(offered).toBeGreaterThan(0);
    // The issue's box: on 2026.11.1, with pre-release 2026.11.3 downloaded,
    // offered nothing until 2026.11.2 is downloaded.
    expect(offers("2026.11.1", "2026.11.2", { release: "2026.11.3", downloaded: true })).toBe(false);
    expect(offers("2026.11.1", "2026.11.2", { release: "2026.11.2", downloaded: true })).toBe(true);
  });
});
