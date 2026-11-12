/**
 * Updating the box and going back (#65 decisions 8 to 12), asserted against
 * `run()`, what the one-shot container `rails49-update` does, and `start()`,
 * how `box` starts it. The docker CLI, the box's files, GitHub, the probe and
 * the clock are handed in, so a test needs no daemon and no box. Each docker
 * command the code runs is recorded and asserted in order.
 */

import { describe, expect, it } from "vitest";

import { run, start, type Io } from "../box/update.mjs";

const OLD = "2026.11.0";
const NEW = "2026.11.1";
const RELEASES = "/var/lib/rails49/releases";
const RECORD = "/var/lib/rails49/deploys/installation";
const PROGRESS = "/var/lib/rails49/update.json";

const DIGEST = (n: number) => `sha256:${String(n).repeat(64).slice(0, 64)}`;

function manifest(release: string, n: number) {
  return {
    release,
    stacks: {
      installation: { commit: `inst${n}`, images: { "installation-page": DIGEST(n), "installation-box": DIGEST(n + 1) } },
      control: { commit: `ctrl${n}`, images: { control: DIGEST(n + 2) } },
      dccex: { commit: `dcc${n}`, images: { dccex: DIGEST(n + 3) } },
      "occupancy-service": { commit: `occ${n}`, images: { "occupancy-service": DIGEST(n + 4) } },
    },
    stock: { "traefik:v3.7": DIGEST(n + 5) },
  };
}

/** One container as `docker inspect` writes it, the fields read here. */
function container(name: string, project: string, image: string, state = "running", started = "T0") {
  return {
    Name: `/${name}`,
    Image: image,
    State: { Status: state, StartedAt: started },
    Config: { Labels: { "com.docker.compose.project": project } },
  };
}

type Box = {
  io: Io;
  files: Record<string, string>;
  asked: string[];
  progress: () => Record<string, unknown>;
};

/**
 * A box on `OLD` declaring control and jmri, whose docker CLI answers as a
 * box's would. `fail` names a command, by a piece of its text, that fails.
 * `later` is the containers `docker inspect` answers after the 60 seconds.
 */
