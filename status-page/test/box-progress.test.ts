// The release group while an update, going back or applying the setup runs:
// what it does, its steps, the pull bar and the 60-second countdown.

import { afterEach, describe, expect, it, vi } from "vitest";

import { BoxProgress } from "../src/box-progress.js";
import type { Run, Status, Step } from "../src/status.js";
import { STATUS } from "./box.js";
import { all, mounted, part, reads } from "./mounted.js";

/** An update to 2026.11.1 that has not listed its steps. */
const UPDATING: Run = {
  action: "update",
  from: "2026.11.0",
  to: "2026.11.1",
  started: "2026-11-12T09:58:00.000Z",
  step: "Starting control.",
  finished: null,
  passed: null,
  failure: null,
  running: true,
};

/** The step began at this time. */
const SINCE = "2026-11-12T10:00:00.000Z";

/** STATUS while the update runs, with `fields` changed. */
const running = (fields: Partial<Run> = {}): Status => ({ ...STATUS, updating: { ...UPDATING, ...fields } });

/** STATUS at step `at` of an update that downloads, with `fields` changed. */
const at = (step: Step | null, fields: Partial<Run> = {}): Status =>
  running({
    steps: ["download", "pull", "start", "watch", "probe", "prune"],
    at: step,
    since: SINCE,
    pull: null,
    building: false,
    ...fields,
  });

/** `box-progress`, mounted with `status`, 25.4 seconds after the step
 *  began. */
async function progress(status: Status): Promise<BoxProgress> {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-12T10:00:25.400Z"));
  const shown = document.createElement("box-progress");
  shown.status = status;
  return mounted(shown);
}

/** The step list, as `[state, what the step says]`. */
function steps(shown: BoxProgress): string[][] {
  return [...shown.renderRoot.querySelectorAll(".steps li")].map((item) => [
    item.classList.contains("done") ? "done" : item.classList.contains("current") ? "current" : "",
    (item.textContent ?? "").replace(/\s+/g, " ").trim(),
  ]);
}

const IMAGE = `ghcr.io/rails49/occupancy-service:5e6f7a8@sha256:${"1".repeat(64)}`;

afterEach(() => {
  vi.useRealTimers();
});

