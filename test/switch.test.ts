/**
 * The status page's script that posts a switch's form when the switch is
 * changed (#142), run against a stand-in for the page: its `sl-change`
 * listener, and a form for the switch to be in.
 */

import { beforeAll, describe, expect, it } from "vitest";

let changed = (_event: { target: unknown }) => {};
let submitted = 0;
const form = { submit: () => submitted++ };

beforeAll(async () => {
  Object.assign(globalThis, {
    document: {
      addEventListener: (event: string, listener: typeof changed) => {
        if (event === "sl-change") changed = listener;
      },
    },
  });
  // Through a variable: the script is a page's, with no exports to type.
  const script = "../box/switch.js";
  await import(/* @vite-ignore */ script);
});

/** An element of this tag that sent `sl-change`, in `form` or in none. */
function element(tag: string, within: typeof form | null = form) {
  return {
    target: {
      matches: (selector: string) => selector === tag,
      closest: (selector: string) => (selector === "form" ? within : null),
    },
  };
}

describe("changing a switch on the status page", () => {
  it("posts the form the switch is in", () => {
    changed(element("sl-switch"));
    expect(submitted).toBe(1);
  });

  it("posts nothing for a switch outside a form", () => {
    changed(element("sl-switch", null));
    expect(submitted).toBe(1);
  });

  it("posts nothing for a change of another element in a form", () => {
    changed(element("sl-select"));
    expect(submitted).toBe(1);
  });
});
