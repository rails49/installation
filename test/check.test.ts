/**
 * The check for a new release (#65 decision 4), asserted against `check()`
 * with GitHub's answer and the state file handed in: no network, no box.
 */

import { describe, expect, it } from "vitest";

import { check, due, LATEST } from "../box/check.mjs";

const NOW = new Date("2026-11-12T10:00:00Z");
const BEFORE = { checked: "2026-11-11T08:00:00Z", succeeded: "2026-11-11T08:00:00Z", latest: "2026.11.0" };

/** GitHub answering `answer`, or failing to be reached, and the state file
 *  holding `saved`. Collects what was asked and what was written. */
function io(answer: Response | Error, saved: object | null = BEFORE, now = NOW) {
  const seen = { asked: [] as string[], written: null as object | null };
  return {
    seen,
    fetch: async (url: string) => {
      seen.asked.push(url);
      if (answer instanceof Error) throw answer;
      return answer;
    },
    read: async () => (saved === null ? null : JSON.stringify(saved)),
    write: async (text: string) => void (seen.written = JSON.parse(text)),
    now: () => now,
  };
}

const latest = (tag: string) => new Response(JSON.stringify({ tag_name: tag }), { status: 200 });

describe("a check", () => {
  it("asks GitHub for the installation's latest release, which is never a pre-release", async () => {
    const on = io(latest("2026.11.1"));
    await check(on);
    expect(on.seen.asked).toEqual([LATEST]);
    expect(LATEST).toBe("https://api.github.com/repos/rails49/installation/releases/latest");
  });

  it("keeps the latest release and when it succeeded", async () => {
    const on = io(latest("2026.11.1"));
    await check(on);
    expect(on.seen.written).toEqual({
      checked: "2026-11-12T10:00:00.000Z",
      succeeded: "2026-11-12T10:00:00.000Z",
      latest: "2026.11.1",
    });
  });

  it("succeeds with no release when none has been marked full yet", async () => {
    const on = io(new Response('{"message":"Not Found"}', { status: 404 }));
    await check(on);
    expect(on.seen.written).toMatchObject({ succeeded: "2026-11-12T10:00:00.000Z", latest: null });
  });

  it("offline, keeps when the last one succeeded and what it found", async () => {
    const on = io(new TypeError("fetch failed"));
    await check(on);
    expect(on.seen.written).toEqual({ ...BEFORE, checked: "2026-11-12T10:00:00.000Z" });
  });

  it("fails on any other answer from GitHub", async () => {
    const on = io(new Response("rate limited", { status: 403 }));
    await check(on);
    expect(on.seen.written).toEqual({ ...BEFORE, checked: "2026-11-12T10:00:00.000Z" });
  });

  it("is the first on a box that has never checked", async () => {
    const on = io(new TypeError("fetch failed"), null);
    await check(on);
    expect(on.seen.written).toEqual({ checked: "2026-11-12T10:00:00.000Z", succeeded: null, latest: null });
  });
});

describe("a check is due", () => {
  it("once a day after the last one that succeeded", async () => {
    expect(await due(io(latest("x"), BEFORE, new Date("2026-11-12T07:59:00Z")))).toBe(false);
    expect(await due(io(latest("x"), BEFORE, new Date("2026-11-12T08:00:00Z")))).toBe(true);
  });

  it("when none has ever succeeded", async () => {
    expect(await due(io(latest("x"), null))).toBe(true);
    expect(await due(io(latest("x"), { checked: BEFORE.checked, succeeded: null, latest: null }))).toBe(true);
  });
});
