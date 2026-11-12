// The log bundle the status page offers (#65 decision 18): one .tar.gz of
// the records, the current manifest, `docker version` and `docker info`, the
// declaration and every stack's settings, `docker compose ps -a` for each
// stack, and the last 1000 lines of each container's log. The files are
// read by name, so `acme.env` and `acme.json` are never in it.

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

import { currentRelease, declared, manifestPath } from "./status.mjs";

/** The declaration and each stack's settings (decision 14). */
const SETTINGS = ["box.env", "control.env", "dccex.env", "occupancy.env"];

const DEPLOYS = "/var/lib/rails49/deploys";

/**
 * @typedef {{
 *   docker: (args: string[]) => Promise<string>,
 *   logs: (container: string) => Promise<string>,
 *   read: (path: string) => Promise<string | null>,
 *   list: (dir: string) => Promise<string[]>,
 *   now: () => Date,
 * }} Io
 *
 * `logs` is a container's last 1000 lines, stdout and stderr together.
 * `list` is the names of the files in a directory, none where there is none.
 */

/**
 * The bundle's name and what is in it, each entry a path in the archive and
 * its content. A command that fails puts what it said in its place.
 *
 * @param {import("./status.mjs").Env} env
 * @param {Io} io
 */
export async function bundle(env, io) {
  /** @type {{ path: string, content: string }[]} */
  const entries = [];
  /** @param {string} path @param {() => Promise<string | null>} content */
  const add = async (path, content) => {
    let text;
    try {
      text = await content();
    } catch (error) {
      text = `${error instanceof Error ? error.message : error}\n`;
    }
    if (text !== null) entries.push({ path, content: text });
  };

  for (const record of await io.list(DEPLOYS)) {
    await add(`deploys/${record}`, () => io.read(`${DEPLOYS}/${record}`));
  }
  const release = await currentRelease(io.read);
  if (release !== null) await add("manifest.json", () => io.read(manifestPath(release)));
  await add("docker-version.txt", () => io.docker(["version"]));
  await add("docker-info.txt", () => io.docker(["info"]));
  for (const file of SETTINGS) await add(`etc/${file}`, () => io.read(`/etc/rails49/${file}`));
  for (const { stack, project } of declared(env.BOX_UIS)) {
    await add(`compose/${stack}.txt`, () => io.docker(["compose", "-p", project, "ps", "-a"]));
  }
  const containers = (await io.docker(["ps", "-a", "--format", "{{.Names}}"])).split("\n").filter(Boolean);
  for (const container of containers) await add(`logs/${container}.log`, () => io.logs(container));

  const stamp = io.now().toISOString().replace(/[-:]/g, "").slice(0, 13);
  return { name: `${env.BOX_DOMAIN || env.hostname}-${stamp}Z.tar.gz`, entries };
}

/**
 * The archive, every entry under one directory named for the bundle.
 *
 * @param {string} name
 * @param {{ path: string, content: string }[]} entries
 */
export async function pack(name, entries) {
  const scratch = await mkdtemp(join(tmpdir(), "bundle-"));
  try {
    const top = name.replace(/\.tar\.gz$/, "");
    for (const { path, content } of entries) {
      const file = join(scratch, top, path);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, content);
    }
    const { stdout } = await promisify(execFile)("tar", ["-czf", "-", "-C", scratch, top], {
      encoding: "buffer",
      maxBuffer: 256 * 1024 * 1024,
    });
    return stdout;
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}