function box(options: { fail?: string; later?: object[]; probe?: { ok: boolean; output: string }; files?: Record<string, string> } = {}): Box {
  const files: Record<string, string> = {
    [RECORD]: `2026-11-10T09:00:00Z  -  ->  ${OLD}  passed\n`,
    [`${RELEASES}/${OLD}/manifest.json`]: JSON.stringify(manifest(OLD, 1)),
    ...options.files,
  };
  const dirs = new Set([`${RELEASES}/${OLD}`, `${RELEASES}/2026.10.0`]);
  const asked: string[] = [];
  const now = [
    container("installation-box-1", "installation", "sha256:box-old"),
    container("tc49-store-1", "tc49", "sha256:local-control"),
    container("jmri-jmri-1", "jmri", "sha256:jmri"),
    container("dccex-mirror-1", "dccex", "sha256:undeclared"),
  ];
  let waited = false;
  const io: Io = {
    docker: async (args) => {
      const line = args.join(" ");
      asked.push(line);
      if (options.fail && line.includes(options.fail)) throw new Error(`${options.fail} failed`);
      if (line.endsWith("config --images")) {
        const stack = args.find((a) => a.endsWith(".yaml"))!.split("/").at(-2);
        return `ghcr.io/rails49/${stack}:x@${DIGEST(7)}\ntraefik:v3.7@${DIGEST(8)}\n`;
      }
      if (line === "ps -aq") return "a\nb\nc\nd\n";
      if (args[0] === "inspect") return JSON.stringify(waited ? (options.later ?? now) : now);
      if (args[0] === "image" && args[1] === "ls") {
        return [
          { Repository: "ghcr.io/rails49/control", Tag: "<none>", Digest: DIGEST(5), ID: "sha256:new-control" },
          { Repository: "ghcr.io/rails49/control", Tag: "<none>", Digest: DIGEST(3), ID: "sha256:old-control" },
          { Repository: "ghcr.io/rails49/control", Tag: "<none>", Digest: DIGEST(9), ID: "sha256:older-control" },
          { Repository: "ghcr.io/rails49/control", Tag: "1c3f69b", Digest: "<none>", ID: "sha256:local-control" },
          { Repository: "ghcr.io/rails49/control", Tag: "0a1b2c3", Digest: "<none>", ID: "sha256:older-local" },
          { Repository: "traefik", Tag: "<none>", Digest: DIGEST(1), ID: "sha256:older-traefik" },
          { Repository: "traefik", Tag: "<none>", Digest: DIGEST(6), ID: "sha256:old-traefik" },
          { Repository: "eclipse-temurin", Tag: "21", Digest: DIGEST(2), ID: "sha256:other" },
        ]
          .map((image) => JSON.stringify(image))
          .join("\n");
      }
      return "";
    },
    download: async (url, path) => {
      asked.push(`download ${url} ${path}`);
      if (options.fail && url.includes(options.fail)) throw new Error("GitHub answered 404");
      if (url.endsWith("manifest.json")) files[path] = JSON.stringify(manifest(NEW, 3));
    },
    unpack: async (archive, dir) => void asked.push(`unpack ${archive} ${dir}`),
    rename: async (from, to) => {
      asked.push(`rename ${from} ${to}`);
      for (const path of Object.keys(files)) {
        if (path.startsWith(`${from}/`)) files[to + path.slice(from.length)] = files[path]!;
      }
      dirs.add(to);
    },
    remove: async (path) => {
      asked.push(`remove ${path}`);
      dirs.delete(path);
    },
    list: async (dir) => (dir === RELEASES ? [...dirs].map((d) => d.slice(dir.length + 1)) : []),
    read: async (path) => files[path] ?? null,
    write: async (path, text) => void (files[path] = text),
    append: async (path, text) => void (files[path] = (files[path] ?? "") + text),
    probe: async (args) => {
      asked.push(`probe ${args.join(" ")}`);
      return options.probe ?? { ok: true, output: "ok   200 want 200  http://192.168.1.20/\n" };
    },
    sleep: async (ms) => {
      asked.push(`sleep ${ms}`);
      waited = true;
    },
    now: () => new Date("2026-11-12T10:00:00Z"),
  };
  return { io, files, asked, progress: () => JSON.parse(files[PROGRESS]!) };
}

const ENV = { BOX_DOMAIN: "gleis49.org", BOX_UIS: "control jmri", hostname: "gleis49", address: "192.168.1.20" };

/** The compose command for one stack of `release`. */
function compose(release: string, files: string[], env: string | null) {
  const envs = ["--env-file /etc/rails49/box.env", ...(env ? [`--env-file /etc/rails49/${env}`] : [])];
  return `compose ${envs.join(" ")} ${files.map((f) => `-f ${RELEASES}/${release}/${f}`).join(" ")}`;
}

const INSTALLATION = (r: string) => compose(r, ["installation/compose.yaml"], null);
const CONTROL = (r: string) => compose(r, ["control/compose.yaml"], "control.env");
const JMRI = (r: string) => compose(r, ["installation/jmri/compose.yaml"], "control.env");

