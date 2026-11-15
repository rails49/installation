/**
 * The status page's script that follows a run in place (#117): every 2
 * seconds it fetches `GET /box/` and swaps only the parts of `main` that
 * changed; while `box` does not answer it keeps what it showed and says so;
 * once the run has ended it reloads once. It never replaces a form, and the
 * end of a download swaps in the page instead of reloading (#130). Run
 * against a stand-in for the
 * page: a tree of elements with the DOM calls the script makes, and `fetch`,
 * `DOMParser` and `location` stubbed.
 */

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/** A node of the stand-in tree. Text has `value`, an element `name`. */
class Node {
  parent: Node | null = null;
  children: Node[] = [];
  constructor(
    readonly name: string,
    readonly attributes: Record<string, string> = {} as Record<string, string>,
    children: (Node | string)[] = [],
  ) {
    this.children = children.map((child) => (typeof child === "string" ? text(child) : child));
    for (const child of this.children) child.parent = this;
  }
  value = "";
  /** What someone typed into a field: no attribute, so not in `html()`. */
  typed = "";
  get nodeName() {
    return this.name.toUpperCase();
  }
  get nodeType() {
    return this.name === "#text" ? 3 : 1;
  }
  get childNodes() {
    return this.children;
  }
  get textContent(): string {
    return this.name === "#text" ? this.value : this.children.map((child) => child.textContent).join("");
  }
  set textContent(value: string) {
    this.replaceChildren(text(value));
  }
  get lastChild(): Node | null {
    return this.children.at(-1) ?? null;
  }
  getAttribute(key: string) {
    return this.attributes[key] ?? null;
  }
  contains(other: Node | null): boolean {
    return other === this || this.children.some((child) => child.contains(other));
  }
  insertBefore(child: Node, before: Node | null) {
    child.remove();
    const at = before ? this.children.indexOf(before) : this.children.length;
    this.children.splice(at, 0, child);
    child.parent = this;
    return child;
  }
  set className(value: string) {
    this.attributes.class = value;
  }
  createElement(name: string) {
    return new Node(name);
  }
  isEqualNode(other: Node): boolean {
    return (
      this.cloneNode(false).html() === other.cloneNode(false).html() &&
      this.children.length === other.children.length &&
      this.children.every((child, i) => child.isEqualNode(other.children[i]!))
    );
  }
  cloneNode(deep: boolean): Node {
    const copy = new Node(this.name, { ...this.attributes }, deep ? this.children.map((child) => child.cloneNode(true)) : []);
    copy.value = this.value;
    return copy;
  }
  html(): string {
    if (this.name === "#text") return this.value;
    const attributes = Object.entries(this.attributes).map(([key, value]) => ` ${key}="${value}"`).join("");
    return `<${this.name}${attributes}>${this.children.map((child) => child.html()).join("")}</${this.name}>`;
  }
  replaceWith(other: Node) {
    const siblings = this.parent!.children;
    siblings[siblings.indexOf(this)] = other;
    other.parent = this.parent;
    this.parent = null;
  }
  replaceChildren(...children: Node[]) {
    this.children = children;
    for (const child of children) child.parent = this;
  }
  prepend(child: Node) {
    this.children.unshift(child);
    child.parent = this;
  }
  remove() {
    this.parent?.children.splice(this.parent.children.indexOf(this), 1);
    this.parent = null;
  }
  querySelectorAll(tag: string): Node[] {
    return this.children.flatMap((child) => [...(child.name === tag ? [child] : []), ...child.querySelectorAll(tag)]);
  }
  /** `tag`, `tag.class` or `tag[attribute="value"]`, the selectors the script asks. */
  querySelector(selector: string): Node | null {
    const [, tag, klass, key, value] = /^(\w+)(?:\.([\w-]+))?(?:\[(\w+)="([^"]*)"\])?$/.exec(selector)!;
    for (const child of this.children) {
      if (
        child.name === tag &&
        (!klass || child.attributes.class === klass) &&
        (!key || child.attributes[key] === value)
      )
        return child;
      const found = child.querySelector(selector);
      if (found) return found;
    }
    return null;
  }
}

function text(value: string) {
  const node = new Node("#text");
  node.value = value;
  return node;
}

/** The parts of a page while a run goes, at a step, with the follower. */
function running(at: "pull" | "start", pulled = 0) {
  const steps = new Node("ol", { class: "steps" }, [
    new Node("li", { class: "done" }, ["Download release"]),
    at === "pull"
      ? new Node("li", { class: "current" }, ["Pull images ", new Node("progress", { value: `${pulled}`, max: "7" }), " traefik"])
      : new Node("li", { class: "done" }, ["Pull images"]),
    new Node("li", at === "start" ? { class: "current" } : {}, ["Start stacks"]),
  ]);
  return page(
    [
      new Node("p", {}, ["No errors."]),
      new Node("fieldset", { class: "group" }, [new Node("legend", {}, ["Release"]), new Node("p", {}, ["Updating to 2026.11.1"]), steps]),
      new Node("fieldset", { class: "group" }, [new Node("legend", {}, ["Stacks"]), new Node("p", {}, ["control running"])]),
    ],
    true,
  );
}

