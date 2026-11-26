// The setup form: the stacks to run, ticked as the box declares, the devices
// each stack uses, and Apply.

import type SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import type SlSelect from "@shoelace-style/shoelace/dist/components/select/select.js";
import { describe, expect, it } from "vitest";

import { BoxSetup } from "../src/box-setup.js";
import type { Press } from "../src/press.js";
import type { Device, Status } from "../src/status.js";
import { STATUS } from "./box.js";
import { all, click, mounted, reads } from "./mounted.js";

/** A station plugged in and chosen, another plugged in; a camera chosen by
 *  hand that is not plugged in. */
const DEVICES: Device[] = [
  {
    field: "station",
    what: "command station",
    none: "/dev/serial/by-id/none",
    current: "/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0",
    found: ["/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0", "/dev/serial/by-id/usb-2341_Mega-if00"],
  },
  {
    field: "camera",
    what: "camera",
    none: "/dev/v4l/by-id/none",
    current: "/dev/v4l/by-id/usb-away-video-index0",
    found: [],
  },
];

/** STATUS with the devices above. */
const WITH_DEVICES: Status = { ...STATUS, setup: { ...STATUS.setup, devices: DEVICES } };

/** STATUS on a box with no device chosen or plugged in. */
const NO_DEVICES: Status = {
  ...STATUS,
  setup: { ...STATUS.setup, devices: DEVICES.map((device) => ({ ...device, current: null, found: [] })) },
};

/** `box-setup`, mounted with `status`. */
async function setup(status: Status = STATUS, answering = true): Promise<BoxSetup> {
  const shown = document.createElement("box-setup");
  shown.status = status;
  shown.answering = answering;
  return mounted(shown);
}

/** The choice for the device in `field`. */
function select(shown: BoxSetup, field: string): SlSelect {
  return shown.renderRoot.querySelector<SlSelect>(`sl-select[name="${field}"]`)!;
}

/** Each option of the choice for `field`, as "<value> <what it says>". */
function options(shown: BoxSetup, field: string): string[] {
  return [...select(shown, field).querySelectorAll("sl-option")].map(
    (option) => `${option.getAttribute("value")} ${option.textContent?.trim()}`,
  );
}

/** Tick, or untick, the checkbox that posts `label`, as a person does. */
async function tick(shown: BoxSetup, label: string, on = true): Promise<void> {
  const box = shown.renderRoot.querySelector<SlCheckbox>(`sl-checkbox[value="${label}"]`)!;
  box.checked = on;
  box.dispatchEvent(new CustomEvent("sl-change", { bubbles: true, composed: true }));
  await shown.updateComplete;
}

/** Choose `path` for the device in `field`, as a person does. */
async function choose(shown: BoxSetup, field: string, path: string): Promise<void> {
  const choice = select(shown, field);
  choice.value = path;
  choice.dispatchEvent(new CustomEvent("sl-change", { bubbles: true, composed: true }));
  await shown.updateComplete;
}

/** Press Apply, and return each press `shown` asked for, as
 *  "<route> <body>". */
function apply(shown: BoxSetup): string[] {
  const asked: string[] = [];
  const heard = (event: Event) => {
    const { route, body } = (event as CustomEvent<Press>).detail;
    asked.push(`${route} ${body}`);
  };
  document.addEventListener("box-press", heard);
  click(shown, "sl-button");
  document.removeEventListener("box-press", heard);
  return asked;
}

/** Each checkbox, as "<label it posts> <what it says>", and "ticked" where it
 *  is. */
function boxes(shown: BoxSetup): string[] {
  return [...shown.renderRoot.querySelectorAll<SlCheckbox>("sl-checkbox")].map(
    (box) => `${box.value} ${box.textContent?.trim()}${box.checked ? " ticked" : ""}`,
  );
}

