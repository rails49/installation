/**
 * The two requests a UI may make of the box, asserted against the script's
 * request handling alone: no container, no socket, no `nsenter`. What the box
 * is and what turning it off does are handed in, so a test turns nothing off
 * and can count how many times it was asked to.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { beginDownload, offered, starting } from "../box/download.mjs";
import { render } from "../box/page.mjs";
import { built, handle, tick, zone } from "../box/server.mjs";
import { offerDownload, offerPrereleases } from "../box/setup.mjs";
import { downloads, status } from "../box/status.mjs";
import type { Status } from "../status-page/src/status.ts";

const HOST = "control.example.org";
const form = { host: HOST, "content-type": "application/x-www-form-urlencoded" };

/** The status a box answers with, as `status()` would gather it. */
const STATUS: Status = {
  name: "example.org",
  address: "192.168.1.20",
  release: null,
  stacks: [{ stack: "installation", state: "running", commit: null, local_build: true, memory: 50e6, disk: 365e6 }],
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
  disk: { free: 20e9, total: 64e9 },
  memory: { used: 2.1e9, total: 8e9 },
  docker: { version: "29.1.3", tested: [], log_driver: "local" },
  certificate: { expires: "2027-01-30T00:00:00.000Z", valid: true },
  resolves: { addresses: ["192.168.1.20"], to_this_box: true },
  updating: null,
  download: null,
  back: null,
  failures: [],
  notes: [],
  setup: { uis: [], stacks: [], devices: [] },
};

/** A box whose PID 1 has this name, counting the times it is turned off and
 *  the times it is asked to check for a release, and recording each update
 *  or going back it is asked to start. `refusal` is why it refuses to.
 *  `env` is its `box.env`, and `checkedWith` what that held at each check. */
function box(pid1: string, refusal: string | null = null) {
  const counted = {
    pid1,
    turnedOff: 0,
    checked: 0,
    downloads: 0,
    env: "# the box\nBOX_DOMAIN=example.org\nBOX_UIS=\"control\"\n",
    checkedWith: [] as string[],
    started: [] as string[],
    applied: [] as string[],
    turnOff: () => void counted.turnedOff++,
    status: async () => STATUS,
    update: async (): Promise<string | null> => null,
    check: async () => {
      counted.checked++;
      counted.checkedWith.push(counted.env);
    },
    download: async () => {
      // After the check, so it downloads what the check found.
      expect(counted.downloads).toBe(counted.checked - 1);
      counted.downloads++;
    },
    prereleases: (on: boolean) =>
      offerPrereleases(on, {
        read: async () => counted.env,
        write: async (_path: string, text: string) => void (counted.env = text),
      }),
    automatic: () => downloads(async () => counted.env),
    setAutomatic: (on: boolean) =>
      offerDownload(on, {
        read: async () => counted.env,
        write: async (_path: string, text: string) => void (counted.env = text),
      }),
    start: async (action: "update" | "back") => {
      counted.started.push(action);
      return refusal;
    },
    apply: async (body: string) => {
      counted.applied.push(body);
      return refusal;
    },
    bundle: async () => ({ name: "example.org-20261112T1000.tar.gz", body: Buffer.from("tar") }),
    page: new Map<string, string>(),
  };
  return counted;
}

async function ask(
  on: ReturnType<typeof box>,
  method: string,
  url: string,
  headers: Record<string, string> = { host: HOST },
  body = "",
) {
  return await handle({ method, url, headers, body }, on);
}

