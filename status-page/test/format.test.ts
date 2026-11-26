// How the page says sizes, memory, times and sentences.

import { html, render } from "lit";
import { describe, expect, it } from "vitest";

import { gb, mb, NAMES, ORDER, sentence, size, when } from "../src/format.js";

/** What `sentence(text)` draws, as HTML without Lit's markers. */
function drawn(text: string): string {
  const into = document.createElement("div");
  render(html`${sentence(text)}`, into);
  return into.innerHTML.replace(/<!--[^>]*-->/g, "");
}

describe("sentence", () => {
  it("sets a commit in backticks as code", () => {
    expect(drawn("control runs a local build of `1c3f69b`, not release 2026.11.0.")).toBe(
      "control runs a local build of <code>1c3f69b</code>, not release 2026.11.0.",
    );
  });

  it("draws what it is handed as text", () => {
    expect(drawn("A <script> & `<b>`.")).toBe("A &lt;script&gt; &amp; <code>&lt;b&gt;</code>.");
  });

  it("leaves a lone backtick as it is", () => {
    expect(drawn("one ` alone")).toBe("one ` alone");
  });
});

describe("sizes", () => {
  it("says memory, and a stack's disk, in whole megabytes of 2^20 bytes", () => {
    expect(mb(60 * 2 ** 20)).toBe("60 MB");
    expect(mb(365e6)).toBe("348 MB");
    expect(mb(1.2e9)).toBe("1,144 MB");
  });

  it("says the box's disk in gigabytes of 10^9 bytes, to a tenth", () => {
    expect(gb(20e9)).toBe("20.0 GB");
    expect(gb(1.26e9)).toBe("1.3 GB");
  });

  it("says a download's bytes in gigabytes from one, and in megabytes under it", () => {
    expect(size(1.6e9)).toBe("1.6 GB");
    expect(size(1e9)).toBe("1.0 GB");
    expect(size(250.4e6)).toBe("250 MB");
  });
});

describe("when", () => {
  it("says a time to the minute, in UTC", () => {
    expect(when("2026-11-12T08:00:59.000Z")).toBe("2026-11-12 08:00 UTC");
  });
});

describe("the stacks", () => {
  it("are named and ordered as the page lists them", () => {
    expect(ORDER.map((stack) => NAMES.get(stack))).toEqual([
      "Installation",
      "Control",
      "Occupancy",
      "JMRI",
      "DCC-EX translator",
    ]);
    expect(ORDER).toEqual(["installation", "control", "occupancy-service", "jmri", "dccex"]);
  });
});
