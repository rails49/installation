// The setup form on the page: where it is, Apply posting `/box/setup` and
// fetching after, a refusal's sentence, and a field the person changed
// surviving a fetch that says otherwise.

import type SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import type SlSelect from "@shoelace-style/shoelace/dist/components/select/select.js";
import { describe, expect, it, vi } from "vitest";

import { BoxPage } from "../src/box-page.js";
import type { BoxMessages } from "../src/box-messages.js";
import type { BoxSetup } from "../src/box-setup.js";
import type { Status } from "../src/status.js";
import { box, STATUS, type Answer, type Sent } from "./box.js";
import { all, click, mounted, part } from "./mounted.js";

const STATION = "/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0";
const MEGA = "/dev/serial/by-id/usb-2341_Mega-if00";

/** STATUS with a station chosen and another plugged in. */
const DECLARED: Status = {
  ...STATUS,
  setup: {
    ...STATUS.setup,
    devices: [
      { field: "station", what: "command station", none: "/dev/serial/by-id/none", current: STATION, found: [STATION, MEGA] },
    ],
  },
};

/** The page, mounted, once it has drawn what its first fetch answered. */
async function page(): Promise<BoxPage> {
  const shown = await mounted(document.createElement("box-page"));
  await vi.waitFor(() => expect(shown.renderRoot.querySelector("box-setup")).not.toBeNull());
  return shown;
}

/** The page's setup form, drawn. */
async function form(shown: BoxPage): Promise<BoxSetup> {
  const setup = part(shown, "box-setup") as BoxSetup;
  await setup.updateComplete;
  return setup;
}

/** Each checkbox ticked in the form, by the label it posts. */
async function ticked(shown: BoxPage): Promise<string[]> {
  const setup = await form(shown);
  return [...setup.renderRoot.querySelectorAll<SlCheckbox>("sl-checkbox")].filter((c) => c.checked).map((c) => c.value);
}

/** The station the form has chosen. */
async function station(shown: BoxPage): Promise<string> {
  return ((await form(shown)).renderRoot.querySelector<SlSelect>('sl-select[name="station"]')!.value) as string;
}

/** Press Apply, and wait for the fetch after it. */
async function apply(shown: BoxPage, sent: Sent[]): Promise<void> {
  const before = sent.length;
  click(await form(shown), "sl-button");
  await vi.waitFor(() => expect(sent.length).toBe(before + 2));
  await shown.updateComplete;
}

/** What the Errors group says. */
async function errors(shown: BoxPage): Promise<string[]> {
  const messages = part(shown, "box-messages") as BoxMessages;
  await messages.updateComplete;
  return all(messages, "li");
}

/** A box that answers `status` to a fetch and `posted` to a POST. */
function answering(status: () => Status, posted: () => Answer = () => new Response(null, { status: 204 })): Sent[] {
  return box((sent) => (sent.method === "POST" ? posted() : status()));
}

describe("box-page's setup form", () => {
  it("comes after the release group and before the status, with the status and whether box answers", async () => {
    box(() => STATUS);
    const shown = await page();
    const setup = await form(shown);
    expect(setup.previousElementSibling?.localName).toBe("box-release");
    expect(setup.nextElementSibling?.textContent).toBe("Status");
    expect(setup.status).toBe(shown.status);
    expect(setup.answering).toBe(true);
  });

  it("is hidden while an update, going back or applying runs", async () => {
    box(() => ({
      ...STATUS,
      updating: {
        action: "apply",
        from: "2026.11.0",
        to: "2026.11.0",
        started: "2026-11-12T09:58:00.000Z",
        step: "Starting control.",
        finished: null,
        passed: null,
        failure: null,
        running: true,
      },
    }));
    const shown = await mounted(document.createElement("box-page"));
    await vi.waitFor(() => expect(shown.renderRoot.querySelector("box-progress")).not.toBeNull());
    expect(shown.renderRoot.querySelector("box-setup")).toBeNull();
  });

  it("applies by a POST to /box/setup, form-encoded, and fetches the status at once after", async () => {
    const sent = answering(() => DECLARED);
    const shown = await page();
    await apply(shown, sent);
    expect(sent.slice(1)).toEqual([
      {
        method: "POST",
        url: "/box/setup",
        body: `ui=control&ui=jmri&station=${encodeURIComponent(STATION)}`,
      },
      { method: "GET", url: "/box/status", body: "" },
    ]);
  });

  it("says why box refused, first among the errors, until a press is accepted", async () => {
    let posted: Answer = new Response("The box is already updating, going back or applying the setup.", { status: 409 });
    const sent = answering(
      () => ({ ...DECLARED, failures: ["control is restarting."] }),
      () => posted,
    );
    const shown = await page();
    await apply(shown, sent);
    expect(await errors(shown)).toEqual([
      "The box is already updating, going back or applying the setup.",
      "control is restarting.",
    ]);
    posted = new Response(null, { status: 204 });
    await apply(shown, sent);
    expect(await errors(shown)).toEqual(["control is restarting."]);
  });

  it("keeps a field the person changed through a fetch that says otherwise, and the others follow it", async () => {
    let status: Status = { ...DECLARED, setup: { ...DECLARED.setup, uis: [] } };
    box(() => status);
    const shown = await page();
    const setup = await form(shown);
    const dccex = setup.renderRoot.querySelector<SlCheckbox>('sl-checkbox[value="dccex"]')!;
    dccex.checked = true;
    dccex.dispatchEvent(new CustomEvent("sl-change", { bubbles: true, composed: true }));
    expect(await ticked(shown)).toEqual(["control", "dccex"]);

    status = {
      ...DECLARED,
      setup: {
        ...DECLARED.setup,
        uis: ["occupancy", "jmri"],
        devices: DECLARED.setup.devices.map((device) => ({ ...device, current: MEGA })),
      },
    };
    await shown.refresh();
    expect(await ticked(shown)).toEqual(["control", "occupancy", "jmri", "dccex"]);
    expect(await station(shown)).toBe(MEGA);

    const choice = setup.renderRoot.querySelector<SlSelect>('sl-select[name="station"]')!;
    choice.value = STATION;
    choice.dispatchEvent(new CustomEvent("sl-change", { bubbles: true, composed: true }));
    status = { ...status, setup: { ...status.setup, uis: [] } };
    await shown.refresh();
    expect(await ticked(shown)).toEqual(["control", "dccex"]);
    expect(await station(shown)).toBe(STATION);
  });

  it("lets every field follow the status again after Apply", async () => {
    let status = DECLARED;
    const sent = answering(() => status);
    const shown = await page();
    const setup = await form(shown);
    const jmri = setup.renderRoot.querySelector<SlCheckbox>('sl-checkbox[value="jmri"]')!;
    jmri.checked = false;
    jmri.dispatchEvent(new CustomEvent("sl-change", { bubbles: true, composed: true }));
    status = { ...DECLARED, setup: { ...DECLARED.setup, uis: ["jmri"] } };
    await apply(shown, sent);
    expect(await ticked(shown)).toEqual(["jmri"]);
  });
});
