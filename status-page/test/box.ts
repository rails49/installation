// A box behind a fake `fetch`: the status it answers, and every request the
// page sent it.

import { vi } from "vitest";

import type { Status } from "../src/status.js";

/** A request the page sent. */
export interface Sent {
  method: string;
  url: string;
  body: string;
}

/** How the fake box answers one request: a status to send as JSON, a
 *  Response, or an Error to reject with, as a box that does not answer. */
export type Answer = Status | Response | Error;

/**
 * Puts a fake box behind `fetch`. `answer` is asked for each request and may
 * change between them. Returns the requests, in the order they were sent.
 */
export function box(answer: (sent: Sent) => Answer): Sent[] {
  const sent: Sent[] = [];
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const request: Sent = {
      method: init.method ?? "GET",
      url: String(input),
      body: init.body === undefined || init.body === null ? "" : String(init.body),
    };
    sent.push(request);
    const answered = answer(request);
    if (answered instanceof Error) throw answered;
    if (answered instanceof Response) return answered;
    return new Response(JSON.stringify(answered), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  return sent;
}

/** A status as `box` sends it: a box with a box name, running a release,
 *  with a newer one downloaded, nothing running. */
export const STATUS: Status = {
  name: "box.example.org",
  address: "192.0.2.20",
  release: "2026.11.0",
  stacks: [
    {
      stack: "installation",
      state: "running",
      commit: "8f7e6d5c4b3a29180716253443526170819a0b1c",
      local_build: false,
      memory: 60 * 2 ** 20,
      disk: 365e6,
    },
    {
      stack: "control",
      state: "running",
      commit: "1c3f69b0e5a3d2c1b4a5968778695a4b3c2d1e0f",
      local_build: false,
      memory: 1200 * 2 ** 20,
      disk: 1.2e9,
    },
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
  updating: null,
  download: {
    release: "2026.11.1",
    started: "2026-11-12T08:01:00.000Z",
    finished: "2026-11-12T08:20:00.000Z",
    downloaded: true,
    failure: null,
    disk: null,
    bytes: { current: 1.6e9, total: 1.6e9 },
    running: false,
  },
  back: "2026.10.2",
  disk: { free: 20e9, total: 64e9 },
  memory: { used: 2.5 * 2 ** 30, total: 8 * 2 ** 30 },
  docker: { version: "29.1.3", tested: ["29.1.3", "29.0.4"], log_driver: "local" },
  certificate: { expires: "2027-01-30T00:00:00.000Z", valid: true },
  resolves: { addresses: ["192.0.2.20"], to_this_box: true },
  failures: [],
  notes: [],
  setup: {
    uis: ["control", "jmri"],
    stacks: [
      { stack: "control", label: "control" },
      { stack: "dccex", label: "dccex" },
      { stack: "jmri", label: "jmri" },
      { stack: "occupancy-service", label: "occupancy" },
    ],
    devices: [],
  },
};