describe("GET /box", () => {
  it("answers yes where PID 1 is systemd", async () => {
    const answer = await ask(box("systemd"), "GET", "/box");
    expect(answer.status).toBe(200);
    expect(JSON.parse(String(answer.body))).toEqual({ can_turn_off: true, update: null });
  });

  it("answers the same with a query string", async () => {
    expect((await ask(box("systemd"), "GET", "/box?t=1")).status).toBe(200);
  });

  it("answers no where PID 1 is anything else", async () => {
    // Docker Desktop's virtual machine, which is what a Mac's PID 1 is.
    for (const pid1 of ["init", "tini", "node", ""]) {
      const answer = await ask(box(pid1), "GET", "/box");
      expect(answer.status, pid1).toBe(200);
      expect(JSON.parse(String(answer.body)), pid1).toEqual({ can_turn_off: false, update: null });
    }
  });

  it("sends a browser that left the slash off to the status page", async () => {
    // What a browser asks for when a person types the address (#86).
    const accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
    for (const url of ["/box", "/box?t=1"]) {
      const answer = await ask(box("systemd"), "GET", url, { host: HOST, accept });
      expect(answer.status, url).toBe(303);
      expect(answer.headers, url).toEqual({ location: "/box/", vary: "accept" });
    }
  });

  it("answers the JSON to a request that does not ask for HTML", async () => {
    // control's `fetch` sends `*/*`.
    for (const accept of [undefined, "*/*", "application/json"]) {
      const headers: Record<string, string> = { host: HOST };
      if (accept !== undefined) headers.accept = accept;
      const answer = await ask(box("systemd"), "GET", "/box", headers);
      expect(answer.status, accept).toBe(200);
      expect(JSON.parse(String(answer.body)), accept).toEqual({ can_turn_off: true, update: null });
      expect(answer.headers, accept).toEqual({ vary: "accept" });
    }
  });

  it("refuses a page on another origin before sending it anywhere", async () => {
    const headers = { host: HOST, origin: "https://evil.example", accept: "text/html" };
    expect((await ask(box("systemd"), "GET", "/box", headers)).status).toBe(403);
  });
});

