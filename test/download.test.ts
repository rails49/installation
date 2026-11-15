/**
 * Downloading a release (#121), asserted against `run()`, what the one-shot
 * container `rails49-download` does, `wanted()`, which release the box
 * downloads, and `begin()`, how `box` starts it. The docker CLI, the Engine
 * API's pull, the box's files, GitHub, free disk and the clock are handed
 * in, so a test needs no daemon and no box.
 */

import { describe, expect, it, vi } from "vitest";

import { begin, beginDownload, run, wanted, type Io } from "../box/download.mjs";
import type { PullMessage } from "../box/update.mjs";

const BACK = "2026.10.0";
const OLD = "2026.11.0";
const STALE = "2026.11.1";
const NEW = "2026.11.2";
const RELEASES = "/var/lib/rails49/releases";
const RECORD = "/var/lib/rails49/deploys/installation";
const CHECK = "/var/lib/rails49/check.json";
const DOWNLOADING = "/var/lib/rails49/download.json";

const DIGEST = (n: number) => `sha256:${String(n).repeat(64).slice(0, 64)}`;
const LAYER = (c: string) => `sha256:${c.repeat(64)}`;
const short = (digest: string) => digest.slice(7, 19);

/** A release's manifest: its installation and control images, and traefik. */
function manifest(release: string, n: number, layers?: object) {
  return {
    release,
    stacks: {
      installation: { commit: `inst${n}`, images: { "installation-box": DIGEST(n) } },
      control: { commit: `ctrl${n}`, images: { control: DIGEST(n + 1) } },
    },
    stock: { "traefik:v3.7": DIGEST(n + 2) },
    ...(layers ? { layers } : {}),
  };
}

const BOX_IMAGE = `ghcr.io/rails49/installation-box:inst7@${DIGEST(7)}`;
const CONTROL_IMAGE = `ghcr.io/rails49/control:ctrl7@${DIGEST(8)}`;
const TRAEFIK_IMAGE = `traefik:v3.7@${DIGEST(9)}`;

/** The new release's layers for linux/arm64: 400 MB and 200 MB. */
const LAYERS = {
  [DIGEST(7)]: { "linux/arm64": [{ digest: LAYER("a"), size: 400e6 }] },
  [DIGEST(8)]: { "linux/arm64": [{ digest: LAYER("b"), size: 200e6 }] },
  [DIGEST(9)]: { "linux/arm64": [{ digest: LAYER("c"), size: 50e6 }] },
};

/** What Docker streams for an image: its one layer downloaded in halves. */
function* stream(image: string): Generator<PullMessage> {
  const digest = image.split("@")[1]!;
  const layer = (LAYERS as Record<string, Record<string, { digest: string; size: number }[]>>)[digest]?.["linux/arm64"]?.[0];
  if (!layer) return;
  yield { status: "Pulling fs layer", id: short(layer.digest), progressDetail: {} };
  yield { status: "Downloading", id: short(layer.digest), progressDetail: { current: layer.size / 2, total: layer.size } };
  yield { status: "Downloading", id: short(layer.digest), progressDetail: { current: layer.size, total: layer.size } };
  yield { status: "Download complete", id: short(layer.digest), progressDetail: {} };
  yield { status: "Pull complete", id: short(layer.digest), progressDetail: {} };
}

/**
 * A box on `OLD`, which went there from `BACK` and has `STALE` downloaded,
 * declaring control and jmri. Its control container runs `OLD`'s control
 * image.
 */
