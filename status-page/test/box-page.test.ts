// The page's shell: look's band, a title carrying the box's name from
// `GET /box/status`, and the groups in the page's order.

import { describe, expect, it, vi } from "vitest";

import { BoxPage } from "../src/box-page.js";
import type { BoxProgress } from "../src/box-progress.js";
import type { BoxRelease } from "../src/box-release.js";
import type { Run } from "../src/status.js";
import { box, STATUS } from "./box.js";
import { all, mounted, part } from "./mounted.js";

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

  it("shows the run in place of the release group, after its heading, while one runs", async () => {
    box(() => ({ ...STATUS, updating: UPDATING }));
    const shown = await page();
    const progress = part(shown, "main > box-progress") as BoxProgress;
    expect(progress.status?.updating).toEqual(UPDATING);
    expect(progress.previousElementSibling?.textContent).toBe("Release and setup");
    expect(shown.renderRoot.querySelector("box-release")).toBeNull();
  });

  it("goes back to the release group's own rows once the run has ended", async () => {
    box(() => ({ ...STATUS, updating: { ...UPDATING, running: false } }));
    const shown = await page();
    expect(shown.renderRoot.querySelector("box-progress")).toBeNull();
    expect((part(shown, "main > box-release") as BoxRelease).status).toBe(shown.status);
  });

  it("shows the errors and notes, then the release and the setup, then the status, then the log bundle", async () => {
    box(() => STATUS);
    const shown = await page();
    const main = shown.renderRoot.querySelector("main")!;
    expect([...main.children].map((child) => child.localName)).toEqual([
      "box-messages",
      "h2",
      "box-release",
      "h2",
      "box-stacks",
      "box-facts",
      "p",
    ]);
    expect(all(shown, "main > h2")).toEqual(["Release and setup", "Status"]);
    for (const group of ["box-messages", "box-release", "box-stacks", "box-facts"] as const) {
      expect(main.querySelector(group)?.status).toBe(shown.status);
    }
  });

  it("downloads the log bundle from GET /box/bundle", async () => {
    box(() => STATUS);
    const link = part(await page(), "main > p a");
    expect(link.textContent).toBe("Download the log bundle");
    expect(link.getAttribute("href")).toBe("/box/bundle");
    expect(link.hasAttribute("download")).toBe(true);
  });
});
