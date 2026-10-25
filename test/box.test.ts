/**
 * The two requests a UI may make of the box, asserted against the script's
 * request handling alone: no container, no socket, no `nsenter`. What the box
 * is and what turning it off does are handed in, so a test turns nothing off
 * and can count how many times it was asked to.
 */

import { describe, expect, it } from "vitest";

import { handle } from "../box/server.mjs";

const HOST = "control.gleis49.org";

/** A box whose PID 1 has this name, counting the times it is turned off. */
function box(pid1: string) {
  const counted = { pid1, turnedOff: 0, turnOff: () => void counted.turnedOff++ };
  return counted;
}

function ask(
  on: ReturnType<typeof box>,
  method: string,
  url: string,
  headers: Record<string, string> = { host: HOST },
) {
  return handle({ method, url, headers }, on);
}

describe("GET /box", () => {
  it("answers yes where PID 1 is systemd", () => {
    const answer = ask(box("systemd"), "GET", "/box");
    expect(answer.status).toBe(200);
    expect(JSON.parse(answer.body)).toEqual({ can_turn_off: true });
  });

  it("answers the same with a query string", () => {
    expect(ask(box("systemd"), "GET", "/box?t=1").status).toBe(200);
  });

  it("answers no where PID 1 is anything else", () => {
    // Docker Desktop's virtual machine, which is what a Mac's PID 1 is.
    for (const pid1 of ["init", "tini", "node", ""]) {
      const answer = ask(box(pid1), "GET", "/box");
      expect(answer.status, pid1).toBe(200);
      expect(JSON.parse(answer.body), pid1).toEqual({ can_turn_off: false });
    }
  });
});

describe("POST /box/off", () => {
  it("answers 202 with nothing and turns the box off once", () => {
    const on = box("systemd");
    expect(ask(on, "POST", "/box/off")).toMatchObject({ status: 202, body: "" });
    expect(on.turnedOff).toBe(1);
  });

  it("refuses where the box cannot be turned off from here, and runs nothing", () => {
    const on = box("init");
    expect(ask(on, "POST", "/box/off")).toMatchObject({
      status: 409,
      body: "this server cannot be turned off from here",
    });
    expect(on.turnedOff).toBe(0);
  });
});

describe("a request from a page", () => {
  it("is refused when the page is on another origin, and runs nothing", () => {
    for (const origin of [
      "https://evil.example",
      `https://${HOST}:8443`,
      `https://jmri.gleis49.org`,
      "null",
    ]) {
      const on = box("systemd");
      for (const [method, url] of [["GET", "/box"], ["POST", "/box/off"]] as const) {
        expect(ask(on, method, url, { host: HOST, origin }), origin).toMatchObject({
          status: 403,
          body: "refused: a page on another origin",
        });
      }
      expect(on.turnedOff, origin).toBe(0);
    }
  });

  it("is refused when it names no origin and carries no Host", () => {
    // `null` parses to no host, and no `Host` is no host either; the two are
    // not a match.
    const on = box("systemd");
    expect(ask(on, "POST", "/box/off", { origin: "null" }).status).toBe(403);
    expect(on.turnedOff).toBe(0);
  });

  it("goes through when the page is on the name it was sent to", () => {
    // TLS ends at the door, so the scheme is not compared.
    const on = box("systemd");
    const headers = { host: HOST, origin: `https://${HOST}` };
    expect(ask(on, "GET", "/box", headers).status).toBe(200);
    expect(ask(on, "POST", "/box/off", headers).status).toBe(202);
    expect(on.turnedOff).toBe(1);
  });

  it("goes through with no Origin at all", () => {
    // `curl`, and a same-origin GET, which browsers send without one.
    const on = box("systemd");
    expect(ask(on, "GET", "/box").status).toBe(200);
    expect(ask(on, "POST", "/box/off").status).toBe(202);
    expect(on.turnedOff).toBe(1);
  });
});

describe("anything else", () => {
  it("answers 404 and runs nothing", () => {
    const on = box("systemd");
    for (const [method, url] of [
      ["GET", "/box/off"],
      ["POST", "/box"],
      ["PUT", "/box/off"],
      ["DELETE", "/box"],
      ["GET", "/boxes"],
      ["POST", "/box/off/now"],
      ["GET", "/"],
    ] as const) {
      expect(ask(on, method, url).status, `${method} ${url}`).toBe(404);
    }
    expect(on.turnedOff).toBe(0);
  });
});