function box(
  options: { free?: number | number[]; fail?: string; files?: Record<string, string>; layers?: boolean } = {},
) {
  // A list is free disk at each read, its last repeated.
  const frees = Array.isArray(options.free) ? [...options.free] : [options.free ?? 20e9];
  const files: Record<string, string> = {
    [RECORD]: `2026-11-01T09:00:00Z  -  ->  ${BACK}  passed\n2026-11-10T09:00:00Z  ${BACK}  ->  ${OLD}  passed\n`,
    [`${RELEASES}/${BACK}/manifest.json`]: JSON.stringify(manifest(BACK, 1)),
    [`${RELEASES}/${OLD}/manifest.json`]: JSON.stringify(manifest(OLD, 2)),
    // STALE pins BACK's traefik.
    [`${RELEASES}/${STALE}/manifest.json`]: JSON.stringify({ ...manifest(STALE, 4), stock: { "traefik:v3.7": DIGEST(3) } }),
    ...options.files,
  };
  const dirs = new Set([BACK, OLD, STALE]);
  const asked: string[] = [];
  const writes: Record<string, unknown>[] = [];
  let clock = Date.parse("2026-11-15T10:00:00Z");
  const io: Io = {
    docker: async (args) => {
      const line = args.join(" ");
      asked.push(line);
      if (options.fail && line.includes(options.fail)) throw new Error(`${options.fail} failed`);
      if (line.endsWith("config --images")) {
        return line.includes("control/compose.yaml") ? `${CONTROL_IMAGE}\n` : `${BOX_IMAGE}\n${TRAEFIK_IMAGE}\n`;
      }
      if (line === "version --format {{.Server.Os}}/{{.Server.Arch}}") return "linux/arm64\n";
      if (line === "ps -aq") return "a\nb\n";
      if (line === "inspect --format {{.Image}} a b") return "sha256:old-box\nsha256:old-control\n";
      if (line.startsWith("image ls")) {
        return [
          // STALE's control image, which nothing else uses.
          { Repository: "ghcr.io/rails49/control", Tag: "<none>", Digest: DIGEST(5), ID: "sha256:stale-control" },
          // STALE's traefik, which BACK pins too.
          { Repository: "traefik", Tag: "<none>", Digest: DIGEST(3), ID: "sha256:back-traefik" },
          // OLD's control image, which a container runs.
          { Repository: "ghcr.io/rails49/control", Tag: "<none>", Digest: DIGEST(3), ID: "sha256:old-control" },
          // STALE's box image, which a container runs.
          { Repository: "ghcr.io/rails49/installation-box", Tag: "<none>", Digest: DIGEST(4), ID: "sha256:old-box" },
          { Repository: "eclipse-temurin", Tag: "21", Digest: DIGEST(2), ID: "sha256:other" },
        ]
          .map((image) => JSON.stringify(image))
          .join("\n");
      }
      return "";
    },
    pull: async function* (image) {
      asked.push(`pull ${image}`);
      if (options.fail && `pull ${image}`.includes(options.fail)) throw new Error("toomanyrequests");
      for (const message of stream(image)) {
        clock += 600;
        yield message;
      }
    },
    download: async (url, path) => {
      asked.push(`download ${url}`);
      if (options.fail && url.includes(options.fail)) throw new Error("GitHub answered 404");
      if (url.endsWith("manifest.json")) {
        files[path] = JSON.stringify(manifest(NEW, 7, options.layers === false ? undefined : LAYERS));
      }
    },
    unpack: async (archive) => void asked.push(`unpack ${archive}`),
    rename: async (from, to) => {
      asked.push(`rename ${from} ${to}`);
      for (const path of Object.keys(files)) {
        if (path.startsWith(`${from}/`)) files[to + path.slice(from.length)] = files[path]!;
      }
      dirs.add(to.slice(RELEASES.length + 1));
    },
    remove: async (path) => {
      asked.push(`remove ${path}`);
      dirs.delete(path.slice(RELEASES.length + 1));
    },
    list: async (dir) => (dir === RELEASES ? [...dirs] : []),
    read: async (path) => files[path] ?? null,
    write: async (path, text) => {
      files[path] = text;
      if (path === DOWNLOADING) writes.push(JSON.parse(text));
    },
    now: () => new Date(clock),
    free: async () => {
      asked.push("free");
      return frees.length > 1 ? frees.shift()! : frees[0]!;
    },
  };
  return { io, files, asked, dirs, writes, state: () => JSON.parse(files[DOWNLOADING]!) };
}

const ENV = { BOX_DOMAIN: "", BOX_UIS: "control jmri" };