describe("an update that passes", () => {
  it("downloads the release, pulls every image, then brings up the declared stacks in order", async () => {
    const { io, asked } = box();
    await run("update", OLD, NEW, ENV, io);
    const part = `${RELEASES}/${NEW}.part`;
    const base = "https://github.com/rails49/installation/releases/download/2026.11.1";
    expect(asked.slice(0, 20)).toEqual([
      `remove ${part}`,
      `download ${base}/manifest.json ${part}/manifest.json`,
      `download ${base}/box-files.tar.gz ${part}/box-files.tar.gz`,
      `unpack ${part}/box-files.tar.gz ${part}`,
      `remove ${part}/box-files.tar.gz`,
      `rename ${part} ${RELEASES}/${NEW}`,
      // What ran before, for pruning.
      "ps -aq",
      "inspect a b c d",
      // Every image, before any container is recreated.
      `${INSTALLATION(NEW)} config --images`,
      `pull ghcr.io/rails49/installation:x@${DIGEST(7)}`,
      `pull traefik:v3.7@${DIGEST(8)}`,
      `${CONTROL(NEW)} config --images`,
      `pull ghcr.io/rails49/control:x@${DIGEST(7)}`,
      `pull traefik:v3.7@${DIGEST(8)}`,
      // JMRI is built on the box from a stock image.
      `${JMRI(NEW)} build --pull`,
      `${INSTALLATION(NEW)} up -d --no-build --pull never --remove-orphans`,
      `${CONTROL(NEW)} up -d --no-build --pull never --remove-orphans`,
      `${JMRI(NEW)} up -d --no-build --pull never --remove-orphans`,
      "ps -aq",
      "inspect a b c d",
    ]);
    expect(asked.slice(20, 24)).toEqual([
      "sleep 60000",
      "ps -aq",
      "inspect a b c d",
      "probe 192.168.1.20 gleis49 gleis49.org control jmri",
    ]);
  });

  it("appends a line to the record that says it passed", async () => {
    const { io, files } = box();
    await run("update", OLD, NEW, ENV, io);
    expect(files[RECORD]).toBe(
      `2026-11-10T09:00:00Z  -  ->  ${OLD}  passed\n2026-11-12T10:00:00Z  ${OLD}  ->  ${NEW}  passed\n`,
    );
  });

  it("says so in the progress file the status page reads", async () => {
    const { io, progress } = box();
    await run("update", OLD, NEW, ENV, io);
    expect(progress()).toEqual({
      action: "update",
      from: OLD,
      to: NEW,
      started: "2026-11-12T10:00:00.000Z",
      step: "Done.",
      finished: "2026-11-12T10:00:00.000Z",
      passed: true,
      failure: null,
    });
  });

  it("keeps the files of the release it left and the one it runs, and no other", async () => {
    const { io, asked } = box();
    await run("update", OLD, NEW, ENV, io);
    expect(asked).toContain(`remove ${RELEASES}/2026.10.0`);
    expect(asked).not.toContain(`remove ${RELEASES}/${OLD}`);
    expect(asked).not.toContain(`remove ${RELEASES}/${NEW}`);
  });

  it("removes every rails49 and pinned stock image neither release uses, but the builds that ran before it", async () => {
    const { io, asked } = box();
    await run("update", OLD, NEW, ENV, io);
    const removed = asked.filter((line) => line.startsWith("image rm"));
    expect(removed).toEqual([
      `image rm ghcr.io/rails49/control@${DIGEST(9)}`,
      "image rm ghcr.io/rails49/control:0a1b2c3",
      `image rm traefik@${DIGEST(1)}`,
    ]);
  });
});

describe("going back", () => {
  it("uses the files already on the box, and is recorded as one more line", async () => {
    const { io, asked, files } = box({
      files: {
        [RECORD]: `2026-11-10T09:00:00Z  ${OLD}  ->  ${NEW}  passed\n`,
        [`${RELEASES}/${NEW}/manifest.json`]: JSON.stringify(manifest(NEW, 3)),
      },
    });
    await run("back", NEW, OLD, ENV, io);
    expect(asked.some((line) => line.startsWith("download"))).toBe(false);
    expect(asked).toContain(`${CONTROL(OLD)} up -d --no-build --pull never --remove-orphans`);
    expect(files[RECORD]!.split("\n").at(-2)).toBe(`2026-11-12T10:00:00Z  ${NEW}  ->  ${OLD}  passed`);
  });
});

