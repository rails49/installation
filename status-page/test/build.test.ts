// @vitest-environment node

// The built page carries the installation commit the build was named.

import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";
import { afterEach, expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));
const COMMIT = "0123456789abcdef0123456789abcdef01234567";

let out = "";
afterEach(() => {
  rmSync(out, { recursive: true, force: true });
  delete process.env["INSTALLATION_COMMIT"];
});

it("bakes INSTALLATION_COMMIT into the page", { timeout: 60_000 }, async () => {
  out = mkdtempSync(join(tmpdir(), "status-page-"));
  process.env["INSTALLATION_COMMIT"] = COMMIT;
  await build({ root, logLevel: "silent", build: { outDir: out } });
  const html = readFileSync(join(out, "index.html"), "utf8");
  const script = html.match(/src="\/box\/(assets\/[^"]+\.js)"/)?.[1];
  expect(script).toBeDefined();
  expect(readFileSync(join(out, script!), "utf8")).toContain(COMMIT);
  expect(readdirSync(join(out, "shoelace/assets"))).toContain("icons");
});
