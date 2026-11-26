// The Box and Docker groups.

import { describe, expect, it } from "vitest";

import "../src/box-facts.js";
import type { BoxFacts } from "../src/box-facts.js";
import type { Status } from "../src/status.js";
import { STATUS } from "./box.js";
import { all, mounted } from "./mounted.js";

/** box-facts, mounted with `status`. */
async function facts(status: Status): Promise<BoxFacts> {
  const shown = document.createElement("box-facts");
  shown.status = status;
  return mounted(shown);
}

/** The items of the group with this legend, as `{term: what it says}`. */
function items(shown: BoxFacts, legend: string): Record<string, string> {
  const group = [...shown.renderRoot.querySelectorAll("fieldset")].find(
    (fieldset) => fieldset.querySelector("legend")?.textContent === legend,
  );
  const terms = [...(group?.querySelectorAll("dt") ?? [])];
  return Object.fromEntries(
    terms.map((term) => [term.textContent, (term.nextElementSibling?.textContent ?? "").replace(/\s+/g, " ").trim()]),
  );
}

describe("box-facts", () => {
  it("draws the Box group, then the Docker group", async () => {
    expect(all(await facts(STATUS), "legend")).toEqual(["Box", "Docker"]);
  });

  it("shows the disk, the memory and the address in the Box group", async () => {
    const memory = { used: 2.5 * 2 ** 30, total: 8 * 2 ** 30 - 300 * 2 ** 20 };
    expect(items(await facts({ ...STATUS, memory }), "Box")).toMatchObject({
      "Disk free": "20.0 GB of 64.0 GB",
      Memory: "2,560 MB used of 7,892 MB",
      "IP address": "192.0.2.20. Reserve this address for the box in your router.",
    });
    expect(items(await facts({ ...STATUS, address: null }), "Box")["IP address"]).toBe("none");
    expect(items(await facts({ ...STATUS, memory: null }), "Box")).not.toHaveProperty("Memory");
  });

  it("shows the certificate and the box name on a box with a box name", async () => {
    expect(items(await facts(STATUS), "Box")).toMatchObject({
      Certificate: "expires 2027-01-30",
      "Box name": "box.example.org resolves to this box",
    });
    const wrong = await facts({
      ...STATUS,
      certificate: { expires: "2027-01-30T00:00:00.000Z", valid: false },
      resolves: { addresses: ["192.0.2.99", "192.0.2.98"], to_this_box: false },
    });
    expect(items(wrong, "Box")).toMatchObject({
      Certificate: "not valid, expires 2027-01-30",
      "Box name": "box.example.org resolves to 192.0.2.99, 192.0.2.98",
    });
    const nowhere = await facts({ ...STATUS, resolves: { addresses: [], to_this_box: false } });
    expect(items(nowhere, "Box")["Box name"]).toBe("box.example.org resolves to nothing");
    expect(items(await facts({ ...STATUS, certificate: null }), "Box")).toMatchObject({
      Certificate: "could not be read",
    });
  });

  it("shows no certificate and no box name on a box without a box name", async () => {
    const plain = items(await facts({ ...STATUS, name: "box", certificate: null, resolves: null }), "Box");
    expect(Object.keys(plain)).toEqual(["Disk free", "Memory", "IP address"]);
  });

  it("shows the Engine against the release's tested ones, and the log driver, in the Docker group", async () => {
    expect(items(await facts(STATUS), "Docker")).toEqual({
      "Docker Engine": "29.1.3, release tested on 29.1.3 and 29.0.4",
      "Log driver": "local",
    });
    const untested = await facts({ ...STATUS, docker: { ...STATUS.docker, tested: [] } });
    expect(items(untested, "Docker")["Docker Engine"]).toBe("29.1.3");
  });
});