describe("applying the setup", () => {
  it("brings the declared stacks up at the release the box runs, after stopping the ones no longer declared", async () => {
    const { io, asked } = box();
    await run("apply", OLD, OLD, ENV, io);
    expect(asked.some((line) => line.startsWith("download"))).toBe(false);
    const down = asked.indexOf("compose -p dccex down");
    expect(down).toBeGreaterThan(asked.indexOf(`${JMRI(OLD)} build --pull`));
    expect(down).toBeLessThan(asked.indexOf(`${INSTALLATION(OLD)} up -d --no-build --pull never --remove-orphans`));
    expect(asked).toContain(`${CONTROL(OLD)} up -d --no-build --pull never --remove-orphans`);
    expect(asked.filter((line) => line.endsWith(" down"))).toEqual(["compose -p dccex down"]);
    expect(asked).toContain("probe 192.168.1.20 gleis49 gleis49.org control jmri");
  });

  it("appends nothing to the record and prunes nothing, so going back stays", async () => {
    const { io, asked, files, progress } = box();
    const record = files[RECORD];
    await run("apply", OLD, OLD, ENV, io);
    expect(files[RECORD]).toBe(record);
    expect(asked.some((line) => line.startsWith("image rm") || line.startsWith(`remove ${RELEASES}/`))).toBe(false);
    expect(progress()).toMatchObject({ action: "apply", step: "Done.", passed: true });
  });

  it("that fails says applying the setup", async () => {
    const later = [container("tc49-store-1", "tc49", "sha256:local-control", "exited")];
    const { io, progress } = box({ later });
    await run("apply", OLD, OLD, ENV, io);
    expect(progress().failure).toBe("control is not running 60 seconds after applying the setup: tc49-store-1 is exited.");
    const stopped = box({ fail: "dccex down" });
    await run("apply", OLD, OLD, ENV, stopped.io);
    expect(stopped.progress().failure).toBe(`Applying the setup at ${OLD} stopped: dccex down failed.`);
  });
});

describe("going back after an update that failed", () => {
  it("prunes nothing, so the release before stays", async () => {
    const { io, asked } = box({
      files: { [RECORD]: `2026-11-10T09:00:00Z  ${OLD}  ->  ${NEW}  failed\n` },
    });
    await run("back", OLD, OLD, ENV, io);
    expect(asked.some((line) => line.startsWith("image rm") || line.startsWith(`remove ${RELEASES}/`))).toBe(false);
  });
});