describe("GET /box, the update it answers (#147)", () => {
  const CHECKED = "2026-11-15T02:00:00.000Z";
  const RUNS = "2026-11-10T09:00:00Z  -  ->  2026.11.0  passed\n";
  const DOWNLOADED = { release: "2026.11.1", started: CHECKED, finished: CHECKED, downloaded: true, failure: null, disk: null, bytes: null };
  /** An update, going back or applying the setup that runs. */
  const running = (action: string) => ({ action, from: "2026.11.0", to: "2026.11.1", started: CHECKED, step: "Starting.", finished: null, passed: null, failure: null });

  /** A box with these files under /var/lib/rails49, whose `rails49-update`
   *  runs where `update.json` has not finished, unless `stopped`, and whose
   *  `rails49-download` runs where `download.json` has not. */
  function boxWith(files: Record<string, unknown>, stopped = false) {
    const text = Object.fromEntries(
      Object.entries(files).map(([name, value]) => [`/var/lib/rails49/${name}`, typeof value === "string" ? value : JSON.stringify(value)]),
    );
    const read = async (path: string) => text[path] ?? null;
    const container = (name: string, file: string) => ({
      Id: name,
      Name: `/${name}`,
      Image: "sha256:box",
      State: { Status: !stopped && files[file] && (files[file] as { finished: string | null }).finished === null ? "running" : "exited" },
      Config: { Labels: null },
    });
    const containers = [container("rails49-update", "update.json"), container("rails49-download", "download.json")];
    const docker = async (args: string[]) => {
      if (args[0] === "ps") return containers.map((c) => `${c.Id}\n`).join("");
      if (args[0] === "inspect") return JSON.stringify(containers);
      if (args[0] === "info") return JSON.stringify({ ServerVersion: "29.1.3", LoggingDriver: "local" });
      throw new Error(`docker ${args.join(" ")}`);
    };
    return {
      ...box("systemd"),
      update: () => offered(read),
      status: async () => ({
        ...(await status({ BOX_DOMAIN: "", BOX_UIS: "", hostname: "box" }, {
          docker,
          read,
          disk: async () => ({ free: 20e9, total: 64e9 }),
          address: async () => "192.0.2.20",
          certificate: async () => ({ valid_from: "", valid_to: "", error: null }),
          resolve: async () => [],
          stats: async () => null,
          size: async () => null,
          starting: () => false,
          now: () => new Date("2026-11-15T10:00:00Z"),
        })),
        setup: { uis: [], stacks: [], devices: [] },
      }),
    };
  }

  /** What `GET /box` answers for `update`, and whether the page offers
   *  "Update to" for it. `stopped` is as for `boxWith`. */
  async function answers(files: Record<string, unknown>, stopped = false) {
    const on = boxWith(files, stopped);
    const get = async (url: string) => String((await handle({ method: "GET", url, headers: { host: HOST } }, on)).body);
    const json = JSON.parse(await get("/box"));
    const page = render(JSON.parse(await get("/box/status")));
    return { update: json.update, offers: page.match(/<button>Update to (?:pre-release )?(\S+)<\/button>/)?.[1] ?? null };
  }

  it("is the release the page offers \"Update to\" for", async () => {
    const files = { "deploys/installation": RUNS, "check.json": { checked: CHECKED, succeeded: CHECKED, latest: "2026.11.1" }, "download.json": DOWNLOADED };
    expect(await answers(files)).toEqual({ update: "2026.11.1", offers: "2026.11.1" });
    // On a box on no release yet, and after an update that finished.
    expect(await answers({ ...files, "deploys/installation": "" })).toEqual({ update: "2026.11.1", offers: "2026.11.1" });
    const failed = { ...running("update"), finished: CHECKED, passed: false, failure: "The update failed." };
    expect(await answers({ ...files, "update.json": failed })).toEqual({ update: "2026.11.1", offers: "2026.11.1" });
  });

  it("is null where the page offers no update", async () => {
    const check = { checked: CHECKED, succeeded: CHECKED, latest: "2026.11.1" };
    const cases: Record<string, Record<string, unknown>> = {
      "never checked": { "deploys/installation": RUNS },
      "no newer release": { "deploys/installation": RUNS, "check.json": { ...check, latest: "2026.11.0" }, "download.json": { ...DOWNLOADED, release: "2026.11.0" } },
      "an older release": { "deploys/installation": RUNS, "check.json": { ...check, latest: "2026.10.2" }, "download.json": { ...DOWNLOADED, release: "2026.10.2" } },
      "not downloaded at all": { "deploys/installation": RUNS, "check.json": check },
      "still downloading": { "deploys/installation": RUNS, "check.json": check, "download.json": { ...DOWNLOADED, finished: null, downloaded: false } },
      "a download that failed": { "deploys/installation": RUNS, "check.json": check, "download.json": { ...DOWNLOADED, downloaded: false, failure: "no room" } },
      "another release downloaded": { "deploys/installation": RUNS, "check.json": check, "download.json": { ...DOWNLOADED, release: "2026.11.2" } },
    };
    for (const action of ["update", "back", "apply"]) {
      cases[`while ${action} runs`] = { "deploys/installation": RUNS, "check.json": check, "download.json": DOWNLOADED, "update.json": running(action) };
    }
    for (const [said, files] of Object.entries(cases)) {
      expect(await answers(files), said).toEqual({ update: null, offers: null });
    }
  });

  it("is null after a run that stopped before it finished, where the page offers the update again", async () => {
    // Read from files alone, the run goes on until the next one (#147).
    const files = {
      "deploys/installation": RUNS,
      "check.json": { checked: CHECKED, succeeded: CHECKED, latest: "2026.11.1" },
      "download.json": DOWNLOADED,
      "update.json": running("update"),
    };
    expect(await answers(files, true)).toEqual({ update: null, offers: "2026.11.1" });
  });

  it("is null, with can_turn_off, where a file it reads is half written", async () => {
    const on = { ...box("systemd"), update: () => offered(async () => '{"action": "upd') };
    const answer = await ask(on, "GET", "/box");
    expect(answer.status).toBe(200);
    expect(JSON.parse(String(answer.body))).toEqual({ can_turn_off: true, update: null });
  });
});

