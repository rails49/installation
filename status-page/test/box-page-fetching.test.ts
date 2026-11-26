// How the page keeps up with the box: how often it fetches the status, what
// it says while `box` does not answer, and when it reloads. Time is fake.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BoxPage } from "../src/box-page.js";
import type { Status } from "../src/status.js";
import { box, STATUS, type Answer, type Sent } from "./box.js";
import { mounted, reads } from "./mounted.js";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const RUNNING: Status = {
  ...STATUS,
  updating: {
    action: "update",
    from: "2026.11.0",
    to: "2026.11.1",
    started: "2026-11-12T09:00:00.000Z",
    step: "Pulling the images",
    finished: null,
    passed: null,
    failure: null,
    running: true,
  },
};

const DOWNLOADING: Status = {
  ...STATUS,
  download: { ...STATUS.download!, finished: null, downloaded: false, running: true },
};

const BUILT = "8f7e6d5c4b3a29180716253443526170819a0b1c";
const NEXT = "0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c";

/** A status naming `commit` as the installation's. */
function on(commit: string | null): Status {
  return {
    ...STATUS,
    stacks: STATUS.stacks.map((stack) => (stack.stack === "installation" ? { ...stack, commit } : stack)),
  };
}

/** The page built from `commit`, mounted, once its first fetch is drawn.
 *  Returns it with the times it reloaded. */
async function page(commit = ""): Promise<{ shown: BoxPage; reloads: () => number }> {
  const shown = document.createElement("box-page");
  shown.commit = commit;
  const reload = vi.fn();
  shown.reload = reload;
  await mounted(shown);
  await vi.advanceTimersByTimeAsync(0);
  return { shown, reloads: () => reload.mock.calls.length };
}

/** A fake box answering `answer`. Returns the second, counted from now, at
 *  which each request was sent. */
function clock(answer: (sent: Sent) => Answer): number[] {
  const start = Date.now();
  const at: number[] = [];
  box((request) => {
    at.push((Date.now() - start) / 1000);
    return answer(request);
  });
  return at;
}

describe("box-page fetching", () => {
  it("fetches every 30 seconds while nothing runs", async () => {
    const at = clock(() => STATUS);
    await page();
    await vi.advanceTimersByTimeAsync(90_000);
    expect(at).toEqual([0, 30, 60, 90]);
  });

  it("fetches every 2 seconds while a run goes, and every 30 once it has ended", async () => {
    let answer = RUNNING;
    const at = clock(() => answer);
    await page();
    await vi.advanceTimersByTimeAsync(6_000);
    answer = STATUS;
    await vi.advanceTimersByTimeAsync(62_000);
    expect(at).toEqual([0, 2, 4, 6, 8, 38, 68]);
  });

  it("fetches every 2 seconds while a download goes", async () => {
    const at = clock(() => DOWNLOADING);
    await page();
    await vi.advanceTimersByTimeAsync(6_000);
    expect(at).toEqual([0, 2, 4, 6]);
  });

  it("keeps what it showed and says the box is restarting while a fetch fails", async () => {
    let answer: Answer = STATUS;
    box(() => answer);
    const { shown } = await page();
    expect(reads(shown, ".restarting")).toBeNull();
    answer = new Error("box is being recreated");
    await vi.advanceTimersByTimeAsync(30_000);
    expect(reads(shown, ".restarting")).toBe("The box is restarting.");
    expect(shown.renderRoot.querySelector("look-about")?.getAttribute("name")).toBe("box.example.org");
    await vi.advanceTimersByTimeAsync(178_000);
    expect(reads(shown, ".restarting")).toBe("The box is restarting.");
    await vi.advanceTimersByTimeAsync(2_000);
    expect(reads(shown, ".restarting")).toBe("The box has not answered for 3 minutes.");
  });

  it("says the box is restarting where it answers with an error", async () => {
    let answer: Answer = STATUS;
    box(() => answer);
    const { shown } = await page();
    answer = new Response("Bad Gateway", { status: 502 });
    await vi.advanceTimersByTimeAsync(30_000);
    expect(reads(shown, ".restarting")).toBe("The box is restarting.");
  });

  it("fetches every 2 seconds while the box does not answer, and comes back once it does", async () => {
    let answer: Answer = STATUS;
    const at = clock(() => answer);
    const { shown } = await page();
    answer = new Error("box is being recreated");
    await vi.advanceTimersByTimeAsync(34_000);
    answer = { ...STATUS, name: "box2.example.org" };
    await vi.advanceTimersByTimeAsync(2_000);
    expect(reads(shown, ".restarting")).toBeNull();
    expect(shown.renderRoot.querySelector("look-about")?.getAttribute("name")).toBe("box2.example.org");
    await vi.advanceTimersByTimeAsync(30_000);
    expect(at).toEqual([0, 30, 32, 34, 36, 66]);
  });

  it("starts the 3 minutes again after the box has answered", async () => {
    let answer: Answer = new Error("box is being recreated");
    box(() => answer);
    const { shown } = await page();
    await vi.advanceTimersByTimeAsync(170_000);
    answer = STATUS;
    await vi.advanceTimersByTimeAsync(2_000);
    answer = new Error("box is being recreated");
    await vi.advanceTimersByTimeAsync(50_000);
    expect(reads(shown, ".restarting")).toBe("The box is restarting.");
  });

  it("reloads once when the box runs another installation commit", async () => {
    let answer = on(BUILT);
    box(() => answer);
    const { reloads } = await page(BUILT);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(reloads()).toBe(0);
    answer = on(NEXT);
    await vi.advanceTimersByTimeAsync(90_000);
    expect(reloads()).toBe(1);
  });

  it("reloads on a new commit that comes back after the box did not answer", async () => {
    let answer: Answer = { ...on(BUILT), updating: RUNNING.updating };
    box(() => answer);
    const { reloads } = await page(BUILT);
    answer = new Error("box is being recreated");
    await vi.advanceTimersByTimeAsync(10_000);
    answer = on(NEXT);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(reloads()).toBe(1);
  });

  it("never reloads where the status names no installation commit", async () => {
    let answer = on(BUILT);
    box(() => answer);
    const { reloads } = await page(BUILT);
    answer = on(null);
    await vi.advanceTimersByTimeAsync(60_000);
    answer = on("");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(reloads()).toBe(0);
  });

  it("never reloads where the page was built from no commit", async () => {
    box(() => on(NEXT));
    const { reloads } = await page("");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(reloads()).toBe(0);
  });

  it("fetches at once when asked, as after a press, and counts the 30 seconds from then", async () => {
    const at = clock(() => STATUS);
    const { shown } = await page();
    await vi.advanceTimersByTimeAsync(10_000);
    await shown.refresh();
    await vi.advanceTimersByTimeAsync(40_000);
    expect(at).toEqual([0, 10, 40]);
  });
});
