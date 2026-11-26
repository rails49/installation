// The release group's presses, as `box-page` sends them: each posts its
// route with its form-encoded body, and the page fetches the status at once
// after. A refusal's sentence is shown among the errors.

import type SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.js";
import { describe, expect, it, vi } from "vitest";

import { BoxMessages } from "../src/box-messages.js";
import { BoxPage } from "../src/box-page.js";
import { BoxRelease } from "../src/box-release.js";
import { box, STATUS, type Answer, type Sent } from "./box.js";
import { mounted, part } from "./mounted.js";

const REFUSED = "The box is already updating, going back or applying the setup.";

/** The page, mounted over a box that answers posts with `posted`, once it
 *  has drawn its first fetch. Returns it, its release group and what it
 *  sent. */
async function page(posted: (sent: Sent) => Answer = () => new Response(null, { status: 204 })) {
  const sent = box((request) => (request.method === "POST" ? posted(request) : STATUS));
  const shown = await mounted(document.createElement("box-page"));
  await vi.waitFor(() => expect(shown.renderRoot.querySelector("box-release")?.status).toBe(shown.status));
  await vi.waitFor(() => expect(shown.answering).toBe(true));
  await shown.updateComplete;
  const release = part(shown, "main > box-release") as BoxRelease;
  await release.updateComplete;
  sent.length = 0;
  return { shown, release, sent };
}

/** The button of `release` that reads `label`. */
function button(release: BoxRelease, label: string): HTMLElement {
  const found = [...release.renderRoot.querySelectorAll("sl-button")].find(
    (drawn) => (drawn.textContent ?? "").trim() === label,
  );
  if (!found) throw new Error(`no button reads ${label}`);
  return found;
}

/** The switch of `release` that reads `label`. */
function toggle(release: BoxRelease, label: string): SlSwitch {
  const found = [...release.renderRoot.querySelectorAll("sl-switch")].find(
    (drawn) => (drawn.textContent ?? "").trim() === label,
  );
  if (!found) throw new Error(`no switch reads ${label}`);
  return found;
}

/** The requests, as "METHOD url body". */
const said = (sent: Sent[]) => sent.map(({ method, url, body }) => `${method} ${url} ${body}`.trim());

describe("box-page's release presses", () => {
  it("shows the release group after its heading while no run goes", async () => {
    const { release } = await page();
    expect(release.previousElementSibling?.textContent).toBe("Release and setup");
    expect(release.answering).toBe(true);
  });

  for (const [label, route] of [
    ["Check for update", "/box/check"],
    ["Update to 2026.11.1", "/box/update"],
    ["Revert to 2026.10.2", "/box/back"],
  ] as const) {
    it(`posts ${route} on ${label}, then fetches the status`, async () => {
      const { release, sent } = await page();
      button(release, label).click();
      await vi.waitFor(() => expect(sent).toHaveLength(2));
      expect(said(sent)).toEqual([`POST ${route}`, "GET /box/status"]);
    });
  }

  it("posts each switch's new value as it is flipped, form-encoded, then fetches the status", async () => {
    const { release, sent } = await page();
    // The fake box records no headers; this records the posts' types.
    const types: string[] = [];
    const fetching = globalThis.fetch;
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init: RequestInit = {}) => {
      if (init.method === "POST") types.push(new Headers(init.headers).get("content-type") ?? "");
      return fetching(input, init);
    });
    toggle(release, "Pre-releases").click();
    await vi.waitFor(() => expect(sent).toHaveLength(2));
    toggle(release, "Download automatically").click();
    await vi.waitFor(() => expect(sent).toHaveLength(4));
    expect(said(sent)).toEqual([
      "POST /box/prereleases prereleases=yes",
      "GET /box/status",
      "POST /box/download download=no",
      "GET /box/status",
    ]);
    expect(types).toEqual(["application/x-www-form-urlencoded", "application/x-www-form-urlencoded"]);
  });

  it("shows a refusal's sentence first among the errors, and clears it once a press succeeds", async () => {
    let answer = new Response(REFUSED, { status: 409 });
    const { shown, release, sent } = await page(() => answer);
    button(release, "Update to 2026.11.1").click();
    await vi.waitFor(() => expect(sent).toHaveLength(2));
    const messages = part(shown, "main > box-messages") as BoxMessages;
    await vi.waitFor(() => expect(messages.refusal).toBe(REFUSED));
    await messages.updateComplete;
    expect(messages.renderRoot.querySelector(".failures li")?.textContent).toBe(REFUSED);
    answer = new Response(null, { status: 204 });
    button(release, "Check for update").click();
    await vi.waitFor(() => expect(sent).toHaveLength(4));
    await vi.waitFor(() => expect(messages.refusal).toBeNull());
  });

  it("keeps a refusal and fetches the status when the post finds no box", async () => {
    let answer: Answer = new Response(REFUSED, { status: 409 });
    const { shown, release, sent } = await page(() => answer);
    button(release, "Update to 2026.11.1").click();
    await vi.waitFor(() => expect(sent).toHaveLength(2));
    answer = new Error("no box");
    button(release, "Revert to 2026.10.2").click();
    await vi.waitFor(() => expect(sent).toHaveLength(4));
    expect(said(sent).slice(2)).toEqual(["POST /box/back", "GET /box/status"]);
    expect((part(shown, "main > box-messages") as BoxMessages).refusal).toBe(REFUSED);
  });

  it("disables the release group's buttons and switches while box does not answer", async () => {
    box(() => new Error("no box"));
    const shown = await mounted(document.createElement("box-page")) as BoxPage;
    shown.status = STATUS;
    await shown.updateComplete;
    const release = part(shown, "main > box-release") as BoxRelease;
    await release.updateComplete;
    expect(release.answering).toBe(false);
    const controls = [...release.renderRoot.querySelectorAll("sl-button, sl-switch")];
    expect(controls).toHaveLength(5);
    expect(controls.every((control) => (control as HTMLButtonElement).disabled)).toBe(true);
  });
});