describe("box-setup", () => {
  it("offers Control, Occupancy, JMRI and the DCC-EX translator in that order, the declared ones ticked", async () => {
    expect(boxes(await setup())).toEqual([
      "control Control ticked",
      "occupancy Occupancy",
      "jmri JMRI ticked",
      "dccex DCC-EX translator",
    ]);
    expect(boxes(await setup({ ...STATUS, setup: { ...STATUS.setup, uis: [] } }))).toEqual([
      "control Control",
      "occupancy Occupancy",
      "jmri JMRI",
      "dccex DCC-EX translator",
    ]);
  });

  it("says Occupancy and the DCC-EX translator use Control's broker", async () => {
    expect(reads(await setup(), "fieldset p")).toBe("Occupancy and DCC-EX translator use the broker installed with Control.");
  });

  it("offers each station plugged in, or none, with the one dccex.env names chosen", async () => {
    const shown = await setup(WITH_DEVICES);
    expect(options(shown, "station")).toEqual([
      "/dev/serial/by-id/none none",
      "/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0 usb-1a86_USB_Serial-if00-port0",
      "/dev/serial/by-id/usb-2341_Mega-if00 usb-2341_Mega-if00",
    ]);
    expect(select(shown, "station").value).toBe("/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0");
  });

  it("keeps a device named by hand that is not plugged in, and says when none is", async () => {
    const shown = await setup(WITH_DEVICES);
    expect(options(shown, "camera")).toEqual([
      "/dev/v4l/by-id/none none",
      "/dev/v4l/by-id/usb-away-video-index0 usb-away-video-index0, not plugged in",
    ]);
    expect(select(shown, "camera").value).toBe("/dev/v4l/by-id/usb-away-video-index0");
    expect(all(shown, ".devices > p")).toEqual(["No camera is plugged in."]);

    const bare = await setup(NO_DEVICES);
    expect(select(bare, "station").value).toBe("/dev/serial/by-id/none");
    expect(options(bare, "station")).toEqual(["/dev/serial/by-id/none none"]);
    expect(all(bare, ".devices > p")).toEqual(["No command station is plugged in.", "No camera is plugged in."]);
  });

  it("puts each device's choice on its row, after what it is", async () => {
    expect(all(await setup(WITH_DEVICES), ".devices > .row > span")).toEqual(["Command station", "Camera"]);
  });

  it("ends in Apply, and says nothing of the railroad, which the release group says", async () => {
    const shown = await setup(WITH_DEVICES);
    expect(all(shown, "sl-button")).toEqual(["Apply"]);
    expect(shown.renderRoot.textContent).not.toContain("railroad");
  });

  it("disables every checkbox, choice and Apply while box does not answer", async () => {
    const controls = (shown: BoxSetup) =>
      [...shown.renderRoot.querySelectorAll<SlCheckbox>("sl-checkbox, sl-select, sl-button")].map((c) => c.disabled);
    expect(controls(await setup(WITH_DEVICES, false))).toEqual(Array(7).fill(true));
    expect(controls(await setup(WITH_DEVICES, true))).toEqual(Array(7).fill(false));
  });

  it("ticks Control when Occupancy or the DCC-EX translator is ticked", async () => {
    const none = { ...STATUS, setup: { ...STATUS.setup, uis: [] } };
    for (const label of ["occupancy", "dccex"]) {
      const shown = await setup(none);
      await tick(shown, label);
      expect(boxes(shown).filter((box) => box.endsWith("ticked"))).toEqual(
        ["control Control ticked", label === "dccex" ? "dccex DCC-EX translator ticked" : "occupancy Occupancy ticked"],
      );
    }
  });

  it("ticks nothing else when JMRI is ticked, and lets Control be unticked", async () => {
    const shown = await setup({ ...STATUS, setup: { ...STATUS.setup, uis: [] } });
    await tick(shown, "jmri");
    expect(boxes(shown).filter((box) => box.endsWith("ticked"))).toEqual(["jmri JMRI ticked"]);
    const declared = await setup();
    await tick(declared, "control", false);
    expect(boxes(declared).filter((box) => box.endsWith("ticked"))).toEqual(["jmri JMRI ticked"]);
  });

  it("applies by a press of /box/setup with the stacks ticked and the devices chosen", async () => {
    const shown = await setup(WITH_DEVICES);
    expect(apply(shown)).toEqual([
      "/box/setup ui=control&ui=jmri" +
        "&station=%2Fdev%2Fserial%2Fby-id%2Fusb-1a86_USB_Serial-if00-port0" +
        "&camera=%2Fdev%2Fv4l%2Fby-id%2Fusb-away-video-index0",
    ]);
    await tick(shown, "dccex");
    await tick(shown, "jmri", false);
    await choose(shown, "station", "/dev/serial/by-id/usb-2341_Mega-if00");
    await choose(shown, "camera", "/dev/v4l/by-id/none");
    expect(apply(shown)).toEqual([
      "/box/setup ui=control&ui=dccex" +
        "&station=%2Fdev%2Fserial%2Fby-id%2Fusb-2341_Mega-if00" +
        "&camera=%2Fdev%2Fv4l%2Fby-id%2Fnone",
    ]);
  });
});
