// The page's shell: look's band, a title carrying the box's name from
// `GET /box/status`, and the groups it draws from that status.

import { describe, expect, it, vi } from "vitest";

import { BoxPage } from "../src/box-page.js";
import type { BoxProgress } from "../src/box-progress.js";
import type { Run } from "../src/status.js";
import { box, STATUS } from "./box.js";
import { mounted, part } from "./mounted.js";

/** An update to 2026.11.1 that runs. */
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

/** The page, mounted, once it has drawn what its first fetch answered. */
async function page(): Promise<BoxPage> {
  const shown = await mounted(document.createElement("box-page"));
  await vi.waitFor(() => expect(shown.renderRoot.querySelector("look-about")?.getAttribute("name")).not.toBe(""));
  return shown;
}

describe("box-page", () => {
  it("draws look's band for the status page, with the box's name", async () => {
    box(() => STATUS);
    const shown = await page();
    const band = shown.renderRoot.querySelector("look-shell look-band");
    expect(band?.getAttribute("ui")).toBe("status");
    expect(band?.getAttribute("help")).toBe("https://github.com/rails49/installation#the-status-page");
    expect(band?.querySelector("look-about")?.getAttribute("name")).toBe("box.example.org");
  });

  it("names the box in the title", async () => {
    box(() => STATUS);
    await page();
    expect(document.title).toBe("Server (box) status & updates: box.example.org");
  });

  it("fetches the status from GET /box/status", async () => {
    const sent = box(() => STATUS);
    await page();
    expect(sent).toEqual([{ method: "GET", url: "/box/status", body: "" }]);
  });

  it("shows the run in place of the release group while one runs", async () => {
    box(() => ({ ...STATUS, updating: UPDATING }));
    const shown = await page();
    const progress = part(shown, "main box-progress") as BoxProgress;
    expect(progress.status?.updating).toEqual(UPDATING);
  });

  it("shows no run once it has ended", async () => {
    box(() => ({ ...STATUS, updating: { ...UPDATING, running: false } }));
    const shown = await page();
    expect(shown.renderRoot.querySelector("box-progress")).toBeNull();
  });
});