describe("box-progress", () => {
  it("lists the run's steps in the release group, ticking those done and spinning at the current one", async () => {
    const shown = await progress(at("start"));
    expect(reads(shown, "fieldset.group legend")).toBe("Release");
    expect(reads(shown, "p")).toBe("Updating to 2026.11.1");
    expect(steps(shown)).toEqual([
      ["done", "Download release"],
      ["done", "Pull images"],
      ["current", "Start stacks"],
      ["", "Watch for 60 seconds"],
      ["", "Probe"],
      ["", "Remove unused images"],
    ]);
    expect(shown.renderRoot.querySelectorAll("sl-spinner")).toHaveLength(1);
    expect(part(shown, ".steps li.current sl-spinner")).toBeTruthy();
  });

  it("lists the steps applying takes", async () => {
    const shown = await progress(
      at("stop", { action: "apply", to: "2026.11.0", steps: ["pull", "stop", "start", "watch", "probe"] }),
    );
    expect(reads(shown, "p")).toBe("Applying the setup");
    expect(steps(shown).map(([state, said]) => `${state} ${said}`)).toEqual([
      "done Pull images",
      "current Stop stacks no longer chosen",
      " Start stacks",
      " Watch for 60 seconds",
      " Probe",
    ]);
  });

  it("while it pulls, shows the run's bytes downloaded of its total, in the bar and beside the image", async () => {
    const shown = await progress(
      at("pull", {
        pull: { image: IMAGE, index: 6, count: 7, current: 300e6, total: 1.2e9, run: { current: 1.1e9, total: 1.6e9 } },
      }),
    );
    expect(steps(shown)[1]).toEqual(["current", "Pull images occupancy-service; 1.1 GB of 1.6 GB"]);
    const bar = part(shown, ".steps li.current sl-progress-bar");
    expect(bar.getAttribute("value")).toBe(String((1.1e9 / 1.6e9) * 100));
    expect(bar.getAttribute("label")).toBe("1.1 GB of 1.6 GB");
  });

  it("from a run whose manifest lists no layers, shows the images done of all of them, and the image by its last name with its bytes", async () => {
    const shown = await progress(at("pull", { pull: { image: IMAGE, index: 6, count: 7, current: 300e6, total: 1.2e9 } }));
    expect(steps(shown)[1]).toEqual(["current", "Pull images occupancy-service, 300 MB of 1.2 GB"]);
    const bar = part(shown, ".steps li.current sl-progress-bar");
    expect(bar.getAttribute("value")).toBe(String((5 / 7) * 100));
    expect(bar.getAttribute("label")).toBe("5 of 7");
    // No bytes before the stream says any.
    shown.status = at("pull", { pull: { image: "traefik:v3.7", index: 1, count: 7, current: 0, total: 0 } });
    await shown.updateComplete;
    expect(steps(shown)[1]).toEqual(["current", "Pull images traefik"]);
    expect(part(shown, "sl-progress-bar").getAttribute("label")).toBe("0 of 7");
  });

  it("while JMRI is built, says so with no bar", async () => {
    const shown = await progress(at("pull", { building: true }));
    expect(steps(shown)[1]).toEqual(["current", "Building JMRI"]);
    expect(shown.renderRoot.querySelector("sl-progress-bar")).toBeNull();
  });

  it("keeps the current step's spinner and the pull bar with their step when the status changes", async () => {
    const pull = { image: IMAGE, index: 6, count: 7, current: 300e6, total: 1.2e9 };
    const shown = await progress(at("pull", { pull: { ...pull, run: { current: 0.4e9, total: 1.6e9 } } }));
    const item = part(shown, ".steps li.current");
    const spinner = part(shown, "sl-spinner");
    const bar = part(shown, "sl-progress-bar");
    shown.status = at("pull", {
      steps: ["pull", "start", "watch", "probe", "prune"],
      pull: { ...pull, run: { current: 0.8e9, total: 1.6e9 } },
    });
    await shown.updateComplete;
    expect(part(shown, ".steps li.current")).toBe(item);
    expect(part(shown, "sl-spinner")).toBe(spinner);
    expect(part(shown, "sl-progress-bar")).toBe(bar);
    expect(bar.getAttribute("value")).toBe("50");
  });

  it("counts down the 60 seconds from when they began, one each second, and stops at 0", async () => {
    const shown = await progress(at("watch"));
    expect(steps(shown)[3]).toEqual(["current", "Watching for 60 seconds: 35 left"]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(steps(shown)[3]).toEqual(["current", "Watching for 60 seconds: 34 left"]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(steps(shown)[3]).toEqual(["current", "Watching for 60 seconds: 33 left"]);
    await vi.advanceTimersByTimeAsync(33_000);
    expect(steps(shown)[3]).toEqual(["current", "Watching for 60 seconds: 0 left"]);
    await vi.advanceTimersByTimeAsync(5000);
    expect(steps(shown)[3]).toEqual(["current", "Watching for 60 seconds: 0 left"]);
  });

  it("from a run that lists no steps, says what it is doing in a sentence", async () => {
    const shown = await progress(running());
    expect(all(shown, "p.updating")).toEqual(["Updating to 2026.11.1: Starting control."]);
    expect(shown.renderRoot.querySelector(".steps")).toBeNull();
    shown.status = running({ action: "back", to: "2026.10.2" });
    await shown.updateComplete;
    expect(reads(shown, "p.updating")).toBe("Going back to 2026.10.2: Starting control.");
    shown.status = running({ action: "apply", to: "2026.11.0", step: "Stopping dccex." });
    await shown.updateComplete;
    expect(reads(shown, "p.updating")).toBe("Applying the setup: Stopping dccex.");
  });

  it("says what it is doing in a sentence before it has listed its steps", async () => {
    const shown = await progress(running({ steps: [], at: null }));
    expect(reads(shown, "p.updating")).toBe("Updating to 2026.11.1: Starting control.");
  });

  it("from such a run, says which image it pulls, of how many, and its bytes", async () => {
    const shown = await progress(
      running({
        to: "2026.11.5",
        step: "Pulling occupancy-service's images.",
        pull: { image: IMAGE, index: 4, count: 10, current: 1.23e9, total: 2.34e9 },
      }),
    );
    expect(reads(shown, "p.updating")).toBe(
      "Updating to 2026.11.5: Pulling occupancy-service's images: ghcr.io/rails49/occupancy-service, image 4 of 10, 1.2 GB of 2.3 GB.",
    );
    shown.status = running({
      to: "2026.11.5",
      step: "Pulling occupancy-service's images.",
      pull: { image: "traefik:v3.7", index: 1, count: 10, current: 12.4e6, total: 48e6 },
    });
    await shown.updateComplete;
    expect(reads(shown, "p.updating")).toBe(
      "Updating to 2026.11.5: Pulling occupancy-service's images: traefik, image 1 of 10, 12 MB of 48 MB.",
    );
    shown.status = running({ to: "2026.11.5", step: "Pulling jmri's images.", pull: null });
    await shown.updateComplete;
    expect(reads(shown, "p.updating")).toBe("Updating to 2026.11.5: Pulling jmri's images.");
  });
});