describe("POST /box/off", () => {
  it("answers 202 with nothing and turns the box off once", async () => {
    const on = box("systemd");
    expect(await ask(on, "POST", "/box/off")).toMatchObject({ status: 202, body: "" });
    expect(on.turnedOff).toBe(1);
  });

  it("refuses where the box cannot be turned off from here, and runs nothing", async () => {
    const on = box("init");
    expect(await ask(on, "POST", "/box/off")).toMatchObject({
      status: 409,
      body: "this server cannot be turned off from here",
    });
    expect(on.turnedOff).toBe(0);
    expect(on.checked).toBe(0);
    expect(on.started).toEqual([]);
  });
});

describe("a request from a page", () => {
  it("is refused when the page is on another origin, and runs nothing", async () => {
    for (const origin of [
      "https://evil.example",
      `https://${HOST}:8443`,
      `https://jmri.example.org`,
      "null",
    ]) {
      const on = box("systemd");
      for (const [method, url] of [["GET", "/box"], ["POST", "/box/off"]] as const) {
        expect(await ask(on, method, url, { host: HOST, origin }), origin).toMatchObject({
          status: 403,
          body: "refused: a page on another origin",
        });
      }
      expect(on.turnedOff, origin).toBe(0);
    }
  });

  it("is refused when it names no origin and carries no Host", async () => {
    // `null` parses to no host, and no `Host` is no host either; the two are
    // not a match.
    const on = box("systemd");
    expect((await ask(on, "POST", "/box/off", { origin: "null" })).status).toBe(403);
    expect(on.turnedOff).toBe(0);
  });

  it("goes through when the page is on the name it was sent to", async () => {
    // TLS ends at the door, so the scheme is not compared.
    const on = box("systemd");
    const headers = { host: HOST, origin: `https://${HOST}` };
    expect((await ask(on, "GET", "/box", headers)).status).toBe(200);
    expect((await ask(on, "POST", "/box/off", headers)).status).toBe(202);
    expect(on.turnedOff).toBe(1);
  });

  it("goes through with no Origin at all", async () => {
    // `curl`, and a same-origin GET, which browsers send without one.
    const on = box("systemd");
    expect((await ask(on, "GET", "/box")).status).toBe(200);
    expect((await ask(on, "POST", "/box/off")).status).toBe(202);
    expect(on.turnedOff).toBe(1);
  });
});

describe("the door's origin check, GET /origin", () => {
  /** The door's question about a request that arrived at `host`: the
   *  request's own headers, its `Host` as `X-Forwarded-Host`, sent to `box`. */
  async function check(host: string, origin?: string) {
    const headers: Record<string, string> = { host: "box:8080", "x-forwarded-host": host };
    if (origin !== undefined) headers.origin = origin;
    return await ask(box("systemd"), "GET", "/origin", headers);
  }

  it("admits a request with no Origin", async () => {
    expect((await check(HOST)).status).toBe(200);
    expect((await check("192.168.1.20:8081")).status).toBe(200);
  });

  it("admits a page on the origin the request arrived at, on 443 and on a UI port", async () => {
    expect((await check(HOST, `https://${HOST}`)).status).toBe(200);
    expect((await check("example.org:8082", "http://example.org:8082")).status).toBe(200);
    expect((await check("192.168.1.20:8081", "http://192.168.1.20:8081")).status).toBe(200);
    expect((await check("shed.local:8083", "http://shed.local:8083")).status).toBe(200);
  });

  it("refuses a page on another host", async () => {
    for (const origin of ["https://evil.example", "https://example.org", "http://192.168.1.21:8081", "null"]) {
      expect(await check(HOST, origin), origin).toMatchObject({
        status: 403,
        body: "refused: a page on another origin",
      });
    }
  });

  it("refuses a page on the same host and another port", async () => {
    expect((await check("example.org:8082", "http://example.org:8081")).status).toBe(403);
    expect((await check("example.org:8082", "https://example.org")).status).toBe(403);
    expect((await check(HOST, `http://${HOST}:8081`)).status).toBe(403);
  });

  it("compares with the forwarded Host, never its own", async () => {
    expect((await check(HOST, "http://box:8080")).status).toBe(403);
  });
});