describe("a download that passes", () => {
  it("fetches the release's files, then pulls every image of every declared stack, and touches no container", async () => {
    const { io, asked } = box();
    await run(OLD, NEW, ENV, io);
    const base = `https://github.com/rails49/installation/releases/download/${NEW}`;
    expect(asked.filter((line) => line.startsWith("download"))).toEqual([
      `download ${base}/manifest.json`,
      `download ${base}/box-files.tar.gz`,
    ]);
    expect(asked.filter((line) => line.startsWith("pull"))).toEqual([
      `pull ${BOX_IMAGE}`,
      `pull ${TRAEFIK_IMAGE}`,
      `pull ${CONTROL_IMAGE}`,
    ]);
    // JMRI is built by the update, and no stack is stopped, started or
    // recreated.
    expect(asked.some((line) => /\b(up|down|stop|start|build|restart|create)\b/.test(line) && !line.startsWith("pull"))).toBe(false);
    expect(asked.some((line) => line.includes("jmri"))).toBe(false);
  });

  it("says it has downloaded the release, with every byte of the total", async () => {
    const { io, state } = box();
    await run(OLD, NEW, ENV, io);
    expect(state()).toEqual({
      release: NEW,
      started: "2026-11-15T10:00:00.000Z",
      finished: expect.any(String),
      downloaded: true,
      failure: null,
      disk: null,
      bytes: { current: 650e6, total: 650e6 },
    });
  });

  it("says the bytes downloaded as it pulls, at most once a second, and says it has not finished", async () => {
    const { io, writes } = box();
    await run(OLD, NEW, ENV, io);
    const during = writes.slice(1, -1);
    expect(during.length).toBeGreaterThan(1);
    expect(during.every((w) => w.finished === null && w.downloaded === false)).toBe(true);
    const current = during.map((w) => (w.bytes as { current: number }).current);
    expect(current).toEqual(current.toSorted((a, b) => a - b));
    expect(during.every((w) => (w.bytes as { total: number }).total === 650e6)).toBe(true);
  });

  it("uses the release's files where they are on the box already", async () => {
    const { io, asked } = box({ files: { [`${RELEASES}/${NEW}/manifest.json`]: JSON.stringify(manifest(NEW, 7, LAYERS)) } });
    await run(OLD, NEW, ENV, io);
    expect(asked.some((line) => line.startsWith("download"))).toBe(false);
  });

  it("says nothing of bytes where the manifest lists no layers, and downloads anyway", async () => {
    const { io, asked, state } = box({ layers: false });
    await run(OLD, NEW, ENV, io);
    expect(state()).toMatchObject({ downloaded: true, bytes: null, disk: null });
    // No total to compare: free disk is first read between pulls.
    expect(asked.indexOf("free")).toBeGreaterThan(asked.indexOf(`pull ${BOX_IMAGE}`));
  });
});

describe("the release downloaded before", () => {
  it("goes before the pulls: its files, and the images neither the release the box runs nor the one to go back to uses", async () => {
    const { io, asked, dirs } = box();
    await run(OLD, NEW, ENV, io);
    const removed = asked.filter((line) => line.startsWith("image rm"));
    expect(removed).toEqual([`image rm ghcr.io/rails49/control@${DIGEST(5)}`]);
    expect(asked.indexOf(`remove ${RELEASES}/${STALE}`)).toBeLessThan(asked.indexOf(`pull ${BOX_IMAGE}`));
    expect([...dirs].sort()).toEqual([BACK, OLD, NEW]);
  });

  it("goes before the pulls where it is newer than the one the check names, as a pre-release once pre-releases go off (#126)", async () => {
    const PRE = "2026.11.3";
    const { io, asked, dirs, files } = box();
    dirs.delete(STALE);
    dirs.add(PRE);
    files[`${RELEASES}/${PRE}/manifest.json`] = JSON.stringify({ ...manifest(PRE, 4), stock: { "traefik:v3.7": DIGEST(3) } });
    await run(OLD, NEW, ENV, io);
    expect(asked.filter((line) => line.startsWith("image rm"))).toEqual([`image rm ghcr.io/rails49/control@${DIGEST(5)}`]);
    expect(asked.indexOf(`remove ${RELEASES}/${PRE}`)).toBeLessThan(asked.indexOf(`pull ${BOX_IMAGE}`));
    expect([...dirs].sort()).toEqual([BACK, OLD, NEW]);
  });

  it("is all that goes: with no other release on the box, no image does", async () => {
    const { io, asked, dirs } = box();
    dirs.delete(STALE);
    await run(OLD, NEW, ENV, io);
    expect(asked.some((line) => line.startsWith("image rm"))).toBe(false);
  });
});

