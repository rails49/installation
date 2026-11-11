/**
 * What the release workflow runs, run here the way it runs them: the next
 * release number from the tags already made, and the box files pinned to the
 * manifest's digests (rails49/.github#71 decisions 10 and 11).
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

type Node = any;
const script = (name: string) => fileURLToPath(new URL(`scripts/${name}`, root));

/** `scripts/release-number.sh <month>` with the tags on stdin. */
function nextRelease(month: string, tags: string[]) {
  const run = spawnSync("bash", [script("release-number.sh"), month], {
    input: tags.map((tag) => `${tag}\n`).join(""),
    encoding: "utf8",
  });
  return run.stdout.trim();
}

describe("the release number", () => {
  it("is .0 for the first release in a month", () => {
    expect(nextRelease("2026.11", [])).toBe("2026.11.0");
    expect(nextRelease("2026.12", ["2026.11.0", "2026.11.1"])).toBe("2026.12.0");
  });

  it("counts on from the highest release of the month, as a number", () => {
    expect(nextRelease("2026.11", ["2026.11.0", "2026.11.1"])).toBe("2026.11.2");
    expect(nextRelease("2026.11", ["2026.11.9", "2026.11.10", "2026.11.2"])).toBe(
      "2026.11.11",
    );
  });

  it("ignores tags that are not release numbers of the month", () => {
    expect(nextRelease("2026.1", ["2026.11.4", "2026.1.0-rc", "v2026.1.3", "2026.1.0"])).toBe(
      "2026.1.1",
    );
  });
});

const CONTROL = "c".repeat(40);
const INSTALLATION = "1".repeat(40);
const digest = (char: string) => `sha256:${char.repeat(64)}`;
const MOSQUITTO = `eclipse-mosquitto:2.1.2-alpine@${digest("e")}`;

const manifest = {
  release: "2026.11.0",
  stacks: {
    installation: {
      commit: INSTALLATION,
      images: { "installation-page": digest("1"), "installation-box": digest("2") },
    },
    control: { commit: CONTROL, images: { control: digest("a"), "control-web": digest("b") } },
  },
  stock: { "traefik:v3.7": digest("f"), "eclipse-mosquitto:2.1.2-alpine": digest("e") },
};

/** `scripts/pin.sh <manifest> <dir>` over a scratch copy of `files`, each a
 *  path under the archive and its text. Returns what each file became. */
function pinned(files: Record<string, string>) {
  const scratch = mkdtempSync(join(tmpdir(), "pin-"));
  try {
    writeFileSync(join(scratch, "manifest.json"), JSON.stringify(manifest));
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(scratch, "box", path)), { recursive: true });
      writeFileSync(join(scratch, "box", path), text);
    }
    const run = spawnSync(
      "bash",
      [script("pin.sh"), join(scratch, "manifest.json"), join(scratch, "box")],
      { encoding: "utf8" },
    );
    const after = Object.fromEntries(
      Object.keys(files).map((path) => [path, readFileSync(join(scratch, "box", path), "utf8")]),
    );
    return { status: run.status, err: run.stderr, after };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const imageLines = (text: string) => text.split("\n").filter((line) => /^\s*image:/.test(line));