function page(main: Node[], follows: boolean | "run" | "download") {
  const what = follows === true ? "run" : follows;
  return new Node("html", {}, [
    new Node("head", {}, what ? [new Node("script", { type: "module", src: "/box/follow.js", "data-follows": what })] : []),
    new Node("body", {}, [new Node("look-band"), new Node("main", {}, main)]),
  ]);
}

/** The setup form, with a device for each path found. */
function setup(found: string[]) {
  return new Node("form", { method: "post", action: "/box/setup", class: "setup" }, [
    new Node("fieldset", { class: "group" }, [
      new Node("legend", {}, ["Stacks to run"]),
      new Node("label", {}, [new Node("input", { type: "checkbox", name: "ui", value: "control" }), " Control"]),
    ]),
    new Node("label", { class: "row" }, [
      "Command station ",
      new Node("select", { name: "station" }, found.map((path) => new Node("option", { value: path }, [path]))),
    ]),
    new Node("input", { type: "text", name: "note" }),
    new Node("button", {}, ["Apply"]),
  ]);
}

/** The parts of a page while a release downloads, or once it has, with the setup form. */
function downloading(said: string, { failures = [] as string[], found = ["usb-1a86"], follows = true } = {}) {
  const release = new Node("div", { class: "row" }, [
    new Node("p", {}, [said]),
    ...(follows ? [new Node("progress", { value: "300", max: "1600" })] : [new Node("form", { method: "post", action: "/box/update" }, [new Node("button", {}, ["Update"])])]),
  ]);
  return page(
    [
      ...(failures.length ? failures.map((failure) => new Node("p", { class: "failure" }, [failure])) : [new Node("p", {}, ["No errors."])]),
      new Node("fieldset", { class: "group" }, [new Node("legend", {}, ["Release"]), release]),
      setup(found),
      new Node("fieldset", { class: "group" }, [new Node("legend", {}, ["Stacks"]), new Node("p", {}, ["control running"])]),
    ],
    follows && "download",
  );
}

/** What `GET /box/` answers next: a page, or no answer. */
let answer: Node | "down" | 502 = running("pull");
const parsed = new Map<string, Node>();
let fetched = 0;
let reloaded = 0;
const shown = running("pull");
/** The script, loaded once more as a new page would load it. */
const load = (again = "") => import(/* @vite-ignore */ `../box/follow.js${again}`);
const main = () => shown.querySelector("main")!;

beforeAll(async () => {
  vi.useFakeTimers();
  Object.assign(globalThis, {
    document: shown,
    location: { reload: () => reloaded++ },
    fetch: async (url: string) => {
      expect(url).toBe("/box/");
      fetched++;
      if (answer === "down") throw new TypeError("Failed to fetch");
      if (answer === 502) return { ok: false, text: async () => "Bad Gateway" };
      const html = answer.html();
      parsed.set(html, answer.cloneNode(true));
      return { ok: true, text: async () => html };
    },
    DOMParser: class {
      parseFromString(html: string, type: string) {
        expect(type).toBe("text/html");
        return parsed.get(html)!;
      }
    },
  });
  // Through a variable: the script is a page's, with no exports to type.
  await load();
});

afterAll(() => {
  vi.useRealTimers();
});

/** The line the page adds while `box` does not answer, if it shows one. */
const line = () => main().querySelector("p.restarting")?.textContent ?? null;