describe("a download that does not pass", () => {
  it("with less free disk than its bytes and 1 GB pulls nothing and says what it needs", async () => {
    const { io, asked, state } = box({ free: 0.9e9 });
    await run(OLD, NEW, ENV, io);
    expect(asked.some((line) => line.startsWith("pull"))).toBe(false);
    expect(state()).toMatchObject({
      downloaded: false,
      disk: { needs: 1.65e9, free: 0.9e9 },
      failure: `Not enough free disk to download ${NEW}: it needs 1.6 GB, 0.9 GB is free.`,
      finished: expect.any(String),
    });
  });

  it("with free disk falling below 1 GB after the first image pulls no further image and says it stopped (#129)", async () => {
    const { io, asked, state } = box({ free: [20e9, 0.9e9] });
    await run(OLD, NEW, ENV, io);
    expect(asked.filter((line) => line.startsWith("pull") || line === "free")).toEqual([
      "free",
      `pull ${BOX_IMAGE}`,
      "free",
    ]);
    expect(state()).toMatchObject({
      downloaded: false,
      disk: { keeps: 1e9, free: 0.9e9 },
      failure: `Stopped downloading ${NEW}: 0.9 GB is free, and the box keeps 1 GB free.`,
      finished: expect.any(String),
    });
  });

  it("reads free disk between image pulls, not after the last (#129)", async () => {
    const { io, asked, state } = box();
    await run(OLD, NEW, ENV, io);
    expect(asked.filter((line) => line.startsWith("pull") || line === "free")).toEqual([
      "free",
      `pull ${BOX_IMAGE}`,
      "free",
      `pull ${TRAEFIK_IMAGE}`,
      "free",
      `pull ${CONTROL_IMAGE}`,
    ]);
    expect(state()).toMatchObject({ downloaded: true, disk: null });
  });

  it("whose pull fails says which image and why", async () => {
    const { io, state } = box({ fail: "pull ghcr.io/rails49/control" });
    await run(OLD, NEW, ENV, io);
    expect(state()).toMatchObject({
      downloaded: false,
      failure: "Could not pull ghcr.io/rails49/control:ctrl7: toomanyrequests.",
      finished: expect.any(String),
    });
  });

  it("whose files cannot be fetched says why", async () => {
    const { io, state } = box({ fail: "box-files" });
    await run(OLD, NEW, ENV, io);
    expect(state()).toMatchObject({ downloaded: false, failure: "GitHub answered 404." });
  });
});

