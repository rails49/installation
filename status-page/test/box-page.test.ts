// The page's shell: look's band, and a title carrying the box's name from
// `GET /box/status`.

import { describe, expect, it, vi } from "vitest";

import { BoxPage } from "../src/box-page.js";
import { box, STATUS } from "./box.js";
import { mounted } from "./mounted.js";

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
});