describe("GET /box/status", () => {
  it("answers the box's status as JSON", async () => {
    const answer = await ask(box("systemd"), "GET", "/box/status");
    expect(answer).toMatchObject({ status: 200, type: "application/json" });
    expect(JSON.parse(String(answer.body))).toEqual(STATUS);
  });
});

describe("GET /box/ and the built page", () => {
  /** A built page, as `vite build` writes it. */
  const dir = mkdtempSync(join(tmpdir(), "status-page-"));
  mkdirSync(join(dir, "assets"));
  mkdirSync(join(dir, "shoelace/assets/icons"), { recursive: true });
  writeFileSync(join(dir, "index.html"), "<!doctype html><box-page></box-page>");
  writeFileSync(join(dir, "assets/index-C1DEAMa3.js"), "export {};");
  writeFileSync(join(dir, "assets/index-C1DEAMa3.css"), "body {}");
  writeFileSync(join(dir, "shoelace/assets/icons/x-lg.svg"), "<svg></svg>");
  afterAll(() => rmSync(dir, { recursive: true }));
  const IMMUTABLE = { "cache-control": "public, max-age=31536000, immutable" };

  it("answers index.html, checked again on every load", async () => {
    const answer = await ask({ ...box("systemd"), page: await built(dir) }, "GET", "/box/");
    expect(answer).toMatchObject({ status: 200, type: "text/html; charset=utf-8", headers: { "cache-control": "no-cache" } });
    expect(String(answer.body)).toBe("<!doctype html><box-page></box-page>");
  });

  it("serves every other built file by its path, with its type, cached for good", async () => {
    const on = { ...box("systemd"), page: await built(dir) };
    const types = {
      "/box/assets/index-C1DEAMa3.js": ["text/javascript; charset=utf-8", "export {};"],
      "/box/assets/index-C1DEAMa3.css": ["text/css; charset=utf-8", "body {}"],
      "/box/shoelace/assets/icons/x-lg.svg": ["image/svg+xml", "<svg></svg>"],
    };
    for (const [url, [type, body]] of Object.entries(types)) {
      const answer = await ask(on, "GET", url);
      expect(answer, url).toMatchObject({ status: 200, type, headers: IMMUTABLE });
      expect(String(answer.body), url).toBe(body);
    }
  });

  it("answers 404 for a path outside the built files", async () => {
    const on = { ...box("systemd"), page: await built(dir) };
    for (const url of ["/box/index.html", "/box/assets/missing.js", "/box/assets/", "/box/../box/server.mjs", "/box/page.css", "/box/look/look.css", "/box/follow.js", "/box/tick.js", "/box/switch.js"]) {
      expect((await ask(on, "GET", url)).status, url).toBe(404);
    }
  });

  it("reads the list of built files once, so a file written after it is not served", async () => {
    const on = { ...box("systemd"), page: await built(dir) };
    writeFileSync(join(dir, "assets/later.js"), "export {};");
    expect((await ask(on, "GET", "/box/assets/later.js")).status).toBe(404);
  });
});

describe("GET /box/bundle", () => {
  it("answers the log bundle as a download named for the box", async () => {
    const answer = await ask(box("systemd"), "GET", "/box/bundle");
    expect(answer).toMatchObject({
      status: 200,
      type: "application/gzip",
      headers: { "content-disposition": 'attachment; filename="example.org-20261112T1000.tar.gz"' },
    });
    expect(String(answer.body)).toBe("tar");
  });
});

