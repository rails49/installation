// @vitest-environment node

// The built page: the installation commit the build was named, and its
// styles in a stylesheet linked from its head.

import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";
import { afterAll, beforeAll, expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));
const COMMIT = "0123456789abcdef0123456789abcdef01234567";

let out = "";
let html = "";
beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "status-page-"));
  process.env["INSTALLATION_COMMIT"] = COMMIT;
  await build({ root, logLevel: "silent", build: { outDir: out } });
  html = readFileSync(join(out, "index.html"), "utf8");
}, 60_000);
afterAll(() => {
  rmSync(out, { recursive: true, force: true });
  delete process.env["INSTALLATION_COMMIT"];
});

it("bakes INSTALLATION_COMMIT into the page", () => {
  const script = html.match(/src="\/box\/(assets\/[^"]+\.js)"/)?.[1];
  expect(script).toBeDefined();
  expect(readFileSync(join(out, script!), "utf8")).toContain(COMMIT);
  expect(readdirSync(join(out, "shoelace/assets"))).toContain("icons");
});

it("links look's styles and its own in its head, and has none inline", () => {
  // So a phone draws the page styled the first time (#95).
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const sheet = head.match(/<link rel="stylesheet"[^>]* href="\/box\/(assets\/[^"]+\.css)">/)?.[1];
  expect(sheet).toBeDefined();
  const css = readFileSync(join(out, sheet!), "utf8");
  expect(css).toContain(".sl-theme-light");
  expect(css).toContain("line-height:1.6");
  expect(html).not.toContain("<style");
  expect(html).not.toContain("style=");
});
