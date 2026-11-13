/**
 * The status page at `/box/`, asserted against the HTML `render()` makes of
 * a status: what a person reads there, and the two things they can press.
 */

import { describe, expect, it } from "vitest";

import { render } from "../box/page.mjs";
import type { Pull } from "../box/update.mjs";

const STATUS = {
  name: "example.org",
  address: "192.168.1.20",
  release: "2026.11.0",
  stacks: [
    { stack: "installation", state: "running", commit: "8f7e6d5c4b3a29180716253443526170819a0b1c", local_build: false, memory: 60 * 2 ** 20 },
    { stack: "control", state: "restarting", commit: "1c3f69b0e5a3d2c1b4a5968778695a4b3c2d1e0f", local_build: true, memory: 1200 * 2 ** 20 },
    { stack: "jmri", state: "running", commit: null, local_build: false, memory: 480 * 2 ** 20 },
  ],
  update: {
    latest: "2026.11.1",
    prerelease: false,
    prereleases: false,
    available: true,
    newer: false,
    checked: "2026-11-12T08:00:00.000Z",
    succeeded: "2026-11-12T08:00:00.000Z",
    could_not_check: false,
  },
  disk: { free: 20e9, total: 64e9 },
  memory: { used: 2.5 * 2 ** 30, total: 8 * 2 ** 30 - 300 * 2 ** 20 },
  docker: { version: "29.1.3", tested: ["29.1.3", "29.0.4"], log_driver: "local" },
  certificate: { expires: "2027-01-30T00:00:00.000Z", valid: true },
  resolves: { addresses: ["192.168.1.20"], to_this_box: true },
  updating: null,
  back: "2026.10.2",
  failures: ["control is restarting.", "A <script> & more."],
  notes: ["control runs a local build of `1c3f69b`, not release 2026.11.0."],
  setup: {
    uis: ["control", "jmri"],
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
};

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

/** What the page says before a press while a declared stack runs. */
const KEEPS = "<p>The railroad keeps running while the new images download. It stops while its stacks restart.</p>";

/** STATUS on a box where no container of a declared stack runs but the
 *  installation's, which serves the page. */
const IDLE = {
  ...STATUS,
  stacks: [STATUS.stacks[0]!, ...STATUS.stacks.slice(1).map((stack) => ({ ...stack, state: "stopped" }))],
};

const PLAIN = {
  ...STATUS,
  name: "box",
  release: null,
  update: {
    latest: null,
    prerelease: false,
    prereleases: false,
    available: false,
    newer: false,
    checked: null,
    succeeded: null,
    could_not_check: false,
  },
  docker: { ...STATUS.docker, tested: [] },
  certificate: null,
  resolves: null,
  back: null,
  failures: [],
  notes: [],
  setup: {
    uis: [],
    devices: STATUS.setup.devices.map((device) => ({ ...device, current: null, found: [] })),
  },
};

const page = render(STATUS);
const plain = render(PLAIN);

/** HTML with the markup taken out, as a person reads it. */
function text(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** The group with this legend, from its tag to its end, or "". */
function group(html: string, legend: string) {
  return html.match(new RegExp(`<fieldset class="group[^"]*">\\s*<legend>${legend}</legend>[\\s\\S]*?</fieldset>`))?.[0] ?? "";
}

/** The groups' legends and the part headings, in the order the page has them. */
function outline(html: string) {
  return [...html.matchAll(/<h2>([^<]*)<\/h2>|<legend>([^<]*)<\/legend>/g)].map(([, h2, legend]) => h2 ?? legend);
}

/** Each row of a group, as `[what it says, its buttons]`. */
function rows(html: string) {
  return [...html.matchAll(/<div class="row">([\s\S]*?)<\/div>/g)].map(([, row]) => [
    text(row!.replace(/<form[\s\S]*?<\/form>/g, "")),
    [...row!.matchAll(/<button[^>]*>([^<]*)<\/button>/g)].map(([, button]) => button),
  ]);
}

/** The items of a group, as `[term, what it says]` with the markup taken out. */
function items(html: string) {
  return Object.fromEntries(
    [...html.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)].map(([, term, value]) => [term, text(value!)]),
  );
}

describe("the status page", () => {
  it("carries look's band with the box's name, loaded from under /box", () => {
    expect(page).toContain('<script type="module" src="/box/look/look.bundle.js"></script>');
    expect(page).toMatch(/<look-band[^>]*><look-about name="example.org"><\/look-about><\/look-band>/);
    expect(page).toContain("<title>Box status: example.org</title>");
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

  it("states each error in a sentence in a red group, and each local build in a group after it", () => {
    const errors = group(page, "Errors");
    expect(errors).toMatch(/^<fieldset class="group failures">/);
    expect(errors).toContain("<li>control is restarting.</li>");
    expect(group(page, "Notes")).toContain(
      "<li>control runs a local build of <code>1c3f69b</code>, not release 2026.11.0.</li>",
    );
    expect(outline(plain)).not.toContain("Notes");
  });

  it("escapes what it is handed", () => {
    expect(page).toContain("<li>A &#60;script&#62; &#38; more.</li>");
  });

  it("says when there are no errors, beside a green dot, first on the page", () => {
    expect(outline(plain)[0]).toBe("Release and setup");
    expect(plain).toContain('<p><span class="dot ok"></span>No errors.</p>');
    expect(plain.indexOf("No errors.")).toBeLessThan(plain.indexOf("<h2>"));
  });
});

describe("the release group", () => {
  const release = (html: string) => rows(group(html, "Release"));

  it("says the release the box runs, what is out with the update to it, going back, and the last check", () => {
    expect(release(page)).toEqual([
      ["This box runs release 2026.11.0.", []],
      ["Release 2026.11.1 is out.", ["Update to 2026.11.1"]],
      ["", ["Revert to 2026.10.2"]],
      ["Checked at 2026-11-12 08:00 UTC.", ["Check for update", "Pre-releases: off"]],
    ]);
    expect(release(plain)).toEqual([
      ["This box runs no release yet.", []],
      ["Not checked yet.", ["Check for update", "Pre-releases: off"]],
    ]);
  });

  it("says when the box runs the latest release, or none is out", () => {
    const latest = render({ ...STATUS, update: { ...STATUS.update, latest: "2026.11.0", available: false } });
    expect(release(latest)[1]).toEqual(["It is the latest release.", []]);
    const none = render({ ...STATUS, release: null, back: null, update: { ...STATUS.update, latest: null, available: false } });
    expect(release(none)[1]).toEqual(["No release is out yet.", []]);
  });

  it("says when the box runs a release newer than the latest, and offers no update to it", () => {
    const newer = render({
      ...STATUS,
      release: "2026.11.5",
      update: { ...STATUS.update, latest: "2026.11.3", available: false, newer: true },
    });
    expect(release(newer).slice(0, 2)).toEqual([
      ["This box runs release 2026.11.5.", []],
      ["It is newer than the latest release, 2026.11.3.", []],
    ]);
    expect(newer).not.toContain('action="/box/update"');
  });

  it("says it could not check, as the failure says", () => {
    const offline = render({ ...STATUS, update: { ...STATUS.update, checked: "2026-11-12T09:00:00.000Z", could_not_check: true } });
    expect(release(offline).at(-1)).toEqual([
      "Could not check. The last check that succeeded was at 2026-11-12 08:00 UTC.",
      ["Check for update", "Pre-releases: off"],
    ]);
  });

  it("checks now by a POST to /box/check, and switches pre-releases by a POST to /box/prereleases", () => {
    expect(page).toContain(
      '<form method="post" action="/box/check"><button>Check for update</button></form><form method="post" action="/box/prereleases"><button name="prereleases" value="yes" aria-pressed="false">Pre-releases: off</button></form>',
    );
    const on = render({ ...STATUS, update: { ...STATUS.update, prereleases: true } });
    expect(on).toContain(
      '<form method="post" action="/box/prereleases"><button name="prereleases" value="no" aria-pressed="true">Pre-releases: on</button></form>',
    );
  });

  it("names a pre-release that is out, and the update to it, as a pre-release", () => {
    const pre = render({ ...STATUS, update: { ...STATUS.update, latest: "2026.11.2", prerelease: true, prereleases: true } });
    expect(release(pre)[1]).toEqual(["Pre-release 2026.11.2 is out.", ["Update to pre-release 2026.11.2"]]);
    expect(pre).toContain('<form method="post" action="/box/update"><button>Update to pre-release 2026.11.2</button></form>');
  });

  it("updates by a POST to /box/update and goes back by a POST to /box/back, then says when the railroad stops", () => {
    const update = page.indexOf('<form method="post" action="/box/update"><button>Update to 2026.11.1</button></form>');
    const back = page.indexOf('<form method="post" action="/box/back"><button>Revert to 2026.10.2</button></form>');
    const stops = group(page, "Release").indexOf(KEEPS);
    expect(update).toBeGreaterThan(-1);
    expect(back).toBeGreaterThan(update);
    expect(stops).toBeGreaterThan(group(page, "Release").indexOf("Revert to"));
    expect(stops).toBeLessThan(group(page, "Release").indexOf("Checked at"));
  });

  it("offers neither on a box with no newer release and nothing to go back to, and says nothing of the railroad", () => {
    expect(plain).not.toMatch(/action="\/box\/(update|back)"/);
    expect(group(plain, "Release")).not.toContain("railroad");
  });

  it("says nothing of the railroad stopping where no declared stack runs", () => {
    const idle = render(IDLE);
    expect(idle).toContain('<form method="post" action="/box/update"><button>Update to 2026.11.1</button></form>');
    expect(idle).not.toContain("The railroad keeps running");
    expect(render({ ...STATUS, stacks: STATUS.stacks.slice(0, 1) })).not.toContain("The railroad keeps running");
    // One stack running is enough.
    const one = render({ ...IDLE, stacks: [...IDLE.stacks.slice(0, 2), STATUS.stacks[2]!] });
    expect(group(one, "Release")).toContain(KEEPS);
  });

  it("offers going back alone when there is no newer release", () => {
    const latest = render({ ...STATUS, update: { ...STATUS.update, latest: "2026.11.0", available: false } });
    expect(latest).not.toContain('action="/box/update"');
    expect(latest).toContain('<form method="post" action="/box/back"><button>Revert to 2026.10.2</button></form>');
  });
});

describe("the status groups", () => {
  /** The table's rows, as `[dot, stack, state, memory, commit]`. */
  const table = (html: string) =>
    [...group(html, "Stacks").matchAll(/<tr><td><span class="dot (\w+)"><\/span>([^<]*)<\/td>(.*?)<\/tr>/g)].map(
      ([, dot, stack, cells]) => [dot, stack, ...[...cells!.matchAll(/<td[^>]*>(.*?)<\/td>/g)].map(([, cell]) => cell)],
    );

  it("list each stack by its name, in the page's order, with a dot, its state, memory and commit", () => {
    const all = render({
      ...STATUS,
      stacks: [
        ...STATUS.stacks,
        { stack: "dccex", state: "stopped", commit: null, local_build: false, memory: null },
        { stack: "occupancy-service", state: "running", commit: null, local_build: false, memory: 2500 * 2 ** 20 },
      ],
    });
    expect(group(all, "Stacks")).toContain('<th>Stack</th><th>State</th><th class="number">Memory</th><th>Commit</th>');
    expect(group(all, "Stacks")).toContain('<td class="number">60 MB</td>');
    expect(table(all)).toEqual([
      ["ok", "Installation", "running", "60 MB", "8f7e6d5"],
      ["bad", "Control", "restarting", "1,200 MB", "1c3f69b"],
      ["ok", "Occupancy", "running", "2,500 MB", "n/a"],
      ["ok", "JMRI", "running", "480 MB", "n/a"],
      ["off", "DCC-EX translator", "stopped", "", "n/a"],
    ]);
  });

  it("show the disk, the memory and the address in the box group", () => {
    expect(items(group(page, "Box"))).toMatchObject({
      "Disk free": "20.0 GB of 64.0 GB",
      Memory: "2,560 MB used of 7,892 MB",
      "IP address": "192.168.1.20. Reserve this address for the box in your router.",
    });
    expect(items(render({ ...STATUS, address: null }))["IP address"]).toBe("none");
    expect(items(render({ ...STATUS, memory: null }))).not.toHaveProperty("Memory");
  });

  it("show Docker in the Docker group", () => {
    expect(items(group(page, "Docker"))).toEqual({
      "Docker Engine": "29.1.3, release tested on 29.1.3 and 29.0.4",
      "Log driver": "local",
    });
    expect(items(plain)["Docker Engine"]).toBe("29.1.3");
  });

  it("show the certificate and the box name on a box with a box name, and not otherwise", () => {
    expect(items(group(page, "Box"))).toMatchObject({
      Certificate: "expires 2027-01-30",
      "Box name": "example.org resolves to this box",
    });
    expect(items(plain)).not.toHaveProperty("Certificate");
    expect(items(plain)).not.toHaveProperty("Box name");
    const wrong = render({
      ...STATUS,
      certificate: { expires: "2027-01-30T00:00:00.000Z", valid: false },
      resolves: { addresses: ["10.0.0.5"], to_this_box: false },
    });
    expect(items(wrong)).toMatchObject({
      Certificate: "not valid, expires 2027-01-30",
      "Box name": "example.org resolves to 10.0.0.5",
    });
    expect(items(render({ ...STATUS, certificate: null }))).toMatchObject({ Certificate: "could not be read" });
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
  /** UPDATING at step `at` of an update that downloads, with `fields`
   *  changed, rendered 25 seconds after the step began. */
  const at = (step: string, fields: object = {}) =>
    render(
      {
        ...UPDATING,
        updating: {
          ...UPDATING.updating,
          steps: ["download", "pull", "start", "watch", "probe", "prune"] as const,
          at: step as "pull",
          since: "2026-11-12T10:00:00.000Z",
          pull: null,
          building: false,
          ...fields,
        },
      },
      new Date("2026-11-12T10:00:25.400Z"),
    );
  /** The step list, as `[state, what the step says]`. */
  const steps = (html: string) =>
    [...group(html, "Release").matchAll(/<li(?: class="(\w+)")?>([\s\S]*?)<\/li>/g)].map(([, state, said]) => [
      state ?? "",
      text(said!),
    ]);

  it("lists the run's steps in the release group, ticking those done and spinning at the current one", () => {
    const html = at("start");
    expect(group(html, "Release")).toContain("<p>Updating to 2026.11.1</p>");
    expect(steps(html)).toEqual([
      ["done", "Download release"],
      ["done", "Pull images"],
      ["current", "Start stacks"],
      ["", "Watch for 60 seconds"],
      ["", "Probe"],
      ["", "Remove unused images"],
    ]);
  });

  it("offers neither updating nor going back, hides the setup, and reloads itself", () => {
    const html = at("start");
    expect(html).not.toMatch(/action="\/box\/(update|back|check|prereleases|setup)"/);
    expect(outline(html)).toEqual(["Errors", "Notes", "Release and setup", "Release", "Status", "Stacks", "Box", "Docker"]);
    expect(html).toContain('<meta http-equiv="refresh" content="5">');
    expect(page).not.toContain('http-equiv="refresh"');
  });

  it("lists the steps applying takes", () => {
    const html = at("stop", { action: "apply", to: "2026.11.0", steps: ["pull", "stop", "start", "watch", "probe"] });
    expect(group(html, "Release")).toContain("<p>Applying the setup</p>");
    expect(steps(html).map(([state, said]) => `${state} ${said}`)).toEqual([
      "done Pull images",
      "current Stop stacks no longer chosen",
      " Start stacks",
      " Watch for 60 seconds",
      " Probe",
    ]);
  });

  it("while it pulls, shows the images done of all of them, and the image by its last name with its bytes", () => {
    const image = `ghcr.io/rails49/occupancy-service:5e6f7a8@sha256:${"1".repeat(64)}`;
    const html = at("pull", { pull: { image, index: 6, count: 7, current: 300e6, total: 1.2e9 } });
    expect(group(html, "Release")).toContain(
      '<li class="current">Pull images <progress value="5" max="7">5 of 7</progress> occupancy-service, 300 MB of 1.2 GB</li>',
    );
    // No bytes before the stream says any.
    const traefik = at("pull", { pull: { image: "traefik:v3.7", index: 1, count: 7, current: 0, total: 0 } });
    expect(group(traefik, "Release")).toContain('<progress value="0" max="7">0 of 7</progress> traefik</li>');
  });

  it("while JMRI is built, says so with no bar", () => {
    expect(steps(at("pull", { building: true }))[1]).toEqual(["current", "Building JMRI"]);
    expect(at("pull", { building: true })).not.toContain("<progress");
  });

  it("counts down the 60 seconds from when they began", () => {
    expect(steps(at("watch"))[3]).toEqual(["current", "Watching for 60 seconds: 35 left"]);
  });

  it("goes back to the release group's own rows once it has ended", () => {
    const ended = render({ ...UPDATING, updating: { ...UPDATING.updating, running: false } });
    expect(group(ended, "Release")).not.toContain("<ol");
    expect(ended).toContain('action="/box/update"');
    expect(ended).not.toContain('http-equiv="refresh"');
  });

  it("from a file an older release wrote, which lists no steps, says what it is doing in a sentence", () => {
    const html = render(UPDATING);
    expect(group(html, "Release")).toContain('<p class="updating">Updating to 2026.11.1: Starting control.</p>');
    const back = render({ ...UPDATING, updating: { ...UPDATING.updating, action: "back" as const, to: "2026.10.2" } });
    expect(back).toContain('<p class="updating">Going back to 2026.10.2: Starting control.</p>');
    const applying = render({
      ...UPDATING,
      updating: { ...UPDATING.updating, action: "apply" as const, to: "2026.11.0", step: "Stopping dccex." },
    });
    expect(applying).toContain('<p class="updating">Applying the setup: Stopping dccex.</p>');
  });

  it("says what it is doing in a sentence before it has listed its steps", () => {
    const html = render({ ...UPDATING, updating: { ...UPDATING.updating, steps: [], at: null } });
    expect(group(html, "Release")).toContain('<p class="updating">Updating to 2026.11.1: Starting control.</p>');
  });

  it("from such a file, says which image it pulls, of how many, and its bytes", () => {
    const pulling = (pull: Pull | null, step = "Pulling occupancy-service's images.") =>
      render({ ...UPDATING, updating: { ...UPDATING.updating, to: "2026.11.5", step, pull } });
    const image = `ghcr.io/rails49/occupancy-service:5e6f7a8@sha256:${"1".repeat(64)}`;
    expect(pulling({ image, index: 4, count: 10, current: 1.23e9, total: 2.34e9 })).toContain(
      '<p class="updating">Updating to 2026.11.5: Pulling occupancy-service\'s images: ghcr.io/rails49/occupancy-service, image 4 of 10, 1.2 GB of 2.3 GB.</p>',
    );
    expect(pulling({ image: "traefik:v3.7", index: 1, count: 10, current: 12.4e6, total: 48e6 })).toContain(
      ": traefik, image 1 of 10, 12 MB of 48 MB.</p>",
    );
    expect(pulling(null, "Pulling jmri's images.")).toContain('<p class="updating">Updating to 2026.11.5: Pulling jmri\'s images.</p>');
  });
});
