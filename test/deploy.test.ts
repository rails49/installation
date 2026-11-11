/**
 * What `./deploy.sh` does on the box.
 *
 * The part that runs there is the heredoc it feeds to `bash -s`. It is run
 * here the same way, in a clone that pulls from a scratch upstream, with
 * `docker` on PATH replaced by a script that writes down what it was asked
 * and the commit it was handed.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

const deploy = readFileSync(new URL("deploy.sh", root), "utf8");

/** The heredoc: what `./deploy.sh` runs on the box. */
const remote = deploy.match(/<<'REMOTE'\n([\s\S]*?)\nREMOTE\n/)![1]!;

/** git with an identity of its own, for a CI runner that has none. */
const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, {
    cwd,
    encoding: "utf8",
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
 *  commit, after `before` has done what it likes to the clone. Returns the
 *  upstream's head, what docker was asked (one call per line, each prefixed
 *  with the `INSTALLATION_COMMIT` it saw), the exit status and stderr. */
function deployed(before: (clone: string) => void = () => {}) {
  const scratch = mkdtempSync(join(tmpdir(), "deploy-"));
  const upstream = join(scratch, "upstream");
  const clone = join(scratch, "home", "installation");
  const bin = join(scratch, "bin");
  const log = join(scratch, "docker.log");

  mkdirSync(join(upstream, "page"), { recursive: true });
  writeFileSync(join(upstream, "page", "render.sh"), "before\n");
  git(upstream, "init", "-q", "-b", "main");
  git(upstream, "add", ".");
  git(upstream, "commit", "-q", "-m", "before");
  mkdirSync(join(scratch, "home"));
  git(join(scratch, "home"), "clone", "-q", upstream, "installation");

  writeFileSync(join(upstream, "page", "render.sh"), "after\n");
  git(upstream, "commit", "-q", "-am", "after");
  const head = git(upstream, "rev-parse", "HEAD").trim();

  before(clone);

  mkdirSync(bin);
  writeFileSync(
    join(bin, "docker"),
    `#!/bin/sh\necho "INSTALLATION_COMMIT=$INSTALLATION_COMMIT $*" >> '${log}'\n`,
  );
  chmodSync(join(bin, "docker"), 0o755);

  try {
    const run = spawnSync("bash", ["-s"], {
      input: remote,
      encoding: "utf8",
      env: { ...process.env, HOME: join(scratch, "home"), PATH: `${bin}:${process.env.PATH}` },
    });
    const calls = existsSync(log) ? readFileSync(log, "utf8").trimEnd().split("\n") : [];
    return { head, calls, status: run.status, stderr: run.stderr };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

describe("a deploy", () => {
  it("builds the page and the box under the commit it pulled, and brings them up", () => {
    const { head, calls, status } = deployed();
    expect(status).toBe(0);
    expect(calls).toEqual([
      `INSTALLATION_COMMIT=${head} compose --env-file /etc/rails49/box.env up -d --build --remove-orphans`,
    ]);
  });

  it("refuses a clone with a changed file, and builds nothing", () => {
    // The image would be named after a commit that is not what was built.
    const { calls, status, stderr } = deployed((clone) =>
      writeFileSync(join(clone, "page", "render.sh"), "changed on the box\n"),
    );
    expect(status).not.toBe(0);
    expect(stderr).toContain("not clean");
    expect(stderr).toContain("page/render.sh");
    expect(calls).toEqual([]);
  });

  it("refuses a clone with a file git does not know, and builds nothing", () => {
    // `page/` is copied into the image whole.
    const { calls, status } = deployed((clone) =>
      writeFileSync(join(clone, "page", "stray.html"), "\n"),
    );
    expect(status).not.toBe(0);
    expect(calls).toEqual([]);
  });
});