describe("POST /box/check", () => {
  it("checks for a release once and answers 204", async () => {
    const on = box("systemd");
    const answer = await ask(on, "POST", "/box/check");
    expect(answer).toMatchObject({ status: 204, body: "" });
    expect(on.checked).toBe(1);
  });

  it("then starts downloading what the check found", async () => {
    const on = box("systemd");
    await ask(on, "POST", "/box/check");
    expect(on.downloads).toBe(1);
  });

  // #125: the press is answered while the new release's box image still pulls.
  // #132: and the status the page fetches after it says the download runs.
  it("answers at once, while the download it started still pulls, and the status says the download runs", async () => {
    const files: Record<string, string> = {
      "/var/lib/rails49/deploys/installation": "2026-11-10T09:00:00Z  -  ->  2026.11.0  passed\n",
    };
    const digest = `sha256:${"7".repeat(64)}`;
    const io = {
      // The image is not on the box, and its pull does not finish.
      docker: async (args: string[]) => {
        if (args[0] === "image" && args[1] === "inspect") throw new Error("No such image");
        if (args[0] === "pull") return await new Promise<string>(() => {});
        if (args[0] === "info") return JSON.stringify({ ServerVersion: "29.1.3", LoggingDriver: "local" });
        return "";
      },
      read: async (path: string) => files[path] ?? null,
      write: async (path: string, text: string) => void (files[path] = text),
      now: () => new Date("2026-11-15T10:00:00Z"),
      fetch: async () =>
        new Response(JSON.stringify({ stacks: { installation: { commit: "inst7", images: { "installation-box": digest } } } })),
    };
    const on = {
      ...box("systemd"),
      check: async () => {
        files["/var/lib/rails49/check.json"] = JSON.stringify({ latest: "2026.11.2", checked: "2026-11-15T10:00:00.000Z" });
      },
      download: () => beginDownload({ BOX_DOMAIN: "example.org", BOX_UIS: "control" }, io),
      status: async () => ({
        ...(await status({ BOX_DOMAIN: "", BOX_UIS: "control", hostname: "box" }, {
          ...io,
          disk: async () => ({ free: 20e9, total: 64e9 }),
          address: async () => "192.168.1.20",
          certificate: async () => ({ valid_from: "", valid_to: "", error: null }),
          resolve: async () => [],
          stats: async () => null,
          size: async () => null,
          starting,
        })),
        setup: { uis: [], stacks: [], devices: [] },
      }),
    };
    const answer = await handle({ method: "POST", url: "/box/check", headers: { host: HOST }, body: "" }, on);
    expect(answer).toMatchObject({ status: 204 });
    expect(JSON.parse(files["/var/lib/rails49/download.json"]!)).toMatchObject({
      release: "2026.11.2",
      finished: null,
      failure: null,
    });
    const shown = JSON.parse(String((await handle({ method: "GET", url: "/box/status", headers: { host: HOST }, body: "" }, on)).body));
    expect(shown).toMatchObject({
      update: { latest: "2026.11.2", available: true, downloaded: false },
      download: { release: "2026.11.2", running: true },
    });
  });

  it("is refused from a page on another origin, and checks nothing", async () => {
    const on = box("systemd");
    const headers = { host: HOST, origin: "https://evil.example" };
    expect((await ask(on, "POST", "/box/check", headers)).status).toBe(403);
    expect(on.checked).toBe(0);
  });
});