describe("the release the box downloads", () => {
  const read =
    (files: Record<string, unknown>) =>
    async (path: string): Promise<string | null> => {
      const file = files[path];
      return file === undefined ? null : typeof file === "string" ? file : JSON.stringify(file);
    };
  const RECORDED = `2026-11-10T09:00:00Z  -  ->  ${OLD}  passed\n`;
  const at = (latest: string | null, checked = "2026-11-15T10:00:00.000Z") => ({ latest, checked, succeeded: checked });
  const got = (more: object) => ({ release: NEW, started: "2026-11-15T09:00:00.000Z", finished: null, downloaded: false, failure: null, ...more });

  it("is the one the last check named, where it is newer than the one the box runs", async () => {
    expect(await wanted(read({ [RECORD]: RECORDED, [CHECK]: at(NEW) }))).toBe(NEW);
    expect(await wanted(read({ [CHECK]: at(NEW) }))).toBe(NEW);
    expect(await wanted(read({ [RECORD]: RECORDED, [CHECK]: at(OLD) }))).toBeNull();
    expect(await wanted(read({ [RECORD]: RECORDED, [CHECK]: at(BACK) }))).toBeNull();
    expect(await wanted(read({ [RECORD]: RECORDED, [CHECK]: at(null) }))).toBeNull();
    expect(await wanted(read({ [RECORD]: RECORDED }))).toBeNull();
  });

  it("is not the one it downloaded, newer or older: the downloaded release follows the check (#126)", async () => {
    const base = { [RECORD]: RECORDED, [CHECK]: at(NEW) };
    expect(await wanted(read({ ...base, [DOWNLOADING]: got({ release: STALE, downloaded: true }) }))).toBe(NEW);
    expect(await wanted(read({ ...base, [DOWNLOADING]: got({ release: "2026.12.0", downloaded: true }) }))).toBe(NEW);
    const done = got({ downloaded: true, finished: "2026-11-15T09:30:00.000Z" });
    expect(await wanted(read({ ...base, [DOWNLOADING]: done, [`${RELEASES}/${NEW}/manifest.json`]: "{}" }))).toBeNull();
  });

  it("is the full release a check finds once pre-releases go off, after a newer pre-release was downloaded (#126)", async () => {
    // The box runs 2026.11.1 and downloaded pre-release 2026.11.3; the check
    // now finds full release 2026.11.2.
    const PRE = "2026.11.3";
    const files = {
      [RECORD]: `2026-11-10T09:00:00Z  -  ->  ${STALE}  passed\n`,
      [CHECK]: at(NEW, "2026-11-16T10:00:00.000Z"),
      [DOWNLOADING]: got({ release: PRE, downloaded: true, finished: "2026-11-15T09:30:00.000Z" }),
      [`${RELEASES}/${PRE}/manifest.json`]: "{}",
    };
    expect(await wanted(read(files))).toBe(NEW);
  });

  it("is the one it was downloading, which carries on after a reboot", async () => {
    expect(await wanted(read({ [RECORD]: RECORDED, [CHECK]: at(NEW), [DOWNLOADING]: got({}) }))).toBe(NEW);
  });

  it("after a download that failed, waits for the next check", async () => {
    const failed = got({ finished: "2026-11-15T10:30:00.000Z", failure: "GitHub answered 502." });
    expect(await wanted(read({ [RECORD]: RECORDED, [CHECK]: at(NEW), [DOWNLOADING]: failed }))).toBeNull();
    const later = at(NEW, "2026-11-16T10:00:00.000Z");
    expect(await wanted(read({ [RECORD]: RECORDED, [CHECK]: later, [DOWNLOADING]: failed }))).toBe(NEW);
  });
});

