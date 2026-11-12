/**
 * The status page at `/box/`, asserted against the HTML `render()` makes of
 * a status: what a person reads there, and the two things they can press.
 */

import { describe, expect, it } from "vitest";

import { render } from "../box/page.mjs";

const STATUS = {
  name: "example.org",
  address: "192.168.1.20",
  release: "2026.11.0",
  stacks: [
    { stack: "installation", state: "running", commit: "8f7e6d5c4b3a29180716253443526170819a0b1c", local_build: false },
    { stack: "control", state: "restarting", commit: "1c3f69b0e5a3d2c1b4a5968778695a4b3c2d1e0f", local_build: true },
    { stack: "jmri", state: "running", commit: null, local_build: false },
  ],
  update: {
    latest: "2026.11.1",
    available: true,
    newer: false,
    checked: "2026-11-12T08:00:00.000Z",
    succeeded: "2026-11-12T08:00:00.000Z",
    could_not_check: false,
  },
  disk: { free: 20e9, total: 64e9 },
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

const PLAIN = {
  ...STATUS,
  name: "box",
  release: null,
  update: { latest: null, available: false, newer: false, checked: null, succeeded: null, could_not_check: false },
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

/** The page's items, as `[term, what it says]` with the markup taken out. */
function items(html: string) {
  return Object.fromEntries(
    [...html.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)].map(([, term, value]) => [
      term,
      value!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    ]),
  );
}

describe("the status page", () => {
  it("carries look's band with the box's name, loaded from under /box", () => {
    expect(page).toContain('<script type="module" src="/box/look/look.bundle.js"></script>');
    expect(page).toMatch(/<look-band[^>]*><look-about name="example.org"><\/look-about><\/look-band>/);
    expect(page).toContain("<title>Box status: example.org</title>");
    expect(plain).toContain('<look-about name="box">');
  });

  it("is styled by its own stylesheet and nothing inline", () => {
    expect(page).toContain('<link rel="stylesheet" href="/box/page.css">');
    expect(page).not.toContain("<style");
    expect(page).not.toContain("style=");
  });

  it("states each failure and each local build in a sentence, failures first", () => {
    const failures = page.indexOf('<ul class="failures">');
    const notes = page.indexOf('<ul class="notes">');
    expect(failures).toBeGreaterThan(-1);
    expect(notes).toBeGreaterThan(failures);
    expect(page).toContain("<li>control is restarting.</li>");
    expect(page).toContain("<li>control runs a local build of <code>1c3f69b</code>, not release 2026.11.0.</li>");
  });

  it("escapes what it is handed", () => {
    expect(page).toContain("<li>A &#60;script&#62; &#38; more.</li>");
  });

  it("says when nothing is wrong", () => {
    expect(plain).not.toContain('class="failures"');
    expect(plain).toContain("Nothing is wrong.");
  });

  it("lists each stack with its state and commit", () => {
    const rows = [...page.matchAll(/<tr><td>([^<]*)<\/td><td>([^<]*)<\/td><td>(?:<code>)?([^<]*)/g)].map(
      ([, stack, state, commit]) => [stack, state, commit],
    );
    expect(rows).toEqual([
      ["installation", "running", "8f7e6d5"],
      ["control", "restarting", "1c3f69b"],
      ["jmri", "running", "none"],
    ]);
  });

  it("shows the release, the update and the last check", () => {
    expect(items(page)).toMatchObject({
      Release: "2026.11.0",
      Update: "Release 2026.11.1 is out. Checked at 2026-11-12 08:00 UTC. Check now",
    });
    expect(items(plain)).toMatchObject({
      Release: "none",
      Update: "Not checked yet. Check now",
    });
    const latest = render({ ...STATUS, update: { ...STATUS.update, latest: "2026.11.0", available: false } });
    expect(items(latest).Update).toBe("This box runs the latest release. Checked at 2026-11-12 08:00 UTC. Check now");
    const none = render({ ...STATUS, update: { ...STATUS.update, latest: null, available: false } });
    expect(items(none).Update).toBe("No release yet. Checked at 2026-11-12 08:00 UTC. Check now");
  });

  it("says when the box runs a release newer than the latest, and offers no update to it", () => {
    const newer = render({
      ...STATUS,
      release: "2026.11.5",
      update: { ...STATUS.update, latest: "2026.11.3", available: false, newer: true },
    });
    expect(items(newer).Update).toBe(
      "This box runs 2026.11.5, newer than the latest release, 2026.11.3. Checked at 2026-11-12 08:00 UTC. Check now",
    );
    expect(newer).not.toContain('action="/box/update"');
  });

  it("says it could not check, as the failure says", () => {
    const offline = render({ ...STATUS, update: { ...STATUS.update, checked: "2026-11-12T09:00:00.000Z", could_not_check: true } });
    expect(items(offline).Update).toBe(
      "Could not check. The last check that succeeded was at 2026-11-12 08:00 UTC. Check now",
    );
  });

  it("checks now by a POST to /box/check", () => {
    expect(page).toContain('<form method="post" action="/box/check"><button>Check now</button></form>');
  });

  it("offers updating to the newer release and going back, after saying that it stops the railroad", () => {
    const stops = page.indexOf("<p>Updating or going back stops the railroad for about a minute.</p>");
    const update = page.indexOf('<form method="post" action="/box/update"><button>Update to 2026.11.1</button></form>');
    const back = page.indexOf('<form method="post" action="/box/back"><button>Go back to 2026.10.2</button></form>');
    expect(stops).toBeGreaterThan(-1);
    expect(update).toBeGreaterThan(stops);
    expect(back).toBeGreaterThan(update);
  });

  it("offers neither on a box with no newer release and nothing to go back to", () => {
    expect(plain).not.toMatch(/action="\/box\/(update|back)"/);
    expect(plain).not.toContain("Updating or going back stops the railroad");
  });

  it("offers going back alone when there is no newer release", () => {
    const latest = render({ ...STATUS, update: { ...STATUS.update, latest: "2026.11.0", available: false } });
    expect(latest).not.toContain('action="/box/update"');
    expect(latest).toContain('<form method="post" action="/box/back"><button>Go back to 2026.10.2</button></form>');
  });

  it("while one runs says what it is doing, offers neither, and reloads itself", () => {
    const html = render(UPDATING);
    expect(html).toContain('<p class="updating">Updating to 2026.11.1: Starting control.</p>');
    expect(html).not.toContain('action="/box/update"');
    expect(html).not.toContain('action="/box/back"');
    expect(html).toContain('<meta http-equiv="refresh" content="5">');
    expect(page).not.toContain('http-equiv="refresh"');
    const back = render({ ...UPDATING, updating: { ...UPDATING.updating, action: "back" as const, to: "2026.10.2" } });
    expect(back).toContain('<p class="updating">Going back to 2026.10.2: Starting control.</p>');
  });

  it("shows the disk, the address and Docker", () => {
    expect(items(page)).toMatchObject({
      "Disk free": "20.0 GB of 64.0 GB",
      Address: "192.168.1.20. Reserve this address for the box in your router.",
      "Docker Engine": "29.1.3, release tested on 29.1.3 and 29.0.4",
      "Log driver": "local",
    });
    expect(items(plain)["Docker Engine"]).toBe("29.1.3");
  });

  it("shows the certificate and the box name on a box with a box name, and not otherwise", () => {
    expect(items(page)).toMatchObject({
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

  it("offers the log bundle as a download", () => {
    expect(page).toContain('<a href="/box/bundle" download>Download the log bundle</a>');
  });

  it("says to reserve the box's address in the router", () => {
    expect(items(page).Address).toBe("192.168.1.20. Reserve this address for the box in your router.");
    expect(items(render({ ...STATUS, address: null })).Address).toBe("none");
  });
});

describe("the setup on the status page", () => {
  /** The form, from its tag to its end. */
  const setup = (html: string) => html.match(/<form method="post" action="\/box\/setup"[\s\S]*?<\/form>/)?.[0] ?? "";

  it("offers control, dccex, jmri and occupancy in that order, the declared ones ticked", () => {
    const boxes = [...setup(page).matchAll(/<input type="checkbox" name="ui" value="(\w+)"( checked)?>/g)].map(
      ([, value, checked]) => `${value}${checked ? " ticked" : ""}`,
    );
    expect(boxes).toEqual(["control ticked", "dccex", "jmri ticked", "occupancy"]);
    expect(setup(plain)).not.toContain("checked");
  });

  it("says why ticking dccex or occupancy ticks control, and loads the script that ticks it", () => {
    expect(setup(page)).toContain(
      "<p>Ticking dccex or occupancy ticks control too: each dials its broker.</p>",
    );
    expect(page).toContain('<script type="module" src="/box/tick.js"></script>');
  });

  it("offers each station plugged in, or none, with the one dccex.env names chosen", () => {
    expect(setup(page)).toContain(
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
    expect(setup(page)).toContain(
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

  it("says that applying stops the railroad before the button", () => {
    const form = setup(page);
    const stops = form.indexOf("<p>Applying stops the railroad for about a minute.</p>");
    expect(stops).toBeGreaterThan(-1);
    expect(form.indexOf("<button>Apply</button>")).toBeGreaterThan(stops);
  });

  it("is not offered while an update, going back or applying runs, which the page says", () => {
    expect(setup(render(UPDATING))).toBe("");
    const applying = render({
      ...UPDATING,
      updating: { ...UPDATING.updating, action: "apply" as const, to: "2026.11.0", step: "Stopping dccex." },
    });
    expect(applying).toContain('<p class="updating">Applying the setup: Stopping dccex.</p>');
  });
});