describe("POST /box/prereleases", () => {

  it("writes BOX_PRERELEASES into box.env, keeping every other line, checks, and answers 204", async () => {
    const on = box("systemd");
    const answer = await ask(on, "POST", "/box/prereleases", form, "prereleases=yes");
    expect(answer).toMatchObject({ status: 204, body: "" });
    const yes = '# the box\nBOX_DOMAIN=example.org\nBOX_UIS="control"\nBOX_PRERELEASES=yes\n';
    expect(on.checkedWith).toEqual([yes]);

    await ask(on, "POST", "/box/prereleases", form, "prereleases=no");
    expect(on.env).toBe('# the box\nBOX_DOMAIN=example.org\nBOX_UIS="control"\nBOX_PRERELEASES=no\n');
    expect(on.checked).toBe(2);
    expect(on.downloads).toBe(2);
  });

  it("is refused from a page on another origin, and writes and checks nothing", async () => {
    const on = box("systemd");
    const before = on.env;
    const headers = { ...form, origin: "https://evil.example" };
    expect((await ask(on, "POST", "/box/prereleases", headers, "prereleases=yes")).status).toBe(403);
    expect(on.env).toBe(before);
    expect(on.checked).toBe(0);
  });
});

describe("on a box that downloads only on a press (#141)", () => {
  const off = () => {
    const on = box("systemd");
    on.env += "BOX_DOWNLOAD=no\n";
    return on;
  };

  it("POST /box/check checks and downloads", async () => {
    const on = off();
    await ask(on, "POST", "/box/check");
    expect([on.checked, on.downloads]).toEqual([1, 1]);
  });

  it("POST /box/prereleases checks and downloads nothing", async () => {
    const on = off();
    expect(await ask(on, "POST", "/box/prereleases", form, "prereleases=yes")).toMatchObject({ status: 204 });
    expect([on.checked, on.downloads]).toEqual([1, 0]);
  });
});

describe("the hourly tick, also as box starts", () => {
  const ticking = (due: boolean, env: string) => {
    const on = { checked: 0, downloads: 0 };
    return Object.assign(on, {
      due: async () => due,
      check: async () => void on.checked++,
      download: async () => void on.downloads++,
      automatic: () => downloads(async () => env),
    });
  };

  it("checks once a check is due, and downloads what the last check found", async () => {
    for (const [due, checked] of [[true, 1], [false, 0]] as const) {
      const on = ticking(due, "BOX_DOMAIN=\n");
      await tick(on);
      expect([on.checked, on.downloads]).toEqual([checked, 1]);
    }
  });

  it("on a box that downloads only on a press, checks when one is due and downloads nothing (#141)", async () => {
    for (const [due, checked] of [[true, 1], [false, 0]] as const) {
      const on = ticking(due, "BOX_DOMAIN=\nBOX_DOWNLOAD=no\n");
      await tick(on);
      expect([on.checked, on.downloads]).toEqual([checked, 0]);
    }
  });
});

describe("the box's time zone (#144)", () => {
  it("is the name the host's /etc/localtime links to under zoneinfo", () => {
    expect(zone("/usr/share/zoneinfo/Asia/Tokyo\n")).toBe("Asia/Tokyo");
    expect(zone("../usr/share/zoneinfo/America/Los_Angeles")).toBe("America/Los_Angeles");
  });

  it("is none where the link names no zone", () => {
    expect(zone("")).toBeNull();
    expect(zone("/etc/somewhere")).toBeNull();
  });
});

describe("POST /box/download", () => {
  /** A box that counts the downloads it starts, with no check before them. */
  const counting = () => {
    const on = box("systemd");
    on.download = async () => void on.downloads++;
    return on;
  };

  it("writes BOX_DOWNLOAD=no into box.env, keeping every other line, and checks and downloads nothing", async () => {
    const on = counting();
    const answer = await ask(on, "POST", "/box/download", form, "download=no");
    expect(answer).toMatchObject({ status: 204, body: "" });
    expect(on.env).toBe('# the box\nBOX_DOMAIN=example.org\nBOX_UIS="control"\nBOX_DOWNLOAD=no\n');
    expect([on.checked, on.downloads]).toEqual([0, 0]);
  });

  it("writes BOX_DOWNLOAD=yes and starts downloading what the last check found, without checking again", async () => {
    const on = counting();
    await ask(on, "POST", "/box/download", form, "download=no");
    await ask(on, "POST", "/box/download", form, "download=yes");
    expect(on.env).toBe('# the box\nBOX_DOMAIN=example.org\nBOX_UIS="control"\nBOX_DOWNLOAD=yes\n');
    expect([on.checked, on.downloads]).toEqual([0, 1]);
  });

  it("is refused from a page on another origin, and writes and downloads nothing", async () => {
    const on = counting();
    const before = on.env;
    expect((await ask(on, "POST", "/box/download", { ...form, origin: "https://evil.example" }, "download=yes")).status).toBe(403);
    expect(on.env).toBe(before);
    expect(on.downloads).toBe(0);
  });
});