describe("an update that fails", () => {
  it("whose docker CLI fails anywhere still appends a failed line and says why", async () => {
    const { io, files, progress } = box({ fail: "inspect" });
    await run("update", OLD, NEW, ENV, io);
    expect(files[RECORD]!.split("\n").at(-2)).toBe(`2026-11-12T10:00:00Z  ${OLD}  ->  ${NEW}  failed`);
    expect(progress()).toMatchObject({ passed: false, failure: `The update to ${NEW} stopped: inspect failed.` });
  });

  it("whose container stops while going back says going back", async () => {
    const later = [container("tc49-store-1", "tc49", "sha256:local-control", "exited")];
    const { io, progress } = box({
      later,
      files: { [`${RELEASES}/${NEW}/manifest.json`]: JSON.stringify(manifest(NEW, 3)) },
    });
    await run("back", NEW, OLD, ENV, io);
    expect(progress().failure).toBe("control is not running 60 seconds after going back: tc49-store-1 is exited.");
  });

  it("whose pull fails names the stack and recreates no container", async () => {
    const { io, asked, files, progress } = box({ fail: "pull ghcr.io/rails49/control" });
    await run("update", OLD, NEW, ENV, io);
    expect(asked.some((line) => line.includes(" up -d"))).toBe(false);
    expect(progress()).toMatchObject({
      passed: false,
      failure: `Could not pull control's images for release ${NEW}: pull ghcr.io/rails49/control failed.`,
    });
    expect(files[RECORD]!.split("\n").at(-2)).toBe(`2026-11-12T10:00:00Z  ${OLD}  ->  ${NEW}  failed`);
  });

  it("whose stack does not start names it and starts none after it", async () => {
    const { io, asked, progress } = box({ fail: "control/compose.yaml up" });
    await run("update", OLD, NEW, ENV, io);
    expect(asked.some((line) => line.startsWith(`${JMRI(NEW)} up`))).toBe(false);
    expect(progress().failure).toBe(`control did not start on release ${NEW}: control/compose.yaml up failed.`);
  });

  it("whose container is not running after 60 seconds names the stack", async () => {
    const later = [
      container("installation-box-1", "installation", "sha256:box-old"),
      container("tc49-store-1", "tc49", "sha256:local-control", "restarting"),
      container("jmri-jmri-1", "jmri", "sha256:jmri"),
    ];
    const { io, progress } = box({ later });
    await run("update", OLD, NEW, ENV, io);
    expect(progress().failure).toBe("control is not running 60 seconds after the update: tc49-store-1 is restarting.");
  });

  it("whose container restarted within the 60 seconds names the stack", async () => {
    const later = [
      container("installation-box-1", "installation", "sha256:box-old"),
      container("tc49-store-1", "tc49", "sha256:local-control"),
      container("jmri-jmri-1", "jmri", "sha256:jmri", "running", "T1"),
    ];
    const { io, progress } = box({ later });
    await run("update", OLD, NEW, ENV, io);
    expect(progress().failure).toBe("jmri is not running 60 seconds after the update: jmri-jmri-1 restarted.");
  });

  it("whose probe fails says what the probe did not want", async () => {
    const output = "ok   200 want 200  http://192.168.1.20/\nFAIL 000 want 101  http://192.168.1.20:8081/mqtt  Origin: x\n";
    const { io, progress } = box({ probe: { ok: false, output } });
    await run("update", OLD, NEW, ENV, io);
    expect(progress().failure).toBe(
      "The probe got answers it did not want: FAIL 000 want 101  http://192.168.1.20:8081/mqtt  Origin: x",
    );
  });

  it("whose release cannot be downloaded says so and changes nothing", async () => {
    const { io, asked, progress } = box({ fail: "box-files.tar.gz" });
    await run("update", OLD, NEW, ENV, io);
    expect(asked.some((line) => line.startsWith("compose"))).toBe(false);
    expect(progress().failure).toBe(`Could not download release ${NEW}: GitHub answered 404.`);
  });

  it("prunes nothing", async () => {
    const { io, asked } = box({ fail: "control/compose.yaml up" });
    await run("update", OLD, NEW, ENV, io);
    expect(asked.some((line) => line.startsWith("image rm") || line === `remove ${RELEASES}/2026.10.0`)).toBe(false);
  });
});

