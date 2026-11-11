/**
 * `.github/workflows/images.yml` as data: what a release calls to build and
 * publish this repository's images (rails49/.github#71). It runs only for a
 * release, so what can be held here is that it agrees with the compose files.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

type Node = any;

const read = (path: string): Node => parse(readFileSync(new URL(path, root), "utf8"));

const workflow: Node = read(".github/workflows/images.yml");
const installation: Node = read("compose.yaml");

/** The services compose builds and names on GHCR. */
const built = Object.entries<Node>(installation.services)
  .filter(([, service]) => service.build)
  .map(([name]) => name);

describe("the images workflow", () => {
  it("is called with a commit, and runs on nothing else", () => {
    expect(Object.keys(workflow.on)).toEqual(["workflow_call"]);
    expect(workflow.on.workflow_call.inputs.commit).toMatchObject({
      required: true,
      type: "string",
    });
  });

  it("builds every image compose builds, under compose's name for it", () => {
    expect(built).toEqual(["page", "box"]);
    expect(workflow.env.IMAGES.split(" ")).toEqual(built);
    expect(workflow.jobs.build.env.IMAGE).toBe(
      "ghcr.io/rails49/installation-${{ matrix.image }}",
    );
    const build = workflow.jobs.build.steps.find(
      (step: Node) => step.uses?.startsWith("docker/build-push-action@"),
    );
    expect(build.with.file).toBe("${{ matrix.image }}/Dockerfile");
    expect(build.with["build-args"]).toBe("INSTALLATION_COMMIT=${{ inputs.commit }}");
  });

  it("builds on an amd64 runner and an arm64 runner", () => {
    expect(workflow.jobs.build.strategy.matrix.runner).toEqual([
      "ubuntu-24.04",
      "ubuntu-24.04-arm",
    ]);
  });

  it("returns the digest of each image", () => {
    expect(Object.keys(workflow.on.workflow_call.outputs)).toEqual(
      built.map((name) => `installation-${name}`),
    );
  });

  it("hands on the box files: every compose file and what it builds on the box", () => {
    const upload = workflow.jobs["box-files"].steps.find(
      (step: Node) => step.uses?.startsWith("actions/upload-artifact@"),
    );
    expect(upload.with.name).toBe("installation-box-files");
    const paths: string[] = upload.with.path.trim().split("\n");
    const covered = (file: string) =>
      paths.some((path) => (path.endsWith("/") ? file.startsWith(path) : file === path));

    const composeFiles = execFileSync("git", ["ls-files", "*compose*.yaml", "*compose*.yml"], {
      cwd: new URL(".", root),
      encoding: "utf8",
    })
      .trim()
      .split("\n");
    expect(composeFiles.length).toBeGreaterThan(1);
    for (const file of composeFiles) {
      expect(covered(file), file).toBe(true);
      // What the box builds itself, and every file it mounts from the clone.
      const dir = file.includes("/") ? file.slice(0, file.lastIndexOf("/") + 1) : "";
      for (const [name, service] of Object.entries<Node>(read(file).services)) {
        if (service.build && !service.image) {
          expect(covered(`${dir}${service.build.context}/Dockerfile`.replace("/./", "/")), name).toBe(true);
        }
        for (const volume of service.volumes ?? []) {
          if (typeof volume === "string" && volume.startsWith("./")) {
            expect(covered(dir + volume.slice(2).split(":")[0]), volume).toBe(true);
          }
        }
      }
    }
  });
});