describe("POST /box/update and POST /box/back", () => {
  it("start one and answer 204", async () => {
    const on = box("systemd");
    expect(await ask(on, "POST", "/box/update")).toMatchObject({ status: 204, body: "" });
    expect(await ask(on, "POST", "/box/back")).toMatchObject({ status: 204, body: "" });
    expect(on.started).toEqual(["update", "back"]);
  });

  it("answer 409 with the sentence that says why the box refused", async () => {
    const on = box("systemd", "The box is already updating, going back or applying the setup.");
    for (const url of ["/box/update", "/box/back"]) {
      expect(await ask(on, "POST", url)).toMatchObject({
        status: 409,
        body: "The box is already updating, going back or applying the setup.",
      });
    }
  });

  it("are refused from a page on another origin, and start nothing", async () => {
    const on = box("systemd");
    const headers = { host: HOST, origin: "https://evil.example" };
    expect((await ask(on, "POST", "/box/update", headers)).status).toBe(403);
    expect((await ask(on, "POST", "/box/back", headers)).status).toBe(403);
    expect(on.started).toEqual([]);
  });
});

describe("POST /box/setup", () => {
  const FORM = "ui=dccex&station=%2Fdev%2Fserial%2Fby-id%2Fnone&camera=%2Fdev%2Fv4l%2Fby-id%2Fnone";

  it("applies the form it was sent and sends the browser back to the page", async () => {
    const on = box("systemd");
    const answer = await ask(on, "POST", "/box/setup", { host: HOST, origin: `http://${HOST}` }, FORM);
    expect(answer).toMatchObject({ status: 303, headers: { location: "/box/" } });
    expect(on.applied).toEqual([FORM]);
  });

  it("answers 409 with the sentence that says why the box refused", async () => {
    const on = box("systemd", "The box is already updating, going back or applying the setup.");
    expect(await ask(on, "POST", "/box/setup", { host: HOST }, FORM)).toMatchObject({
      status: 409,
      body: "The box is already updating, going back or applying the setup.",
    });
  });

  it("is refused from a page on another origin, and applies nothing", async () => {
    const on = box("systemd");
    const headers = { host: HOST, origin: "https://evil.example" };
    expect((await ask(on, "POST", "/box/setup", headers, FORM)).status).toBe(403);
    expect(on.applied).toEqual([]);
  });
});

describe("anything else", () => {
  it("answers 404 and runs nothing", async () => {
    const on = box("systemd");
    for (const [method, url] of [
      ["GET", "/box/off"],
      ["POST", "/box"],
      ["PUT", "/box/off"],
      ["DELETE", "/box"],
      ["GET", "/boxes"],
      ["POST", "/box/off/now"],
      ["GET", "/"],
      ["GET", "/box/check"],
      ["GET", "/box/update"],
      ["GET", "/box/back"],
      ["GET", "/box/setup"],
      ["GET", "/box/prereleases"],
      ["POST", "/box/status"],
      ["POST", "/box/"],
      ["GET", "/box/server.mjs"],
      ["GET", "/box/../compose.yaml"],
    ] as const) {
      expect((await ask(on, method, url)).status, `${method} ${url}`).toBe(404);
    }
    expect(on.turnedOff).toBe(0);
    expect(on.checked).toBe(0);
    expect(on.started).toEqual([]);
    expect(on.applied).toEqual([]);
  });
});
