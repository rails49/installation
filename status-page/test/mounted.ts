// Mounting one component of the page and reading what it drew. It is also
// the suite's setup file (`vitest.config.ts`), which empties the document and
// puts back `fetch` between tests.

import { registerIconLibrary } from "@shoelace-style/shoelace/dist/utilities/icon-library.js";
import type { LitElement } from "lit";
import { afterEach, vi } from "vitest";

// The tests draw no glyphs, so Shoelace fetches nothing.
registerIconLibrary("default", { resolver: () => "" });

/** `element`, in the document and drawn once. */
export async function mounted<T extends LitElement>(element: T): Promise<T> {
  document.body.append(element);
  await element.updateComplete;
  return element;
}

/** What the one part of `element` matching `selector` reads, whitespace
 *  collapsed, or null where it drew none. */
export function reads(element: LitElement, selector: string): string | null {
  const drew = element.renderRoot.querySelector(selector);
  return drew === null ? null : (drew.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** What every part of `element` matching `selector` reads, in order. */
export function all(element: LitElement, selector: string): string[] {
  return [...element.renderRoot.querySelectorAll(selector)].map((drew) =>
    (drew.textContent ?? "").replace(/\s+/g, " ").trim(),
  );
}

/** The one part of `element` matching `selector`, asserted to be there. */
export function part(element: LitElement, selector: string): Element {
  const drew = element.renderRoot.querySelector(selector);
  if (drew === null) throw new Error(`nothing matching ${selector} was drawn`);
  return drew;
}

/** Click what `element` drew at `selector`, as a Shoelace button or a plain
 *  element is pressed. Look's own presses take `press` from
 *  `@rails49/look/testing`. */
export function click(element: LitElement, selector: string): void {
  (part(element, selector) as HTMLElement).click();
}

afterEach(() => {
  // The build's test runs in node, with no document.
  if (typeof document !== "undefined") document.body.replaceChildren();
  vi.unstubAllGlobals();
});
