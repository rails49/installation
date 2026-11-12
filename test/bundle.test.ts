/**
 * The log bundle (#65 decision 18): what goes in, asserted against
 * `bundle()` with the docker CLI and the box's files handed in, and the
 * archive `pack()` makes of it, listed with `tar`.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { bundle, pack } from "../box/bundle.mjs";

const FILES: Record<string, string> = {
  "/etc/rails49/box.env": 'BOX_DOMAIN=example.org\nBOX_UIS="control jmri"\n',
  "/etc/rails49/acme.env": "CF_DNS_API_TOKEN=secret\n",
  "/etc/rails49/control.env": "TC49_STORE=/var/lib/rails49/tc49\n",
  "/var/lib/rails49/deploys/installation": "2026-11-11T09:00:00Z  -  ->  2026.11.0  passed\n",
  "/var/lib/rails49/deploys/dccex": "2026-11-10T09:00:00Z  nothing  ->  ghcr.io/rails49/dccex:1c3f69b\n",
  "/var/lib/rails49/releases/2026.11.0/manifest.json": '{"release":"2026.11.0"}',
};

const asked: string[][] = [];

const io = {
  docker: async (args: string[]) => {
    asked.push(args);
    if (args[0] === "ps") return "installation-door-1\ntc49-store-1\n";
    if (args[0] === "compose" && args[2] === "jmri") throw new Error("no such project: jmri");
    return `docker ${args.join(" ")}\n`;
  },
  logs: async (container: string) => `the log of ${container}\n`,
  read: async (path: string) => FILES[path] ?? null,
  list: async (dir: string) =>
    Object.keys(FILES)
      .filter((path) => path.startsWith(`${dir}/`))
      .map((path) => path.slice(dir.length + 1)),
  now: () => new Date("2026-11-12T10:00:00Z"),
};

const ENV = { BOX_DOMAIN: "example.org", BOX_UIS: "control jmri", hostname: "box" };

const made = await bundle(ENV, io);
const contents = Object.fromEntries(made.entries.map(({ path, content }) => [path, content]));

describe("the log bundle", () => {
  it("is named for the box and the time it was made", async () => {
    expect(made.name).toBe("example.org-20261112T1000Z.tar.gz");
    expect((await bundle({ ...ENV, BOX_DOMAIN: "" }, io)).name).toBe("box-20261112T1000Z.tar.gz");
  });

  it("holds the records, the current manifest, and docker's version and info", () => {
    expect(contents["deploys/installation"]).toBe(FILES["/var/lib/rails49/deploys/installation"]);
    expect(contents["deploys/dccex"]).toBe(FILES["/var/lib/rails49/deploys/dccex"]);
    expect(contents["manifest.json"]).toBe('{"release":"2026.11.0"}');
    expect(contents["docker-version.txt"]).toBe("docker version\n");
    expect(contents["docker-info.txt"]).toBe("docker info\n");
  });

  it("holds the declaration and every stack's settings that are there", () => {
    expect(Object.keys(contents).filter((path) => path.startsWith("etc/"))).toEqual([
      "etc/box.env",
      "etc/control.env",
    ]);
    expect(contents["etc/box.env"]).toBe(FILES["/etc/rails49/box.env"]);
  });

  it("never holds the ACME credential or what the door was issued", () => {
    const everything = made.entries.map(({ path, content }) => `${path}\n${content}`).join("\n");
    expect(everything).not.toContain("acme");
    expect(everything).not.toContain("secret");
  });

  it("holds compose's list of each declared stack's containers", () => {
    expect(contents["compose/installation.txt"]).toBe("docker compose -p installation ps -a\n");
    expect(contents["compose/control.txt"]).toBe("docker compose -p tc49 ps -a\n");
    expect(Object.keys(contents).filter((path) => path.startsWith("compose/"))).toHaveLength(3);
  });

  it("holds what a command said when it failed, and goes on", () => {
    expect(contents["compose/jmri.txt"]).toBe("no such project: jmri\n");
  });

  it("holds the last 1000 lines of every container's log", () => {
    expect(contents["logs/installation-door-1.log"]).toBe("the log of installation-door-1\n");
    expect(contents["logs/tc49-store-1.log"]).toBe("the log of tc49-store-1\n");
  });
});

describe("the archive", () => {
  const scratch = mkdtempSync(join(tmpdir(), "bundle-"));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));

  it("is a .tar.gz holding every entry under the bundle's name", async () => {
    const archive = join(scratch, made.name);
    writeFileSync(archive, await pack(made.name, made.entries));
    const listed = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" }).split("\n").filter(Boolean);
    const top = made.name.replace(/\.tar\.gz$/, "");
    expect(listed.filter((path) => !path.endsWith("/")).sort()).toEqual(
      made.entries.map(({ path }) => `${top}/${path}`).sort(),
    );
    const box = execFileSync("tar", ["-xzOf", archive, `${top}/etc/box.env`], { encoding: "utf8" });
    expect(box).toBe(FILES["/etc/rails49/box.env"]);
  });
});
