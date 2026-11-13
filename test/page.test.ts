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
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

const DOMAIN = "example.org";
/** The order the page lists the UIs it knows. */
const UIS = ["control", "occupancy", "jmri", "dccex"];
/** Declared in another order on purpose: the page's order wins. */
const DECLARED = "dccex jmri control occupancy";

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

/** One part of the page's one list: 0 is the UIs, 1 the two items that
 *  always follow them, starting with the status page. */
function list(html: string, at: 0 | 1): string {
  const ul = html.match(/<ul>([\s\S]*?)<\/ul>/)![1]!;
  const split = ul.indexOf('<li><a class="item" href="/box/">');
  return at === 0 ? ul.slice(0, split) : ul.slice(split);
}

/** The items in one part of the page's list. The address is undefined for an
 *  item with no link, and the text for an item with no line of text. */
function entries(html: string, at: 0 | 1 = 0) {
  return [
    ...list(html, at).matchAll(
      /<li>(?:<a class="item" href="([^"]+)"[^>]*>|<span class="item">)(<svg[\s\S]*?<\/svg>)<span class="name">([^<]*)<\/span>(?:<span class="text">([^<]*)<\/span>)?<\/(?:a|span)><\/li>/g,
    ),
  ].map(([, href, svg, name, text]) => ({ href, svg: svg!, name: name!, text }));
}

/** The UI list as `[address, name]`. */
function items(html: string) {
  return entries(html).map(({ href, name }) => [href, name] as const);
}

/** An icon as the page inlines it. */
function icon(name: string): string {
  return readFileSync(new URL(`page/icons/${name}.svg`, root), "utf8").trim();
}

/** The page's own script run against its links, as a browser that reached it
 *  at `url` would. Returns each link's address afterwards. */
function browse(html: string, url: string): string[] {
  const anchors = [...list(html, 0).matchAll(/<li><a class="item" href="([^"]+)"([^>]*)>/g)].map(([, href, attrs]) => {
    const port = attrs!.match(/ data-ui-port="(\d+)"/)?.[1];
    return { href: href!, dataset: port === undefined ? {} : { uiPort: port } };
  });
  const document = {
    querySelectorAll(selector: string) {
      expect(selector).toBe("a[data-ui-port]");
      return anchors.filter((a) => "uiPort" in a.dataset);
    },
  };
  const script = html.match(/<script>([\s\S]*?)<\/script>/)![1]!;
  new Function("document", "location", script)(document, new URL(url));
  return anchors.map((a) => a.href);
}

const page = render(DECLARED);

/** Every link in the page's UI list, in the order it draws them, as
 *  `[address, name]`. */
const links = items(page).map(([href, name]) => [href!, name] as const);

describe("the links the page lists", () => {
  it("are one per declared label and nothing else", () => {
    expect(links.map(([, text]) => text)).toEqual(UIS);
  });

  it("address each label under the box's name", () => {
    expect(links.map(([href]) => href)).toEqual(
      UIS.map((ui) => `https://${ui}.${DOMAIN}`),
    );
  });

  it("keep the page's order, not the order the operator declared", () => {
    // The assertions above are already in the page's order; this says the
    // declaration was in another.
    expect(DECLARED.split(" ")).not.toEqual(UIS);
  });

  it("list a label the page does not know after the known ones, in declared order", () => {
    expect(items(render("turntable jmri crane control")).map(([, name]) => name)).toEqual([
      "control",
      "jmri",
      "turntable",
      "crane",
    ]);
  });

  it("give each known UI its own icon and a line of text", () => {
    expect(entries(page).map(({ name, text }) => [name, text])).toEqual([
      ["control", "Schedule, dispatch and drive trains."],
      ["occupancy", "See which track is occupied, from a camera."],
      ["jmri", "JMRI, with DecoderPro for programming locos."],
      ["dccex", "The DCC-EX command station: firmware, serial monitor and script."],
    ]);
    const svgs = entries(page).map(({ svg }) => svg);
    expect(new Set([...svgs, icon("app-window")]).size).toBe(svgs.length + 1);
  });

  it("give a label the page does not know the default icon and no text", () => {
    const [turntable] = entries(render("turntable"));
    expect(turntable).toEqual({
      href: `https://turntable.${DOMAIN}`,
      svg: icon("app-window"),
      name: "turntable",
      text: undefined,
    });
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

  it("go to each label's UI port at the page's host when the page is opened over HTTP", () => {
    // Port 80 redirects only the box name and its labels, so the page is
    // served over HTTP at an address or a `.local` name.
    expect(browse(page, "http://192.168.1.20/")).toEqual([
      "http://192.168.1.20:8081",
      "http://192.168.1.20:8084",
      "http://192.168.1.20:8083",
      "http://192.168.1.20:8082",
    ]);
    expect(browse(page, "http://shed.local/")[0]).toBe("http://shed.local:8081");
  });

  it("stay under the box name when the page is opened over HTTPS", () => {
    expect(browse(page, `https://${DOMAIN}/`)).toEqual(UIS.map((ui) => `https://${ui}.${DOMAIN}`));
  });

  it("stay under the box name over HTTP for a label with no UI port", () => {
    expect(browse(render("control turntable"), "http://192.168.1.20/")).toEqual([
      "http://192.168.1.20:8081",
      `https://turntable.${DOMAIN}`,
    ]);
  });

  it("are absent on a box that serves nothing yet", () => {
    const empty = render("");
    expect(list(empty, 0)).not.toContain("<li>");
    expect(empty).toContain(DOMAIN);
  });
});

describe("the items after the UIs", () => {
  it("link to the box's status page, always, and to the project", () => {
    // The one place an update is announced is the status page, so the link is
    // there whatever the box's state (#65 decision 17). Relative, so it stays
    // on the host and port the page was reached at.
    for (const html of [page, render("", ""), render("control", "")]) {
      expect(entries(html, 1)).toEqual([
        {
          href: "/box/",
          svg: icon("activity"),
          name: "Box status",
          text: "What the server runs, and whether it is well.",
        },
        {
          href: "https://rails49.org/",
          svg: icon("globe"),
          name: "rails49.org",
          text: "The project's site and documentation.",
        },
      ]);
    }
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

  /** look's stylesheet linked in the head ahead of the bundle, so a phone
   *  draws the page styled the first time rather than once the module has
   *  run (#95). */
  it("links look's stylesheet in its head, ahead of the bundle", () => {
    const head = page.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
    const link = head.indexOf('<link rel="stylesheet" href="/look/look.css">');
    expect(link).toBeGreaterThanOrEqual(0);
    expect(link).toBeLessThan(head.indexOf('<script type="module" src="/look/look.bundle.js">'));
    expect(existsSync(new URL("look/look.css", root))).toBe(true);
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
    expect(browse(plain, "http://192.168.1.20/")).toEqual([
      "http://192.168.1.20:8081",
      "http://192.168.1.20:8084",
      "http://192.168.1.20:8083",
      "http://192.168.1.20:8082",
    ]);
    expect(browse(plain, "http://shed.local/")[0]).toBe("http://shed.local:8081");
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
});
