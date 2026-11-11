/**
 * The page an operator lands on, asserted against what the render script
 * actually produced.
 *
 * One seam, taken high: the script is run with a known box name and set of
 * labels, and everything below is a claim about the HTML that came out. What
 * can break here is the expansion of labels into links; nginx serving a static
 * file out of a directory is not something this repository can get wrong, so
 * no container is started.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

const DOMAIN = "gleis49.org";
const UIS = ["control", "occupancy", "jmri"];
/** Declared out of alphabetical order on purpose: the operator wrote this
 *  order and a sort would silently override it. */
const DECLARED = "control occupancy jmri";

/** The box's hostname on a box with no certificate, as the page container
 *  reads it from the box's `/etc/hostname`. */
const HOSTNAME = "shed";

const scratch = mkdtempSync(join(tmpdir(), "page-"));
const hostnameFile = join(scratch, "hostname");
writeFileSync(hostnameFile, `${HOSTNAME}\n`);
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** The page, as the container renders it: the script's stdout, from the box's
 *  declaration in the environment. */
function render(uis: string, domain: string = DOMAIN): string {
  return execFileSync(fileURLToPath(new URL("page/render.sh", root)), {
    env: { ...process.env, BOX_DOMAIN: domain, BOX_UIS: uis, HOSTNAME_FILE: hostnameFile },
    encoding: "utf8",
  });
}

/** The page's list, one entry per item, as `[address, text]`; the address is
 *  undefined for an item with no link. */
function items(html: string) {
  return [...html.matchAll(/<li>(?:<a href="([^"]+)"[^>]*>)?([^<]*)(?:<\/a>)?<\/li>/g)].map(
    ([, href, text]) => [href, text!] as const,
  );
}

/** The page's own script run against its links, as a browser that reached it
 *  at `host` would. Returns each link's address afterwards. */
function browse(html: string, host: string): string[] {
  const anchors = [...html.matchAll(/<li><a href="([^"]+)"([^>]*)>/g)].map(([, href, attrs]) => ({
    url: new URL(href!),
    attrs: attrs!,
  }));
  const document = {
    querySelectorAll(selector: string) {
      const attr = selector.match(/^a\[([\w-]+)\]$/)![1]!;
      return anchors.filter((a) => a.attrs.includes(attr)).map((a) => a.url);
    },
  };
  const script = html.match(/<script>([\s\S]*?)<\/script>/)![1]!;
  new Function("document", "location", script)(document, { hostname: host });
  return anchors.map((a) => a.url.href);
}

const page = render(DECLARED);

/** Every link in the page's list, in the order it draws them, as
 *  `[address, text]`. */
const links = [...page.matchAll(/<li><a href="([^"]+)">([^<]*)<\/a><\/li>/g)].map(
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
    // A label can never be the apex — the script appends `.$BOX_DOMAIN` to
    // each one — so what this guards is the other way in: the landing page
    // makes its band's name a link home, and a page that copied that would
    // list the apex among what the box serves.
    const addresses = links.map(([href]) => href);
    expect(addresses).not.toContain(`https://${DOMAIN}`);
    expect(addresses).not.toContain("/");
  });

  it("are absent on a box that serves nothing yet", () => {
    const empty = render("");
    expect(empty).not.toContain("<li>");
    expect(empty).toContain(DOMAIN);
  });
});

describe("the footer", () => {
  it("links to the project", () => {
    expect(page).toContain(
      '<footer><a href="https://rails49.org/">rails49.org</a></footer>',
    );
  });
});

describe("the band", () => {
  /** The band's whole content, which is the box's name: the page holds no
   *  other fact, and a table of UI titles here would be one. */
  it("carries the box's name and nothing else", () => {
    const band = page.match(/<look-band>([\s\S]*?)<\/look-band>/);
    expect(band?.[1]).toBe(`<look-about name="${DOMAIN}"></look-about>`);
  });

  it("is look's, loaded from the copy this repository commits", () => {
    expect(page).toContain(
      '<script type="module" src="/look/look.bundle.js"></script>',
    );
    expect(existsSync(new URL("look/look.bundle.js", root))).toBe(true);
  });
});

describe("the page on a box with no certificate", () => {
  /** README's UI port table, by label. */
  const PORTS = { control: 8081, dccex: 8082, jmri: 8083, occupancy: 8084 };
  const plain = render("control occupancy jmri dccex", "");

  it("links each label at the box's hostname under .local, on its UI port", () => {
    expect(items(plain)).toEqual(
      (["control", "occupancy", "jmri", "dccex"] as const).map((ui) => [
        `http://${HOSTNAME}.local:${PORTS[ui]}`,
        ui,
      ]),
    );
  });

  it("points each link at the host the page was reached at", () => {
    expect(browse(plain, "192.168.1.20")).toEqual([
      "http://192.168.1.20:8081/",
      "http://192.168.1.20:8084/",
      "http://192.168.1.20:8083/",
      "http://192.168.1.20:8082/",
    ]);
    expect(browse(plain, "shed.local")[0]).toBe("http://shed.local:8081/");
  });

  it("lists a label with no UI port as text with no link", () => {
    expect(items(render("control turntable", ""))).toEqual([
      [`http://${HOSTNAME}.local:8081`, "control"],
      [undefined, "turntable"],
    ]);
  });

  it("carries the box's hostname in its title and band", () => {
    expect(plain).toContain(`<title>${HOSTNAME}</title>`);
    expect(plain.match(/<look-band>([\s\S]*?)<\/look-band>/)?.[1]).toBe(
      `<look-about name="${HOSTNAME}"></look-about>`,
    );
  });

  it("leaves the links alone on a box with a box name", () => {
    expect(browse(page, DOMAIN)).toEqual(UIS.map((ui) => `https://${ui}.${DOMAIN}/`));
  });
});
