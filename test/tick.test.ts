/**
 * The status page's script that ticks control when dccex, jmri or occupancy
 * is ticked (#69 decision 10), run against a stand-in for the page's form:
 * four checkboxes and the form's `change` listener.
 */

import { beforeAll, describe, expect, it } from "vitest";

const boxes = ["control", "dccex", "jmri", "occupancy"].map((value) => ({ value, checked: false }));
let changed = () => {};

const form = {
  addEventListener: (event: string, listener: () => void) => {
    if (event === "change") changed = listener;
  },
  querySelectorAll: (selector: string) => {
    expect(selector).toBe('input[name="ui"]:checked');
    return boxes.filter((input) => input.checked);
  },
  querySelector: (selector: string) => {
    expect(selector).toBe('input[name="ui"][value="control"]');
    return boxes[0];
  },
};

/** Ticks or unticks one box as a person would, and lets the script see it. */
function tick(value: string, checked = true) {
  boxes.find((input) => input.value === value)!.checked = checked;
  changed();
}

beforeAll(async () => {
  Object.assign(globalThis, { document: { querySelector: (selector: string) => (selector === "form.setup" ? form : null) } });
  // Through a variable: the script is a page's, with no exports to type.
  const script = "../box/tick.js";
  await import(/* @vite-ignore */ script);
});

describe("ticking a stack on the status page", () => {
  it("ticks control with dccex", () => {
    tick("dccex");
    expect(boxes.map((input) => input.checked)).toEqual([true, true, false, false]);
  });

  it("ticks control again when it is unticked while another is ticked", () => {
    tick("control", false);
    expect(boxes[0]!.checked).toBe(true);
  });

  it("lets control be unticked once nothing else is", () => {
    tick("dccex", false);
    tick("control", false);
    expect(boxes.map((input) => input.checked)).toEqual([false, false, false, false]);
  });

  it("ticks control with jmri and with occupancy", () => {
    tick("jmri");
    expect(boxes[0]!.checked).toBe(true);
    tick("jmri", false);
    tick("control", false);
    tick("occupancy");
    expect(boxes[0]!.checked).toBe(true);
  });
});
