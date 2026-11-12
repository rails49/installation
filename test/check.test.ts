/**
 * The check for a new release (#65 decision 4), asserted against `check()`
 * with GitHub's answer and the state file handed in: no network, no box.
 */

import { describe, expect, it } from "vitest";

import { check, due, LATEST, RELEASES } from "../box/check.mjs";

const NOW = new Date("2026-11-12T10:00:00Z");
const BEFORE = { checked: "2026-11-11T08:00:00Z", succeeded: "2026-11-11T08:00:00Z", latest: "2026.11.0" };

/** GitHub answering `answer`, or failing to be reached, the state file
 *  holding `saved`, and `box.env` offering pre-releases or not. Collects what
 *  was asked and what was written. */
function io(answer: Response | Error, saved: object | null = BEFORE, now = NOW, prereleases = false) {
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
    prereleases: async () => prereleases,
  };
}

const latest = (tag: string) => new Response(JSON.stringify({ tag_name: tag }), { status: 200 });

describe("a check", () => {
  it("without pre-releases, asks GitHub for the installation's latest release, which is never a pre-release", async () => {
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
      prerelease: false,
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
    expect(on.seen.written).toEqual({ checked: "2026-11-12T10:00:00.000Z", succeeded: null, latest: null, prerelease: false });
  });
});

describe("a check on a box offered pre-releases", () => {
  /** GitHub's list of releases, each as `[tag, prerelease, draft]`. */
  const releases = (...list: [string, boolean, boolean?][]) =>
    new Response(
      JSON.stringify(list.map(([tag_name, prerelease, draft = false]) => ({ tag_name, prerelease, draft }))),
      { status: 200 },
    );

  it("asks GitHub for every release, and takes a pre-release newer than the latest full one", async () => {
    const on = io(releases(["2026.11.2", true], ["2026.11.1", false]), BEFORE, NOW, true);
    await check(on);
    expect(on.seen.asked).toEqual([RELEASES]);
    expect(RELEASES).toBe("https://api.github.com/repos/rails49/installation/releases?per_page=100");
    expect(on.seen.written).toEqual({
      checked: "2026-11-12T10:00:00.000Z",
      succeeded: "2026-11-12T10:00:00.000Z",
      latest: "2026.11.2",
      prerelease: true,
    });
  });

  it("takes the newest by release number, not by the list's order, and skips a draft", async () => {
    const on = io(
      releases(["2026.12.0", false, true], ["2026.11.9", true], ["2026.11.10", false], ["2026.10.12", true]),
      BEFORE,
      NOW,
      true,
    );
    await check(on);
    expect(on.seen.written).toMatchObject({ latest: "2026.11.10", prerelease: false });
  });

  it("succeeds with no release when there is none", async () => {
    const on = io(releases(), BEFORE, NOW, true);
    await check(on);
    expect(on.seen.written).toMatchObject({ succeeded: "2026-11-12T10:00:00.000Z", latest: null, prerelease: false });
  });

  it("offline, keeps when the last one succeeded and what it found", async () => {
    const before = { ...BEFORE, latest: "2026.11.2", prerelease: true };
    for (const answer of [new TypeError("fetch failed"), new Response("rate limited", { status: 403 })]) {
      const on = io(answer, before, NOW, true);
      await check(on);
      expect(on.seen.written).toEqual({ ...before, checked: "2026-11-12T10:00:00.000Z" });
    }
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
