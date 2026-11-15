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

/**
 * `scripts/layers.sh <manifest>` with a `docker` on the PATH that answers
 * `buildx imagetools inspect --raw <ref>` from `registry`, each ref and the
 * JSON the registry holds for it.
 */
function layered(registry: Record<string, object>) {
  const scratch = mkdtempSync(join(tmpdir(), "layers-"));
  try {
    const name = (ref: string) => ref.replace(/[/:@]/g, "_");
    mkdirSync(join(scratch, "bin"));
    writeFileSync(
      join(scratch, "bin", "docker"),
      `#!/usr/bin/env bash\nf="${scratch}/$(printf %s "\${@: -1}" | tr '/:@' '___').json"\n[ -f "$f" ] || { echo "no such image: \${@: -1}" >&2; exit 1; }\ncat "$f"\n`,
      { mode: 0o755 },
    );
    for (const [ref, json] of Object.entries(registry)) writeFileSync(join(scratch, `${name(ref)}.json`), JSON.stringify(json));
    writeFileSync(join(scratch, "manifest.json"), JSON.stringify(manifest));
    const run = spawnSync("bash", [script("layers.sh"), join(scratch, "manifest.json")], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${join(scratch, "bin")}:${process.env.PATH}` },
    });
    return { status: run.status, err: run.stderr, layers: run.status === 0 ? JSON.parse(run.stdout) : null };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

describe("the layers the manifest records", () => {
  /** An index of an amd64 and an arm64 variant, and an attestation. */
  const index = (amd64: string, arm64: string) => ({
    manifests: [
      { digest: amd64, platform: { os: "linux", architecture: "amd64" } },
      { digest: arm64, platform: { os: "linux", architecture: "arm64", variant: "v8" } },
      { digest: digest("0"), platform: { os: "unknown", architecture: "unknown" } },
    ],
  });
  /** A variant's manifest, with its layers as `[digest, size]`. */
  const variant = (...layers: [string, number][]) => ({
    config: { digest: digest("9"), size: 1 },
    layers: layers.map(([d, size]) => ({ mediaType: "application/vnd.oci.image.layer.v1.tar+gzip", digest: d, size })),
  });
  /** Every image of `manifest`, each an index whose variants share layer `3`. */
  const registry = () => {
    const images = [
      ...Object.values(manifest.stacks).flatMap(({ images }) =>
        Object.entries(images).map(([image, d]) => [`ghcr.io/rails49/${image}`, d] as const),
      ),
      ...Object.entries(manifest.stock),
    ];
    return Object.fromEntries(
      images.flatMap(([ref, d], i) => {
        const amd64 = `sha256:${String(i).padStart(64, "a")}`;
        const arm64 = `sha256:${String(i).padStart(64, "b")}`;
        return [
          [`${ref}@${d}`, index(amd64, arm64)],
          [`${ref}@${amd64}`, variant([digest("3"), 100], [digest("4"), 200 + i])],
          [`${ref}@${arm64}`, variant([digest("3"), 90], [digest("5"), 300 + i])],
        ];
      }),
    );
  };

  it("lists each pinned image's linux/amd64 and linux/arm64 layers by digest and size, keyed by the image's digest", () => {
    const { status, err, layers } = layered(registry());
    expect(err).toBe("");
    expect(status).toBe(0);
    const digests = [...Object.values(manifest.stacks).flatMap(({ images }) => Object.values(images)), ...Object.values(manifest.stock)];
    expect(Object.keys(layers).sort()).toEqual(digests.sort());
    expect(layers[digest("a")]).toEqual({
      "linux/amd64": [
        { digest: digest("3"), size: 100 },
        { digest: digest("4"), size: 202 },
      ],
      "linux/arm64": [
        { digest: digest("3"), size: 90 },
        { digest: digest("5"), size: 302 },
      ],
    });
  });

  it("fails where the registry does not answer for an image", () => {
    const { [`traefik:v3.7@${digest("f")}`]: _, ...rest } = registry();
    const { status, err } = layered(rest);
    expect(status).not.toBe(0);
    expect(err).toContain(`no such image: traefik:v3.7@${digest("f")}`);
  });
});

/** `scripts/old-releases.sh` over `gh release list --json tagName,isPrerelease,isDraft`,
 *  each release a `[tag, kind]`. Returns the tags it prints, one per line. */
function oldReleases(releases: [string, "full" | "pre" | "draft"][]) {
  const list = releases.map(([tagName, kind]) => ({
    tagName,
    isPrerelease: kind === "pre",
    isDraft: kind === "draft",
  }));
  const run = spawnSync("bash", [script("old-releases.sh")], {
    input: JSON.stringify(list),
    encoding: "utf8",
  });
  expect(run.stderr).toBe("");
  expect(run.status).toBe(0);
  return run.stdout.split("\n").filter(Boolean);
}

describe("the releases GitHub keeps", () => {
  it("are the latest 5 full releases, by number", () => {
    const full = ["2026.9.0", "2026.10.0", "2026.10.1", "2026.11.0", "2026.11.2", "2026.11.10", "2026.12.0"];
    // Listed newest first by date, as gh does, and not in number order.
    const releases = full.map((tag) => [tag, "full"] as [string, "full"]).reverse();
    expect(oldReleases(releases).sort()).toEqual(["2026.10.0", "2026.9.0"]);
  });

  it("and every pre-release newer than the latest full one", () => {
    const releases: [string, "full" | "pre"][] = [
      ["2026.11.4", "pre"],
      ["2026.11.3", "pre"],
      ["2026.11.2", "full"],
      ["2026.11.1", "pre"],
      ["2026.11.0", "full"],
      ["2026.10.9", "pre"],
    ];
    expect(oldReleases(releases).sort()).toEqual(["2026.10.9", "2026.11.1"]);
  });

  it("keep every pre-release while there is no full release", () => {
    expect(oldReleases([["2026.11.1", "pre"], ["2026.11.0", "pre"]])).toEqual([]);
  });

  it("leave drafts and tags that are not release numbers alone", () => {
    const releases: [string, "full" | "pre" | "draft"][] = [
      ["2026.12.1", "draft"],
      ["v1.0", "full"],
      ...["2026.11.0", "2026.11.1", "2026.11.2", "2026.11.3", "2026.11.4", "2026.11.5"].map(
        (tag) => [tag, "full"] as [string, "full"],
      ),
      ["2026.10.0", "draft"],
    ];
    expect(oldReleases(releases)).toEqual(["2026.11.0"]);
  });

  it("are all there are when there are no more", () => {
    expect(oldReleases([])).toEqual([]);
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

  it("records each pinned image's layers in the manifest", () => {
    const step = workflow.jobs.files.steps.find((step: Node) => step.name === "The manifest and the archive");
    expect(step.run).toMatch(/scripts\/layers\.sh manifest\.json[\s\S]*\.layers = [\s\S]*scripts\/pin\.sh manifest\.json/);
  });

  it("runs no curl with both -f and --fail-with-body", () => {
    // The runners' curl 8.5 refuses the pair; run 43238469782's check failed on it.
    const runs = Object.values<Node>(workflow.jobs).flatMap((job) =>
      (job.steps ?? []).map((step: Node) => step.run ?? ""),
    );
    const both = runs
      .flatMap((run: string) => run.split("\n"))
      .filter((line) => /\bcurl\b/.test(line) && /--fail-with-body/.test(line))
      .filter((line) => /\s-[a-zA-Z]*f[a-zA-Z]*\s/.test(line));
    expect(both).toEqual([]);
  });

  it("makes the tag and the pre-release with the app's token, not the job's", () => {
    // The job's token got HTTP 403 creating the tag (#76).
    const steps = workflow.jobs.release.steps;
    const app = steps.find((step: Node) => step.id === "app");
    expect(app.uses).toMatch(/^actions\/create-github-app-token@/);
    const publish = steps.find((step: Node) => step.run?.includes("gh release create"));
    expect(publish.env.GH_TOKEN).toBe("${{ steps.app.outputs.token }}");
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

  it("records the Docker Engine a fresh install gets, from the install script's source and packages", () => {
    // The runners' own Docker Engine lags Docker's apt repository by a major
    // version, so every box showed a Docker Engine failure (#82).
    const steps: Node[] = workflow.jobs.check.steps;
    const runs = steps.map((step) => step.run ?? "");
    const packagesOf = (text: string) =>
      text.match(/apt-get install -y -q (docker-ce .*)/)?.[1].trim().split(/\s+/);
    const install = readFileSync(new URL("install.sh", root), "utf8");
    const upgrade = runs.findIndex((run) => packagesOf(run) !== undefined);
    expect(upgrade).toBeGreaterThanOrEqual(0);
    expect(packagesOf(runs[upgrade])).toEqual(packagesOf(install));
    expect(runs[upgrade]).toContain("https://download.docker.com/linux/");
    const recorded = runs.findIndex((run) => run.includes("{{.Server.Version}}"));
    expect(recorded).toBeGreaterThan(upgrade);
  });

  it("finds no router in the door's log that needs a box name, on a box with no certificate", () => {
    // Each was dropped with an error at every start before #92, and a real
    // error was hard to find among them.
    const steps: Node[] = workflow.jobs.check.steps;
    const runs = steps.map((step) => step.run ?? "");
    const door = runs.findIndex((run) => run.includes("docker logs installation-door-1"));
    expect(door).toBeGreaterThan(runs.findIndex((run) => run.includes("/box/setup")));
    for (const error of [
      "EntryPoint doesn't exist",
      "No valid entryPoint",
      "nonexistent certificate resolver",
      "empty args for matcher Host",
    ]) {
      expect(runs[door]).toContain(error);
    }
  });

  it("lays out the box files where the repository has no directory of its own", () => {
    const download = workflow.jobs.files.steps.find(
      (step: Node) => step.with?.pattern === "*-box-files",
    );
    expect(existsSync(new URL(download.with.path, root))).toBe(false);
  });
});
