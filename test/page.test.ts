/**
 * The page an operator lands on, asserted against what the render script
 * actually produced.
 *
 * One seam, taken high: the script is run with a known box name and set of
 * labels, and everything below is a claim about the HTML that came out. What
 * can break here is the expansion of labels into links; nginx serving a static
 * file out of a directory is not something this repository can get wrong, so
 * no container is started.
 *
 * The look rules' values are checked on the same page rather than in a test of
 * their own. They bind what an operator receives, not what a template says, and
 * a page that draws the band with a colour of its own is the fault they exist
 * to catch (ADR-0003, ADR-0005). The check reads `look/tokens.css` and nothing
 * else — never the network — so it goes red on an edit here rather than on
 * somebody else's commit in `.github` (ADR-0010).
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

const DOMAIN = "gleis49.org";
const UIS = ["control", "occupancy", "jmri"];
/** Declared out of alphabetical order on purpose: the operator wrote this
 *  order and a sort would silently override it. */
const DECLARED = "control occupancy jmri";

/** The page, as the container renders it: the script's stdout, from the box's
 *  declaration in the environment. */
function render(uis: string): string {
  return execFileSync(fileURLToPath(new URL("page/render.sh", root)), {
    env: { ...process.env, BOX_DOMAIN: DOMAIN, BOX_UIS: uis },
    encoding: "utf8",
  });
}

const page = render(DECLARED);

/** Every `<a href>` in the page, in the order it draws them, as
 *  `[address, text]`. */
const links = [...page.matchAll(/<a href="([^"]+)">([^<]*)<\/a>/g)].map(
  ([, href, text]) => [href!, text!] as const,
);

describe("the links the page lists", () => {
  it("are one per declared label and nothing else", () => {
    expect(links.map(([, text]) => text)).toEqual(UIS);
  });

  it("address each label under the box's name", () => {
    expect(links.map(([href]) => href)).toEqual(
      UIS.map((ui) => `https://${ui}.${DOMAIN}`),
    );
  });

  it("keep the order the operator declared", () => {
    // The assertions above are already in declared order; this says why that
    // order rather than any other, against a set that is not sorted.
    expect(UIS).not.toEqual([...UIS].sort());
  });

  it("never list the apex, which is where this page is", () => {
    expect(links.map(([href]) => href)).not.toContain(`https://${DOMAIN}`);
    expect(links.map(([href]) => href)).not.toContain(`https://${DOMAIN}/`);
  });

  it("are absent on a box that serves nothing yet", () => {
    const empty = render("");
    expect(empty).not.toContain("<a href=");
    expect(empty).toContain(DOMAIN);
  });
});

describe("the band", () => {
  /** The band's whole content, which is the box's name: the page holds no
   *  other fact, and a table of UI titles here would be one. */
  it("carries the box's name and nothing else", () => {
    const band = page.match(/<div class="band-name">([^<]*)<\/div>/);
    expect(band?.[1]).toBe(DOMAIN);
  });

  it("is what the page draws at the top", () => {
    expect(page).toContain('class="band"');
  });
});

/**
 * The values the look rules bind, against the copy they came from.
 *
 * The page takes the tokens and the band and no rail: it offers nothing to
 * press, so the four rail values have nothing here to equal and are
 * deliberately absent (`look/README.md`).
 */
describe("the values the look rules bind", () => {
  /** A stylesheet's `--name: value` declarations, comments removed first: the
   *  prose in both files names tokens, and a regex reading declarations cannot
   *  tell those from the real ones. */
  function tokens(css: string): Record<string, string> {
    return Object.fromEntries(
      [
        ...css
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .matchAll(/(--[a-z-]+)\s*:\s*([^;]+);/g),
      ].map(([, name, value]) => [name!, value!.trim()]),
    );
  }

  const copy = tokens(
    readFileSync(new URL("look/tokens.css", root), "utf8"),
  );
  const drawn = tokens(page);

  it("are the six the copy holds", () => {
    // One added over there fails here rather than passing unnoticed: a value
    // this page has not followed yet is the whole point of keeping the copy.
    expect(Object.keys(copy).sort()).toEqual([
      "--band",
      "--band-ink",
      "--rail",
      "--rail-button",
      "--rail-group",
      "--rail-turns",
    ]);
  });

  it("paint the band with the copy's values", () => {
    for (const token of ["--band", "--band-ink"]) {
      expect(drawn[token], token).toBe(copy[token]);
    }
  });

  it("leave the rail's four out, there being no rail", () => {
    for (const token of ["--rail", "--rail-button", "--rail-group", "--rail-turns"]) {
      expect(drawn[token], token).toBeUndefined();
    }
  });

  it("are written once each, not a second time as a literal", () => {
    // The declaration is the only place the band's colour belongs. A literal
    // beside it is what the rules exist to stop: a value that drifts on its
    // own with nothing to report it.
    const written = page.replace(/\/\*[\s\S]*?\*\//g, "").split(copy["--band"]!);
    expect(written.length - 1).toBe(1);
  });

  it("keep their one value while the rest of the page follows the theme", () => {
    // The chrome keeps one value in both themes and the work follows the
    // theme, which is the division LOOK.md draws. The band is outside the
    // dark block; the page's own colours are inside it.
    const dark = page.slice(page.indexOf("prefers-color-scheme: dark"));
    expect(page).toContain("prefers-color-scheme: dark");
    expect(dark).not.toContain("--band:");
    expect(dark).not.toContain("--band-ink:");
  });
});