describe("pinning the box files", () => {
  it("pins each stack's image to its commit and digest, and each stock image to its digest", () => {
    const { status, err, after } = pinned({
      "control/compose.yaml": [
        "services:",
        "  store:",
        "    build: &app",
        "      context: ..",
        "    image: &image ghcr.io/rails49/control:${CONTROL_COMMIT:-dev}",
        "  scheduler:",
        "    build: *app",
        "    image: *image",
        "  web:",
        "    image: ghcr.io/rails49/control-web:${CONTROL_COMMIT:-dev}",
        "  broker:",
        `    image: ${MOSQUITTO}`,
        "",
      ].join("\n"),
      "installation/compose.yaml": [
        "services:",
        "  door:",
        "    image: traefik:v3.7",
        "  page:",
        "    image: ghcr.io/rails49/installation-page:${INSTALLATION_COMMIT:-dev}",
        "",
      ].join("\n"),
    });
    expect(err).toBe("");
    expect(status).toBe(0);
    expect(imageLines(after["control/compose.yaml"]!)).toEqual([
      `    image: &image ghcr.io/rails49/control:${CONTROL}@${digest("a")}`,
      "    image: *image",
      `    image: ghcr.io/rails49/control-web:${CONTROL}@${digest("b")}`,
      `    image: ${MOSQUITTO}`,
    ]);
    expect(imageLines(after["installation/compose.yaml"]!)).toEqual([
      `    image: traefik:v3.7@${digest("f")}`,
      `    image: ghcr.io/rails49/installation-page:${INSTALLATION}@${digest("1")}`,
    ]);
  });

  it("refuses an image the manifest has no digest for, and names it", () => {
    const { status, err } = pinned({
      "dccex/compose.yaml": [
        "services:",
        "  web:",
        "    image: ghcr.io/rails49/dccex-ui:${DCCEX_COMMIT:-dev}",
        "  cache:",
        "    image: redis:7",
        "",
      ].join("\n"),
    });
    expect(status).not.toBe(0);
    expect(err).toContain("dccex/compose.yaml");
    expect(err).toContain("ghcr.io/rails49/dccex-ui:${DCCEX_COMMIT:-dev}");
    expect(err).toContain("redis:7");
  });

  it("pins every image this repository's own box files name", () => {
    const files = Object.fromEntries(
      ["compose.yaml", "jmri/compose.yaml"].map((path) => [
        `installation/${path}`,
        readFileSync(new URL(path, root), "utf8"),
      ]),
    );
    const { status, err, after } = pinned(files);
    expect(err).toBe("");
    expect(status).toBe(0);
    for (const text of Object.values(after)) {
      for (const line of imageLines(text)) expect(line).toMatch(/@sha256:[0-9a-f]{64}$/);
    }
  });
});

describe("the release workflow", () => {
  const workflow = parse(readFileSync(new URL(".github/workflows/release.yml", root), "utf8"));

  it("makes the pre-release only after the check passed on both runners", () => {
    expect(workflow.jobs.check.strategy.matrix.runner).toEqual(["ubuntu-24.04", "ubuntu-24.04-arm"]);
    expect(workflow.jobs.release.needs).toContain("check");
    const tagging = Object.entries<Node>(workflow.jobs).filter(([, job]) =>
      JSON.stringify(job.steps ?? []).includes("gh release create"),
    );
    expect(tagging.map(([name]) => name)).toEqual(["release"]);
  });

  it("numbers the release itself when the release input is left empty", () => {
    // GitHub leaves an empty input out of `inputs`, so INPUTS has no release.
    const plan = workflow.jobs.plan.steps.find((step: Node) => step.id === "plan");
    const scratch = mkdtempSync(join(tmpdir(), "plan-"));
    try {
      const bin = join(scratch, "bin");
      mkdirSync(bin);
      writeFileSync(join(bin, "gh"), `#!/bin/sh\necho ${CONTROL}\n`, { mode: 0o755 });
      writeFileSync(join(bin, "git"), "#!/bin/sh\n", { mode: 0o755 });
      const output = join(scratch, "output");
      writeFileSync(output, "");
      const inputs = { installation: "main", control: "main", dccex: "main", "occupancy-service": "main" };
      const run = spawnSync("bash", ["-e", "-c", plan.run], {
        cwd: fileURLToPath(root),
        env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, INPUTS: JSON.stringify(inputs), GITHUB_OUTPUT: output },
        encoding: "utf8",
      });
      expect(run.stderr).toBe("");
      const now = new Date();
      expect(readFileSync(output, "utf8")).toContain(
        `release=${now.getUTCFullYear()}.${now.getUTCMonth() + 1}.0\n`,
      );
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });

  it("lays out the box files where the repository has no directory of its own", () => {
    const download = workflow.jobs.files.steps.find(
      (step: Node) => step.with?.pattern === "*-box-files",
    );
    expect(existsSync(new URL(download.with.path, root))).toBe(false);
  });
});
