/**
 * The two requests a UI may make of the box, asserted against the script's
 * request handling alone: no container, no socket, no `nsenter`. What the box
 * is and what turning it off does are handed in, so a test turns nothing off
 * and can count how many times it was asked to.
 */

import { describe, expect, it } from "vitest";

import { handle } from "../box/server.mjs";

const HOST = "control.example.org";

/** The status a box answers with, as `status()` would gather it. */
const STATUS = {
  name: "example.org",
  address: "192.168.1.20",
  release: null,
  stacks: [{ stack: "installation", state: "running", commit: null, local_build: true }],
  update: { latest: null, available: false, newer: false, checked: null, succeeded: null, could_not_check: false },
  disk: { free: 20e9, total: 64e9 },
  docker: { version: "29.1.3", tested: [], log_driver: "local" },
  certificate: { expires: "2027-01-30T00:00:00.000Z", valid: true },
  resolves: { addresses: ["192.168.1.20"], to_this_box: true },
  updating: null,
  back: null,
  failures: [],
  notes: [],
  setup: { uis: [], devices: [] },
};

/** A box whose PID 1 has this name, counting the times it is turned off and
 *  the times it is asked to check for a release, and recording each update
 *  or going back it is asked to start. `refusal` is why it refuses to. */
function box(pid1: string, refusal: string | null = null) {
  const counted = {
    pid1,
    turnedOff: 0,
    checked: 0,
    started: [] as string[],
    applied: [] as string[],
    turnOff: () => void counted.turnedOff++,
    status: async () => STATUS,
    check: async () => void counted.checked++,
    start: async (action: "update" | "back") => {
      counted.started.push(action);
      return refusal;
    },
    apply: async (body: string) => {
      counted.applied.push(body);
      return refusal;
    },
    bundle: async () => ({ name: "example.org-20261112T1000.tar.gz", body: Buffer.from("tar") }),
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
    expect(JSON.parse(String(answer.body))).toEqual({ can_turn_off: true });
  });

  it("answers the same with a query string", async () => {
    expect((await ask(box("systemd"), "GET", "/box?t=1")).status).toBe(200);
  });

  it("answers no where PID 1 is anything else", async () => {
    // Docker Desktop's virtual machine, which is what a Mac's PID 1 is.
    for (const pid1 of ["init", "tini", "node", ""]) {
      const answer = await ask(box(pid1), "GET", "/box");
      expect(answer.status, pid1).toBe(200);
      expect(JSON.parse(String(answer.body)), pid1).toEqual({ can_turn_off: false });
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
      expect(JSON.parse(String(answer.body)), accept).toEqual({ can_turn_off: true });
      expect(answer.headers, accept).toEqual({ vary: "accept" });
    }
  });

  it("refuses a page on another origin before sending it anywhere", async () => {
    const headers = { host: HOST, origin: "https://evil.example", accept: "text/html" };
    expect((await ask(box("systemd"), "GET", "/box", headers)).status).toBe(403);
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

describe("GET /box/", () => {
  it("answers the status page as HTML", async () => {
    const answer = await ask(box("systemd"), "GET", "/box/");
    expect(answer).toMatchObject({ status: 200, type: "text/html; charset=utf-8" });
    expect(String(answer.body)).toContain("example.org");
  });

  it("serves the page's stylesheet and look's stylesheet and bundle under /box", async () => {
    const css = await ask(box("systemd"), "GET", "/box/page.css");
    expect(css).toMatchObject({ status: 200, type: "text/css; charset=utf-8" });
    const look = await ask(box("systemd"), "GET", "/box/look/look.bundle.js");
    expect(look).toMatchObject({ status: 200, type: "text/javascript; charset=utf-8" });
    expect(String(look.body)).toContain("LookBand");
    const lookCss = await ask(box("systemd"), "GET", "/box/look/look.css");
    expect(lookCss).toMatchObject({ status: 200, type: "text/css; charset=utf-8" });
    expect(String(lookCss.body)).toContain("look-band:not(:defined)");
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
  it("checks for a release once and sends the browser back to the page", async () => {
    const on = box("systemd");
    const answer = await ask(on, "POST", "/box/check");
    expect(answer).toMatchObject({ status: 303, headers: { location: "/box/" } });
    expect(on.checked).toBe(1);
  });

  it("is refused from a page on another origin, and checks nothing", async () => {
    const on = box("systemd");
    const headers = { host: HOST, origin: "https://evil.example" };
    expect((await ask(on, "POST", "/box/check", headers)).status).toBe(403);
    expect(on.checked).toBe(0);
  });
});

describe("POST /box/update and POST /box/back", () => {
  it("start one and send the browser back to the page", async () => {
    const on = box("systemd");
    expect(await ask(on, "POST", "/box/update")).toMatchObject({ status: 303, headers: { location: "/box/" } });
    expect(await ask(on, "POST", "/box/back")).toMatchObject({ status: 303, headers: { location: "/box/" } });
    expect(on.started).toEqual(["update", "back"]);
  });

  it("answer 409 with the sentence that says why the box refused", async () => {
    const on = box("systemd", "The box is already updating, going back or applying the setup.");
    expect(await ask(on, "POST", "/box/update")).toMatchObject({
      status: 409,
      body: "The box is already updating, going back or applying the setup.",
    });
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

describe("GET /box/tick.js", () => {
  it("serves the script that ticks control", async () => {
    const answer = await ask(box("systemd"), "GET", "/box/tick.js");
    expect(answer).toMatchObject({ status: 200, type: "text/javascript; charset=utf-8" });
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