describe("starting one", () => {
  /** What `start()` is handed: the box's docker CLI, files and GitHub. */
  function starting(options: { state?: string; record?: string; latest?: string | null } = {}) {
    const asked: string[] = [];
    const files: Record<string, string> = {
      [RECORD]: options.record ?? `2026-11-10T09:00:00Z  -  ->  ${OLD}  passed\n`,
      [`${RELEASES}/${OLD}/manifest.json`]: JSON.stringify(manifest(OLD, 1)),
      "/var/lib/rails49/check.json": JSON.stringify({ latest: options.latest === undefined ? NEW : options.latest }),
    };
    return {
      asked,
      files,
      io: {
        docker: async (args: string[]) => {
          asked.push(args.join(" "));
          return args[0] === "ps" ? (options.state ?? "") : "";
        },
        read: async (path: string) => files[path] ?? null,
        write: async (path: string, text: string) => {
          asked.push(`write ${path}`);
          files[path] = text;
        },
        now: () => new Date("2026-11-12T10:00:00Z"),
        fetch: async (url: string) => {
          asked.push(`fetch ${url}`);
          return new Response(JSON.stringify(manifest(NEW, 3)));
        },
      },
    };
  }

  const RUN = [
    "run -d --name rails49-update",
    "-v /var/run/docker.sock:/var/run/docker.sock",
    "-v /etc/rails49:/etc/rails49:ro",
    "-v /var/lib/rails49:/var/lib/rails49",
    "-e BOX_DOMAIN=gleis49.org -e BOX_UIS=control jmri -e BOX_HOSTNAME=gleis49 -e BOX_ADDRESS=192.168.1.20",
    "--add-host gleis49.local:192.168.1.20",
  ].join(" ");

  it("runs rails49-update from the new release's box image, with the socket, to the latest release", async () => {
    const { io, asked } = starting();
    expect(await start("update", ENV, io)).toBeNull();
    expect(asked).toEqual([
      "ps -a --filter name=^rails49-update$ --format {{.State}}",
      "fetch https://github.com/rails49/installation/releases/download/2026.11.1/manifest.json",
      `write ${PROGRESS}`,
      `${RUN} ghcr.io/rails49/installation-box:inst3@${DIGEST(4)} node /box/update.mjs update ${OLD} ${NEW}`,
    ]);
  });

  it("goes back with the previous release's box image, read from the box", async () => {
    const { io, asked } = starting({
      record: `2026-11-10T09:00:00Z  -  ->  ${OLD}  passed\n2026-11-11T09:00:00Z  ${OLD}  ->  ${NEW}  failed\n`,
    });
    expect(await start("back", ENV, io)).toBeNull();
    expect(asked.at(-1)).toBe(
      `${RUN} ghcr.io/rails49/installation-box:inst1@${DIGEST(2)} node /box/update.mjs back ${OLD} ${OLD}`,
    );
  });

  it("applies the setup with the box image of the release the box runs, for the stacks it is handed", async () => {
    const { io, asked } = starting();
    expect(await start("apply", { ...ENV, BOX_UIS: "control dccex" }, io)).toBeNull();
    expect(asked.some((line) => line.startsWith("fetch"))).toBe(false);
    expect(asked.at(-1)).toBe(
      `${RUN.replace("BOX_UIS=control jmri", "BOX_UIS=control dccex")} ghcr.io/rails49/installation-box:inst1@${DIGEST(2)} node /box/update.mjs apply ${OLD} ${OLD}`,
    );
  });

  it("says the new one is starting before its container runs, so the page shows no earlier one", async () => {
    const { io, asked, files } = starting({ state: "exited\n" });
    expect(await start("update", ENV, io)).toBeNull();
    expect(asked.slice(-3, -1)).toEqual(["rm rails49-update", `write ${PROGRESS}`]);
    expect(JSON.parse(files[PROGRESS]!)).toEqual({
      action: "update",
      from: OLD,
      to: NEW,
      started: "2026-11-12T10:00:00.000Z",
      step: "Starting.",
      finished: null,
      passed: null,
      failure: null,
    });
  });

  it("removes the container of the last one first", async () => {
    const { io, asked } = starting({ state: "exited\n" });
    expect(await start("update", ENV, io)).toBeNull();
    expect(asked.at(-3)).toBe("rm rails49-update");
  });

  it("is refused while one runs", async () => {
    const { io, asked } = starting({ state: "running\n" });
    expect(await start("update", ENV, io)).toBe("The box is already updating, going back or applying the setup.");
    expect(asked).toHaveLength(1);
  });

  it("is refused with no newer release, and going back with no release to go back to", async () => {
    expect(await start("update", ENV, starting({ latest: OLD }).io)).toBe("This box runs the latest release.");
    expect(await start("update", ENV, starting({ latest: null }).io)).toBe("This box runs the latest release.");
    expect(await start("back", ENV, starting().io)).toBe("There is no release to go back to.");
    expect(await start("apply", ENV, starting({ record: "" }).io)).toBe(
      "This box runs no release yet, so there is none to apply the setup at.",
    );
  });
});
