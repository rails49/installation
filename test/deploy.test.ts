/**
 * What `./deploy.sh` does on the box after the pull.
 *
 * The part that runs there is the heredoc it feeds to `bash -s`. It is run
 * here the same way, in a clone that pulls from a scratch upstream, with
 * `docker` on PATH replaced by a script that writes down what it was asked.
 */

import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

const deploy = readFileSync(new URL("deploy.sh", root), "utf8");

/** The heredoc: what `./deploy.sh` runs on the box. */
const remote = deploy.match(/<<'REMOTE'\n([\s\S]*?)\nREMOTE\n/)![1]!;

/** git with an identity of its own, for a CI runner that has none. */
const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, {
    cwd,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "test",
      GIT_AUTHOR_EMAIL: "test@example.org",
      GIT_COMMITTER_NAME: "test",
      GIT_COMMITTER_EMAIL: "test@example.org",
    },
    stdio: "pipe",
  });

/** Runs the deploy in a scratch home whose clone's upstream has gained a
 *  commit that touches `changed`, and returns what docker was asked, one call
 *  per line. */
function deployChanging(...changed: string[]): string[] {
  const scratch = mkdtempSync(join(tmpdir(), "deploy-"));
  const upstream = join(scratch, "upstream");
  const home = join(scratch, "home");
  const bin = join(scratch, "bin");
  const log = join(scratch, "docker.log");

  for (const file of ["box/server.mjs", "page/render.sh", "look/look.bundle.js", "README.md"]) {
    mkdirSync(join(upstream, file, ".."), { recursive: true });
    writeFileSync(join(upstream, file), "before\n");
  }
  git(upstream, "init", "-q", "-b", "main");
  git(upstream, "add", ".");
  git(upstream, "commit", "-q", "-m", "before");
  mkdirSync(home);
  git(home, "clone", "-q", upstream, "installation");

  for (const file of changed) writeFileSync(join(upstream, file), "after\n");
  git(upstream, "commit", "-q", "-am", "after");

  mkdirSync(bin);
  writeFileSync(join(bin, "docker"), `#!/bin/sh\necho "$*" >> '${log}'\n`);
  chmodSync(join(bin, "docker"), 0o755);

  try {
    execFileSync("bash", ["-s"], {
      input: remote,
      env: { ...process.env, HOME: home, PATH: `${bin}:${process.env.PATH}` },
      stdio: ["pipe", "pipe", "pipe"],
    });
    return readFileSync(log, "utf8").trimEnd().split("\n");
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** The restarts docker was asked for, by service. */
function restarted(calls: string[]): string[] {
  return calls
    .filter((call) => call.includes(" restart"))
    .flatMap((call) => call.split(" restart ")[1]!.split(" "));
}

/** Each `./<dir>` bind mount of each service in the installation's compose
 *  file, as `<dir>:<service>`. */
function composeMounts(): string[] {
  const installation = parse(readFileSync(new URL("compose.yaml", root), "utf8"));
  return Object.entries<{ volumes?: unknown[] }>(installation.services).flatMap(
    ([service, { volumes = [] }]) =>
      volumes
        .filter((volume): volume is string => typeof volume === "string")
        .filter((volume) => volume.startsWith("./"))
        .map((volume) => `${volume.slice(2).split(":")[0]}:${service}`),
  );
}

describe("the directories the deploy compares", () => {
  it("are the compose file's ./<dir> bind mounts, each with its service", () => {
    const listed = deploy.match(/^mounts="([^"]*)"$/m)?.[1]?.split(" ");
    expect(listed?.sort()).toEqual(composeMounts().sort());
  });
});

describe("a deploy", () => {
  it("restarts the `box` service, and not `page`, after a pull that changes box/", () => {
    expect(restarted(deployChanging("box/server.mjs"))).toEqual(["box"]);
  });

  it("restarts `page`, and not the `box` service, after a pull that changes page/", () => {
    expect(restarted(deployChanging("page/render.sh"))).toEqual(["page"]);
  });

  it("restarts `page`, and not the `box` service, after a pull that changes look/", () => {
    expect(restarted(deployChanging("look/look.bundle.js"))).toEqual(["page"]);
  });

  it("restarts a service once when the pull changes two of its directories", () => {
    expect(
      restarted(deployChanging("box/server.mjs", "page/render.sh", "look/look.bundle.js")),
    ).toEqual(["box", "page"]);
  });

  it("restarts nothing after a pull that changes no mounted directory", () => {
    const calls = deployChanging("README.md");
    expect(calls).toEqual(["compose --env-file /etc/rails49/box.env up -d --remove-orphans"]);
  });
});