describe("following a run on the status page", () => {
  it("fetches the page every 2 seconds and keeps every part that did not change", async () => {
    const before = [...main().children];
    const steps = main().querySelector("ol")!;
    const current = steps.children[1]!;
    answer = running("pull", 1);
    await vi.advanceTimersByTimeAsync(1999);
    expect(fetched).toBe(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetched).toBe(1);
    expect(main().children).toEqual(before);
    // The current step stays, so its spinner keeps turning; only the bar is new.
    expect(steps.children[1]).toBe(current);
    expect(current.querySelector("progress")!.attributes.value).toBe("1");
    expect(main().html()).toBe(running("pull", 1).querySelector("main")!.html());
  });

  it("swaps the steps that changed", async () => {
    const steps = main().querySelector("ol")!;
    const first = steps.children[0];
    answer = running("start");
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetched).toBe(2);
    expect(main().querySelector("ol")).toBe(steps);
    expect(steps.children[0]).toBe(first);
    expect(steps.children[2]!.attributes.class).toBe("current");
    expect(main().html()).toBe(running("start").querySelector("main")!.html());
  });

  it("keeps what it showed while box does not answer, says so, and keeps trying", async () => {
    const before = main().html();
    answer = "down";
    await vi.advanceTimersByTimeAsync(2000);
    expect(line()).toBe("The box is restarting.");
    expect(main().children[0]!.attributes.class).toBe("restarting");
    expect(main().html().replace(/<p class="restarting">.*?<\/p>/, "")).toBe(before);
    // The door answers for box while box is recreated.
    answer = 502;
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetched).toBe(4);
    expect(main().html().match(/class="restarting"/g)).toHaveLength(1);
  });

  it("says after 3 minutes with no answer that the box has not answered, and keeps trying", async () => {
    // The first failed fetch was 2 seconds ago.
    await vi.advanceTimersByTimeAsync(3 * 60_000 - 4000);
    expect(line()).toBe("The box is restarting.");
    answer = "down";
    await vi.advanceTimersByTimeAsync(2000);
    expect(line()).toBe("The box has not answered for 3 minutes.");
    const tries = fetched;
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetched).toBe(tries + 1);
  });

  it("takes the line away once box answers again", async () => {
    answer = running("start");
    await vi.advanceTimersByTimeAsync(2000);
    expect(line()).toBeNull();
    expect(main().html()).toBe(running("start").querySelector("main")!.html());
  });

  it("reloads in full once when the run has ended, and stops fetching", async () => {
    answer = page([new Node("p", {}, ["This box runs release 2026.11.1."])], false);
    await vi.advanceTimersByTimeAsync(2000);
    expect(reloaded).toBe(1);
    const tries = fetched;
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetched).toBe(tries);
    expect(reloaded).toBe(1);
  });
});

describe("following a download with the setup form on the page (#130)", () => {
  /** The setup form on the page, and what someone has typed into it. */
  const form = () => main().querySelector("form.setup")!;
  const typed = () => [form().querySelectorAll("input").map((input) => input.typed), form().querySelector("select")!.typed];

  it("keeps the form as typed when a level's number of children changes", async () => {
    shown.replaceChildren(...downloading("Downloaded 300 MB of 1.6 GB.").children);
    answer = downloading("Downloaded 300 MB of 1.6 GB.");
    await load("?download");
    const before = form();
    before.querySelectorAll("input").forEach((input, i) => (input.typed = ["on", "Layout B"][i]!));
    before.querySelector("select")!.typed = "usb-1a86";
    // A failure appears, and a second device is found.
    answer = downloading("Downloaded 500 MB of 1.6 GB.", { failures: ["control is restarting.", "jmri is restarting."], found: ["usb-1a86", "usb-2341"] });
    const tries = fetched;
    await vi.advanceTimersByTimeAsync(2000);
    expect(fetched).toBe(tries + 1);
    expect(form()).toBe(before);
    expect(typed()).toEqual([["on", "Layout B"], "usb-1a86"]);
    expect(main().querySelectorAll("p").filter((p) => p.attributes.class === "failure")).toHaveLength(2);
    expect(main().querySelector("div.row")!.querySelector("p")!.textContent).toBe("Downloaded 500 MB of 1.6 GB.");
  });

  it("keeps the form as typed when the level's number stays and the form differs", async () => {
    const before = form();
    answer = downloading("Downloaded 700 MB of 1.6 GB.", { failures: ["control is restarting."], found: [] });
    // The number of children goes back too.
    await vi.advanceTimersByTimeAsync(2000);
    answer = downloading("Downloaded 900 MB of 1.6 GB.", { failures: ["jmri is restarting."], found: ["usb-2341"] });
    await vi.advanceTimersByTimeAsync(2000);
    expect(form()).toBe(before);
    expect(typed()).toEqual([["on", "Layout B"], "usb-1a86"]);
    expect(main().querySelector("p")!.textContent).toBe("jmri is restarting.");
  });

  it("swaps in the page when the download ends, keeping the form as typed, and stops fetching", async () => {
    const before = form();
    answer = downloading("New release 2026.11.1 is available.", { follows: false });
    await vi.advanceTimersByTimeAsync(2000);
    expect(reloaded).toBe(1);
    expect(form()).toBe(before);
    expect(typed()).toEqual([["on", "Layout B"], "usb-1a86"]);
    expect(main().querySelector("div.row")!.html()).toBe(
      downloading("New release 2026.11.1 is available.", { follows: false }).querySelector("div.row")!.html(),
    );
    const tries = fetched;
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetched).toBe(tries);
    expect(reloaded).toBe(1);
  });
});