describe("starting a download", () => {
  function starting(
    options: { update?: string; download?: string; fails?: "manifest" | "pull" | "create"; pulled?: Promise<unknown> } = {},
  ) {
    const asked: string[] = [];
    let clock = Date.parse("2026-11-15T10:00:00Z");
    const files: Record<string, string> = {
      [RECORD]: `2026-11-10T09:00:00Z  -  ->  ${OLD}  passed\n`,
      [CHECK]: JSON.stringify({ latest: NEW, checked: "2026-11-15T10:00:00.000Z" }),
    };
    const io = {
      docker: async (args: string[]) => {
        asked.push(args.join(" "));
        if (args[0] === "ps") {
          return args.includes("name=^rails49-update$") ? (options.update ?? "") : (options.download ?? "");
        }
        if (options.fails === "pull" && (args[0] === "pull" || args[1] === "inspect")) {
          throw new Error("Error response from daemon: toomanyrequests");
        }
        if (options.fails === "create" && args[0] === "create") throw new Error("Error response from daemon: no space left on device");
        if (options.pulled && args[1] === "inspect") throw new Error("No such image");
        if (options.pulled && args[0] === "pull") await options.pulled;
        return "";
      },
      read: async (path: string) => files[path] ?? null,
      write: async (path: string, text: string) => {
        asked.push(`write ${path}`);
        files[path] = text;
      },
      now: () => new Date(clock),
      fetch: async (url: string) => {
        asked.push(`fetch ${url}`);
        if (options.fails === "manifest") return new Response("Not Found", { status: 404 });
        return new Response(JSON.stringify(manifest(NEW, 7)));
      },
    };
    return { io, asked, files, tick: (ms: number) => void (clock += ms) };
  }

  it("runs rails49-download from the new release's box image, with the socket, and says so first", async () => {
    const { io, asked, files } = starting({ download: "exited\n" });
    expect(await begin(ENV, io)).toBe(NEW);
    expect(asked).toEqual([
      "ps -a --filter name=^rails49-download$ --format {{.State}}",
      "ps -a --filter name=^rails49-update$ --format {{.State}}",
      `write ${DOWNLOADING}`,
      `fetch https://github.com/rails49/installation/releases/download/${NEW}/manifest.json`,
      `image inspect ${BOX_IMAGE}`,
      "ps -a --filter name=^rails49-download$ --format {{.State}}",
      "rm rails49-download",
      [
        "create --name rails49-download",
        "-v /var/run/docker.sock:/var/run/docker.sock",
        "-v /etc/rails49:/etc/rails49:ro",
        "-v /var/lib/rails49:/var/lib/rails49",
        "-e BOX_DOMAIN= -e BOX_UIS=control jmri",
        `${BOX_IMAGE} node /box/update.mjs download ${OLD} ${NEW}`,
      ].join(" "),
      "start rails49-download",
    ]);
    expect(JSON.parse(files[DOWNLOADING]!)).toMatchObject({ release: NEW, finished: null, downloaded: false, failure: null });
  });

  // #124: a failure before the container starts is the download's, as one inside it is.
  it.each([
    ["manifest", "GitHub answered 404 for release 2026.11.2's manifest."],
    ["pull", "Could not start rails49-download: Error response from daemon: toomanyrequests."],
    ["create", "Could not start rails49-download: Error response from daemon: no space left on device."],
  ] as const)("records a failing %s as the download's failure, and says so", async (fails, failure) => {
    const { io, asked, files } = starting({ fails });
    await expect(begin(ENV, io)).rejects.toThrow(failure);
    expect(asked.some((line) => line.startsWith("start"))).toBe(false);
    expect(JSON.parse(files[DOWNLOADING]!)).toEqual({
      release: NEW,
      started: "2026-11-15T10:00:00.000Z",
      finished: "2026-11-15T10:00:00.000Z",
      downloaded: false,
      failure,
      disk: null,
      bytes: null,
    });
    // The next check tries again.
    files[CHECK] = JSON.stringify({ latest: NEW, checked: "2026-11-15T11:00:00.000Z" });
    expect(await wanted(io.read)).toBe(NEW);
  });

  // #125: what box does after a check answers before the pull, and its failure behind that is not lost.
  it("answers once the release is named, and records a failure after that as the download's", async () => {
    const { io, files } = starting({ fails: "pull" });
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await beginDownload(ENV, io);
      expect(JSON.parse(files[DOWNLOADING]!)).toMatchObject({ release: NEW, finished: null, failure: null });
      const failure = "Could not start rails49-download: Error response from daemon: toomanyrequests.";
      await vi.waitFor(() => expect(JSON.parse(files[DOWNLOADING]!)).toMatchObject({ failure }));
      expect(logged).toHaveBeenCalledWith(`downloading a new release: ${failure}`);
    } finally {
      logged.mockRestore();
    }
  });

  it("starts none while one runs, or while the box updates, goes back or applies the setup", async () => {
    for (const running of [{ download: "running\n" }, { update: "running\n" }]) {
      const { io, asked } = starting(running);
      expect(await begin(ENV, io)).toBeNull();
      expect(asked.some((line) => line.startsWith("create"))).toBe(false);
    }
  });

  // #132: a second press, or the hourly check, while the box image pulls.
  it("starts none while another start's box image pulls, and leaves download.json as that one wrote it", async () => {
    let pulled = () => {};
    const { io, asked, files, tick } = starting({ pulled: new Promise<void>((resolve) => (pulled = resolve)) });
    const first = begin(ENV, io);
    await vi.waitFor(() => expect(asked).toContain(`pull ${BOX_IMAGE}`));
    tick(60_000);
    expect(await begin(ENV, io)).toBeNull();
    pulled();
    expect(await first).toBe(NEW);
    expect(asked.filter((line) => line.startsWith("create"))).toHaveLength(1);
    expect(JSON.parse(files[DOWNLOADING]!)).toMatchObject({ started: "2026-11-15T10:00:00.000Z", finished: null });
  });

  it("starts none where there is nothing newer to download", async () => {
    const { io, asked, files } = starting();
    files[CHECK] = JSON.stringify({ latest: OLD });
    expect(await begin(ENV, io)).toBeNull();
    expect(asked).toEqual([]);
  });
});
