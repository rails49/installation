// The Errors and Notes groups: each failure and note in a sentence, and a
// refused press's sentence.

import { describe, expect, it } from "vitest";

import "../src/box-messages.js";
import type { BoxMessages } from "../src/box-messages.js";
import type { Status } from "../src/status.js";
import { STATUS } from "./box.js";
import { all, mounted, reads } from "./mounted.js";

/** box-messages, mounted with `status`. */
async function messages(status: Status, refusal: string | null = null): Promise<BoxMessages> {
  const shown = document.createElement("box-messages");
  shown.status = status;
  shown.refusal = refusal;
  return mounted(shown);
}

describe("box-messages", () => {
  it("says when there are no errors, beside a green dot, and draws no group", async () => {
    const shown = await messages(STATUS);
    expect(reads(shown, "p")).toBe("No errors.");
    expect(shown.renderRoot.querySelector("p .dot.ok")).not.toBeNull();
    expect(all(shown, "legend")).toEqual([]);
  });

  it("states each error in a sentence in a red group, and says nothing of no errors", async () => {
    const shown = await messages({ ...STATUS, failures: ["control is restarting.", "jmri is stopped."] });
    expect(shown.renderRoot.querySelector("fieldset.group.failures legend")?.textContent).toBe("Errors");
    expect(all(shown, ".failures li")).toEqual(["control is restarting.", "jmri is stopped."]);
    expect(reads(shown, "p")).toBeNull();
  });

  it("states each note in a group after the errors, a commit in backticks set as code", async () => {
    const shown = await messages({
      ...STATUS,
      failures: ["control is restarting."],
      notes: ["control runs a local build of `1c3f69b`, not release 2026.11.0."],
    });
    expect(all(shown, "legend")).toEqual(["Errors", "Notes"]);
    expect(all(shown, "fieldset:not(.failures) li")).toEqual([
      "control runs a local build of 1c3f69b, not release 2026.11.0.",
    ]);
    expect(reads(shown, "fieldset:not(.failures) li code")).toBe("1c3f69b");
  });

  it("draws the Notes group under No errors, and none where there are no notes", async () => {
    const shown = await messages({ ...STATUS, notes: ["jmri runs a local build of `0a1b2c3`."] });
    expect(reads(shown, "p")).toBe("No errors.");
    expect(all(shown, "legend")).toEqual(["Notes"]);
    expect(all(await messages(STATUS), "legend")).not.toContain("Notes");
  });

  it("draws what it is handed as text", async () => {
    const shown = await messages({ ...STATUS, failures: ["A <script> & more."] });
    expect(reads(shown, "li")).toBe("A <script> & more.");
    expect(shown.renderRoot.querySelector("script")).toBeNull();
  });

  it("states a refused press's sentence first in the Errors group", async () => {
    const refused = "An update is running already.";
    expect(all(await messages(STATUS, refused), ".failures li")).toEqual([refused]);
    expect(reads(await messages(STATUS, refused), "p")).toBeNull();
    const both = await messages({ ...STATUS, failures: ["control is restarting."] }, refused);
    expect(all(both, ".failures li")).toEqual([refused, "control is restarting."]);
  });
});
