// The Stacks group: each stack by its name, in the page's order, with its
// dot, state, memory, disk and commit.

import { describe, expect, it } from "vitest";

import "../src/box-stacks.js";
import type { BoxStacks } from "../src/box-stacks.js";
import type { Status } from "../src/status.js";
import { STATUS } from "./box.js";
import { all, mounted, reads } from "./mounted.js";

/** box-stacks, mounted with `status`. */
async function stacks(status: Status): Promise<BoxStacks> {
  const shown = document.createElement("box-stacks");
  shown.status = status;
  return mounted(shown);
}

/** The table's rows, as `[dot, stack, state, memory, disk, commit]`. */
function table(shown: BoxStacks): string[][] {
  return [...shown.renderRoot.querySelectorAll("tbody tr")].map((row) => [
    row.querySelector(".dot")?.classList[1] ?? "",
    ...[...row.querySelectorAll("td")].map((cell) => (cell.textContent ?? "").trim()),
  ]);
}

describe("box-stacks", () => {
  it("lists each stack by its name, in the page's order, with a dot, its state, memory, disk and commit", async () => {
    const shown = await stacks({
      ...STATUS,
      stacks: [
        STATUS.stacks[0]!,
        { ...STATUS.stacks[1]!, state: "restarting", local_build: true },
        STATUS.stacks[2]!,
        { stack: "dccex", state: "stopped", commit: null, local_build: false, memory: null, disk: null },
        {
          stack: "occupancy-service",
          state: "running",
          commit: null,
          local_build: false,
          memory: 2500 * 2 ** 20,
          disk: 30e6,
        },
      ],
    });
    expect(reads(shown, "legend")).toBe("Stacks");
    expect(all(shown, "th")).toEqual(["Stack", "State", "Memory", "Disk", "Commit"]);
    expect(table(shown)).toEqual([
      ["ok", "Installation", "running", "60 MB", "348 MB", "8f7e6d5"],
      ["bad", "Control", "restarting", "1,200 MB", "1,144 MB", "1c3f69b"],
      ["ok", "Occupancy", "running", "2,500 MB", "29 MB", "n/a"],
      ["ok", "JMRI", "running", "480 MB", "620 MB", "n/a"],
      ["off", "DCC-EX translator", "stopped", "", "", "n/a"],
    ]);
  });

  it("sets memory and disk as numbers, at the right", async () => {
    const shown = await stacks(STATUS);
    expect(shown.renderRoot.querySelectorAll("th.number")).toHaveLength(2);
    expect(shown.renderRoot.querySelectorAll("tbody tr:first-child td.number")).toHaveLength(2);
  });

  it("keeps each stack's row with its stack as the stacks change", async () => {
    const shown = await stacks(STATUS);
    const jmri = shown.renderRoot.querySelector("tbody tr:last-child");
    shown.status = { ...STATUS, stacks: STATUS.stacks.filter(({ stack }) => stack !== "control") };
    await shown.updateComplete;
    expect(shown.renderRoot.querySelector("tbody tr:last-child")).toBe(jmri);
    expect(table(shown).map(([, stack]) => stack)).toEqual(["Installation", "JMRI"]);
  });
});
