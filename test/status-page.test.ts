/**
 * The status page at `/box/`, asserted against the HTML `render()` makes of
 * a status: what a person reads there, and the two things they can press.
 */

import { describe, expect, it } from "vitest";

import { render } from "../box/page.mjs";

const STATUS = {
  name: "gleis49.org",
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
    checked: "2026-11-12T08:00:00.000Z",
    succeeded: "2026-11-12T08:00:00.000Z",
    could_not_check: false,
  },
  disk: { free: 20e9, total: 64e9 },
  docker: { version: "29.1.3", tested: ["29.1.3", "29.0.4"], log_driver: "local" },
  certificate: { expires: "2027-01-30T00:00:00.000Z", valid: true },
  resolves: { addresses: ["192.168.1.20"], to_this_box: true },
  failures: ["control is restarting.", "A <script> & more."],
  notes: ["control runs a local build of `1c3f69b`, not release 2026.11.0."],
};

const PLAIN = {
  ...STATUS,
  name: "pi49",
  release: null,
  update: { latest: null, available: false, checked: null, succeeded: null, could_not_check: false },
  docker: { ...STATUS.docker, tested: [] },
  certificate: null,
  resolves: null,
  failures: [],
  notes: [],
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
    expect(page).toMatch(/<look-band[^>]*><look-about name="gleis49.org"><\/look-about><\/look-band>/);
    expect(page).toContain("<title>Box status: gleis49.org</title>");
    expect(plain).toContain('<look-about name="pi49">');
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

  it("says it could not check, as the failure says", () => {
    const offline = render({ ...STATUS, update: { ...STATUS.update, checked: "2026-11-12T09:00:00.000Z", could_not_check: true } });
    expect(items(offline).Update).toBe(
      "Could not check. The last check that succeeded was at 2026-11-12 08:00 UTC. Check now",
    );
  });

  it("checks now by a POST to /box/check, and offers no update or going back", () => {
    expect(page).toContain('<form method="post" action="/box/check"><button>Check now</button></form>');
    expect(page.match(/<form/g)).toHaveLength(1);
  });

  it("shows the disk, the address and Docker", () => {
    expect(items(page)).toMatchObject({
      "Disk free": "20.0 GB of 64.0 GB",
      Address: "192.168.1.20",
      "Docker Engine": "29.1.3, release tested on 29.1.3 and 29.0.4",
      "Log driver": "local",
    });
    expect(items(plain)["Docker Engine"]).toBe("29.1.3");
  });

  it("shows the certificate and the box name on a box with a box name, and not otherwise", () => {
    expect(items(page)).toMatchObject({
      Certificate: "expires 2027-01-30",
      "Box name": "gleis49.org resolves to this box",
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
      "Box name": "gleis49.org resolves to 10.0.0.5",
    });
    expect(items(render({ ...STATUS, certificate: null }))).toMatchObject({ Certificate: "could not be read" });
  });

  it("offers the log bundle as a download", () => {
    expect(page).toContain('<a href="/box/bundle" download>Download the log bundle</a>');
  });
});
