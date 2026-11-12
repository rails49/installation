/**
 * What the status page shows, asserted against `status()` alone: the docker
 * CLI, the box's files, the door's certificate, DNS and the disk are handed
 * in, so a test needs no daemon and no box. Each fact below is what the real
 * one answers on a box, written out.
 */

import { describe, expect, it } from "vitest";

import { status, type Io } from "../box/status.mjs";

const COMMIT = "1c3f69b0e5a3d2c1b4a5968778695a4b3c2d1e0f";
const RELEASED = "8f7e6d5c4b3a29180716253443526170819a0b1c";

/** One container as `docker inspect` writes it, the fields read here. */
function container(name: string, project: string, state = "running", revision = COMMIT) {
  return {
    Name: `/${name}`,
    State: { Status: state },
    Config: {
      Labels: {
        "com.docker.compose.project": project,
        "org.opencontainers.image.revision": revision,
      },
    },
  };
}

/** The installation and control, all running a local build of `COMMIT`. */
const CONTAINERS = [
  container("installation-door-1", "installation", "running", ""),
  container("installation-page-1", "installation"),
  container("installation-box-1", "installation"),
  container("tc49-store-1", "tc49"),
  container("tc49-broker-1", "tc49"),
];

const MANIFEST = {
  release: "2026.11.0",
  stacks: {
    installation: { commit: COMMIT, images: {} },
    control: { commit: RELEASED, images: {} },
    dccex: { commit: RELEASED, images: {} },
    "occupancy-service": { commit: RELEASED, images: {} },
  },
  stock: {},
  docker: { "ubuntu-24.04": "29.1.3", "ubuntu-24.04-arm": "29.1.3" },
};

const RECORD = [
  "2026-11-10T09:00:00Z  -  ->  2026.10.2  passed",
  "2026-11-11T09:00:00Z  2026.10.2  ->  2026.11.0  passed",
  "",
].join("\n");

/** A box with a box name that is well, on a release, with `facts` changed. */
function io(facts: Partial<Io> & { files?: Record<string, string>; containers?: object[] } = {}): Io {
  const containers = facts.containers ?? CONTAINERS;
  const files: Record<string, string> = {
    "/var/lib/rails49/deploys/installation": RECORD,
    "/var/lib/rails49/releases/2026.11.0/manifest.json": JSON.stringify(MANIFEST),
    "/var/lib/rails49/check.json": JSON.stringify({
      checked: "2026-11-12T08:00:00Z",
      succeeded: "2026-11-12T08:00:00Z",
      latest: "2026.11.0",
    }),
    ...facts.files,
  };
  return {
    docker: async (args) => {
      if (args[0] === "info") return JSON.stringify({ ServerVersion: "29.1.3", LoggingDriver: "local" });
      if (args[0] === "ps") return containers.map((_, i) => `id${i}\n`).join("");
      if (args[0] === "inspect") return JSON.stringify(containers);
      throw new Error(`docker ${args.join(" ")}`);
    },
    read: async (path) => files[path] ?? null,
    disk: async () => ({ free: 20e9, total: 64e9 }),
    address: async () => "192.168.1.20",
    certificate: async () => ({
      valid_from: "2026-11-01T00:00:00.000Z",
      valid_to: "2027-01-30T00:00:00.000Z",
      error: null,
    }),
    resolve: async () => ["192.168.1.20"],
    now: () => new Date("2026-11-12T10:00:00Z"),
    ...facts,
  };
}

const NAMED = { BOX_DOMAIN: "example.org", BOX_UIS: "control", hostname: "box" };
const PLAIN = { BOX_DOMAIN: "", BOX_UIS: "control", hostname: "box" };

describe("the stacks", () => {
  it("are the installation and one per declared label, each with its state and commit", async () => {
    const { stacks } = await status(NAMED, io({ files: { "/var/lib/rails49/deploys/installation": "" } }));
    expect(stacks).toEqual([
      { stack: "installation", state: "running", commit: COMMIT, local_build: true },
      { stack: "control", state: "running", commit: COMMIT, local_build: true },
    ]);
  });
});

describe("the release", () => {
  it("is the one the last update that passed moved the box to", async () => {
    expect((await status(NAMED, io())).release).toBe("2026.11.0");
    const failed = `${RECORD}2026-11-12T09:00:00Z  2026.11.0  ->  2026.11.1  failed\n`;
    const after = await status(NAMED, io({ files: { "/var/lib/rails49/deploys/installation": failed } }));
    expect(after.release).toBe("2026.11.0");
  });

  it("is none on a box never updated", async () => {
    const never = await status(NAMED, io({ files: { "/var/lib/rails49/deploys/installation": "" } }));
    expect(never.release).toBeNull();
  });
});

describe("a stack on a local build", () => {
  it("is one whose commit differs from the release's, named in a sentence", async () => {
    const { stacks, notes } = await status(NAMED, io());
    expect(stacks.map((s) => [s.stack, s.local_build])).toEqual([
      ["installation", false],
      ["control", true],
    ]);
    expect(notes).toEqual(["control runs a local build of `1c3f69b`, not release 2026.11.0."]);
  });

  it("is every stack on a box never updated", async () => {
    const { notes } = await status(NAMED, io({ files: { "/var/lib/rails49/deploys/installation": "" } }));
    expect(notes).toEqual([
      "installation runs a local build of `1c3f69b`.",
      "control runs a local build of `1c3f69b`.",
    ]);
  });

  it("says so when its image names no commit", async () => {
    const containers = [...CONTAINERS.slice(0, 3), container("tc49-store-1", "tc49", "running", "")];
    const { notes } = await status(NAMED, io({ containers }));
    expect(notes).toEqual(["control runs a local build with no commit named, not release 2026.11.0."]);
  });

  it("is never JMRI, which is built on the box and in no release", async () => {
    const containers = [...CONTAINERS, container("jmri-jmri-1", "jmri", "running", "")];
    const { stacks, notes } = await status({ ...NAMED, BOX_UIS: "control jmri" }, io({ containers }));
    expect(stacks.at(-1)).toEqual({ stack: "jmri", state: "running", commit: null, local_build: false });
    expect(notes).toHaveLength(1);
  });
});

describe("a stack that is not running", () => {
  it("is restarting when any of its containers is, and says so", async () => {
    const containers = [...CONTAINERS.slice(0, 4), container("tc49-broker-1", "tc49", "restarting")];
    const { stacks, failures } = await status(NAMED, io({ containers }));
    expect(stacks[1]!.state).toBe("restarting");
    expect(failures).toEqual(["control is restarting."]);
  });

  it("is stopped when a container has exited, or none is there", async () => {
    const exited = [...CONTAINERS.slice(0, 4), container("tc49-broker-1", "tc49", "exited")];
    expect((await status(NAMED, io({ containers: exited }))).failures).toEqual(["control is stopped."]);
    const missing = await status({ ...NAMED, BOX_UIS: "control dccex" }, io());
    expect(missing.stacks[2]).toEqual({ stack: "dccex", state: "stopped", commit: null, local_build: false });
    expect(missing.failures).toEqual(["dccex is stopped."]);
  });

  it("is never one the box does not declare", async () => {
    const { stacks } = await status({ ...NAMED, BOX_UIS: "" }, io());
    expect(stacks.map((s) => s.stack)).toEqual(["installation"]);
  });
});

describe("the check for a new release", () => {
  const checked = (state: object) => io({ files: { "/var/lib/rails49/check.json": JSON.stringify(state) } });

  it("offers a release newer than the one the box runs, with when it last checked", async () => {
    const { update, failures } = await status(
      NAMED,
      checked({ checked: "2026-11-12T08:00:00Z", succeeded: "2026-11-12T08:00:00Z", latest: "2026.11.1" }),
    );
    expect(update).toEqual({
      latest: "2026.11.1",
      available: true,
      newer: false,
      checked: "2026-11-12T08:00:00Z",
      succeeded: "2026-11-12T08:00:00Z",
      could_not_check: false,
    });
    expect(failures).toEqual([]);
  });

  it("offers nothing when the box runs the latest release, or there is none", async () => {
    expect((await status(NAMED, io())).update.available).toBe(false);
    const none = checked({ checked: "2026-11-12T08:00:00Z", succeeded: "2026-11-12T08:00:00Z", latest: null });
    expect((await status(NAMED, none)).update.available).toBe(false);
  });

  it("offers the latest release to a box never updated", async () => {
    const { update } = await status(NAMED, io({ files: { "/var/lib/rails49/deploys/installation": "" } }));
    expect(update).toMatchObject({ available: true, newer: false });
  });

  /** A box on release `runs` that last checked and found `latest`. */
  const on = (runs: string, latest: string) =>
    io({
      files: {
        "/var/lib/rails49/deploys/installation": `2026-11-11T09:00:00Z  -  ->  ${runs}  passed\n`,
        [`/var/lib/rails49/releases/${runs}/manifest.json`]: JSON.stringify({ ...MANIFEST, release: runs }),
        "/var/lib/rails49/check.json": JSON.stringify({
          checked: "2026-11-12T08:00:00Z",
          succeeded: "2026-11-12T08:00:00Z",
          latest,
        }),
      },
    });

  it("offers nothing to a box on a release newer than the latest, and says so", async () => {
    expect((await status(NAMED, on("2026.11.5", "2026.11.3"))).update).toMatchObject({
      latest: "2026.11.3",
      available: false,
      newer: true,
    });
  });

  it("offers the latest to a box on an older release", async () => {
    expect((await status(NAMED, on("2026.11.3", "2026.11.5"))).update).toMatchObject({
      latest: "2026.11.5",
      available: true,
      newer: false,
    });
  });

  it("compares counts as numbers, not strings", async () => {
    expect((await status(NAMED, on("2026.11.10", "2026.11.9"))).update).toMatchObject({ available: false, newer: true });
    expect((await status(NAMED, on("2026.11.9", "2026.11.10"))).update).toMatchObject({ available: true, newer: false });
    expect((await status(NAMED, on("2026.12.0", "2026.11.9"))).update).toMatchObject({ available: false, newer: true });
  });

  it("says it could not check, and when the last check succeeded", async () => {
    const { update, failures } = await status(
      NAMED,
      checked({ checked: "2026-11-12T09:00:00Z", succeeded: "2026-11-11T08:00:00Z", latest: "2026.11.0" }),
    );
    expect(update.could_not_check).toBe(true);
    expect(failures).toEqual([
      "Could not check for a new release. The last check that succeeded was at 2026-11-11 08:00 UTC.",
    ]);
  });

  it("says it could not check when none has ever succeeded", async () => {
    const { update, failures } = await status(NAMED, checked({ checked: "2026-11-12T09:00:00Z", succeeded: null, latest: null }));
    expect(update).toMatchObject({ could_not_check: true, available: false, newer: false });
    expect(failures).toEqual(["Could not check for a new release. No check has succeeded yet."]);
  });

  it("says nothing before the first check", async () => {
    const { update, failures } = await status(NAMED, io({ files: { "/var/lib/rails49/check.json": "" } }));
    expect(update).toEqual({ latest: null, available: false, newer: false, checked: null, succeeded: null, could_not_check: false });
    expect(failures).toEqual([]);
  });
});

describe("the disk", () => {
  it("is how much is free of how much", async () => {
    expect((await status(NAMED, io())).disk).toEqual({ free: 20e9, total: 64e9 });
  });

  it("is a failure under a tenth free", async () => {
    const { failures } = await status(NAMED, io({ disk: async () => ({ free: 3.2e9, total: 64e9 }) }));
    expect(failures).toEqual(["The disk has 3.2 GB free of 64.0 GB."]);
  });
});

describe("the box's address", () => {
  it("is the one it has on its LAN", async () => {
    expect((await status(PLAIN, io())).address).toBe("192.168.1.20");
  });

  it("is a failure when the box has none", async () => {
    const { address, failures } = await status(PLAIN, io({ address: async () => null }));
    expect(address).toBeNull();
    expect(failures).toEqual(["This box has no address on a network."]);
  });
});

describe("Docker", () => {
  it("is its Engine version against the ones the release was tested on, and its log driver", async () => {
    expect((await status(NAMED, io())).docker).toEqual({
      version: "29.1.3",
      tested: ["29.1.3"],
      log_driver: "local",
    });
  });

  it("is a failure on a major version the release was not tested on", async () => {
    const docker = async (args: string[]) =>
      args[0] === "info"
        ? JSON.stringify({ ServerVersion: "27.5.1", LoggingDriver: "local" })
        : io().docker(args);
    const { failures } = await status(NAMED, io({ docker }));
    expect(failures).toEqual(["Docker Engine 27.5.1 is not the major version release 2026.11.0 was tested on, 29.1.3."]);
  });

  it("is compared with nothing on a box never updated", async () => {
    const { docker } = await status(NAMED, io({ files: { "/var/lib/rails49/deploys/installation": "" } }));
    expect(docker.tested).toEqual([]);
  });

  it("says when the log driver is not local", async () => {
    const docker = async (args: string[]) =>
      args[0] === "info"
        ? JSON.stringify({ ServerVersion: "29.1.3", LoggingDriver: "json-file" })
        : io().docker(args);
    const { failures } = await status(NAMED, io({ docker }));
    expect(failures).toEqual([
      'Docker\'s log driver is json-file, not local. Set "log-driver": "local" in /etc/docker/daemon.json and restart Docker.',
    ]);
  });
});

describe("the certificate", () => {
  it("is its expiry, read from the door, on a box with a box name", async () => {
    const { certificate, failures } = await status(NAMED, io());
    expect(certificate).toEqual({ expires: "2027-01-30T00:00:00.000Z", valid: true });
    expect(failures).toEqual([]);
  });

  it("is none on a box with no certificate, which asks the door nothing", async () => {
    const certificate = async () => {
      throw new Error("asked");
    };
    expect((await status(PLAIN, io({ certificate }))).certificate).toBeNull();
  });

  it("is a failure when the door presents one that is not valid for the name", async () => {
    const certificate = async () => ({
      valid_from: "2026-11-01T00:00:00.000Z",
      valid_to: "2027-11-01T00:00:00.000Z",
      error: "Hostname/IP does not match certificate's altnames",
    });
    const status_ = await status(NAMED, io({ certificate }));
    expect(status_.certificate).toEqual({ expires: "2027-11-01T00:00:00.000Z", valid: false });
    expect(status_.failures).toEqual([
      "The certificate the door presents for example.org is not valid: Hostname/IP does not match certificate's altnames.",
    ]);
  });

  it("is a failure under a quarter of its life left, when it was not renewed at a third", async () => {
    // A 90-day certificate is renewed with 30 days left; with 20 left it was not.
    const certificate = async () => ({
      valid_from: "2026-09-03T00:00:00.000Z",
      valid_to: "2026-12-02T00:00:00.000Z",
      error: null,
    });
    const { failures } = await status(NAMED, io({ certificate }));
    expect(failures).toEqual(["The certificate for example.org expires on 2026-12-02 and has not been renewed."]);
  });

  it("is a failure when the door cannot be reached", async () => {
    const certificate = async () => {
      throw new Error("connect ECONNREFUSED 172.18.0.2:443");
    };
    const status_ = await status(NAMED, io({ certificate }));
    expect(status_.certificate).toBeNull();
    expect(status_.failures).toEqual([
      "Could not read the certificate the door presents for example.org: connect ECONNREFUSED 172.18.0.2:443.",
    ]);
  });
});

describe("the box name", () => {
  it("resolves to this box", async () => {
    expect((await status(NAMED, io())).resolves).toEqual({ addresses: ["192.168.1.20"], to_this_box: true });
  });

  it("is not asked about on a box with no certificate", async () => {
    expect((await status(PLAIN, io())).resolves).toBeNull();
  });

  it("is a failure when it resolves to another address", async () => {
    const { resolves, failures } = await status(NAMED, io({ resolve: async () => ["192.168.1.30"] }));
    expect(resolves).toEqual({ addresses: ["192.168.1.30"], to_this_box: false });
    expect(failures).toEqual(["example.org resolves to 192.168.1.30, not to this box at 192.168.1.20."]);
  });

  it("is a failure when it does not resolve", async () => {
    const resolve = async () => {
      throw Object.assign(new Error("getaddrinfo ENOTFOUND example.org"), { code: "ENOTFOUND" });
    };
    const { resolves, failures } = await status(NAMED, io({ resolve }));
    expect(resolves).toEqual({ addresses: [], to_this_box: false });
    expect(failures).toEqual(["example.org does not resolve: getaddrinfo ENOTFOUND example.org."]);
  });
});

describe("the box", () => {
  it("is named by its box name, or its hostname on a box with no certificate", async () => {
    expect((await status(NAMED, io())).name).toBe("example.org");
    expect((await status(PLAIN, io())).name).toBe("box");
  });
});

describe("updating and going back", () => {
  const PROGRESS = "/var/lib/rails49/update.json";
  const progress = (fields: object) =>
    JSON.stringify({
      action: "update",
      from: "2026.11.0",
      to: "2026.11.1",
      started: "2026-11-12T09:58:00.000Z",
      step: "Starting control.",
      finished: null,
      passed: null,
      failure: null,
      ...fields,
    });
  const UPDATER = { ...container("rails49-update", ""), Config: { Labels: {} } };

  it("is nothing on a box never updated", async () => {
    const box = await status(NAMED, io({ files: { "/var/lib/rails49/deploys/installation": "" } }));
    expect(box.updating).toBeNull();
    expect(box.back).toBeNull();
  });

  it("offers going back to the release the box ran before the last update", async () => {
    expect((await status(NAMED, io())).back).toBe("2026.10.2");
  });

  it("offers going back after an update that failed, to the release it left", async () => {
    const failed = `${RECORD}2026-11-12T09:00:00Z  2026.11.0  ->  2026.11.1  failed\n`;
    const box = await status(NAMED, io({ files: { "/var/lib/rails49/deploys/installation": failed } }));
    expect(box.back).toBe("2026.11.0");
  });

  it("offers no going back after going back, which would move the box forward", async () => {
    const back = `${RECORD}2026-11-12T09:00:00Z  2026.11.0  ->  2026.10.2  passed\n`;
    const box = await status(NAMED, io({ files: { "/var/lib/rails49/deploys/installation": back } }));
    expect(box.back).toBeNull();
  });

  it("is the step one that runs is at, while its container runs", async () => {
    const box = await status(
      NAMED,
      io({ files: { [PROGRESS]: progress({}) }, containers: [...CONTAINERS, UPDATER] }),
    );
    expect(box.updating).toMatchObject({ action: "update", to: "2026.11.1", step: "Starting control.", running: true });
    expect(box.failures).toEqual([]);
  });

  it("carries the image it pulls, and how far it has got", async () => {
    const pull = { image: "ghcr.io/rails49/control:x@sha256:1", index: 4, count: 10, current: 1.2e9, total: 2.3e9 };
    const pulling = progress({ step: "Pulling control's images.", pull });
    const box = await status(NAMED, io({ files: { [PROGRESS]: pulling }, containers: [...CONTAINERS, UPDATER] }));
    expect(box.updating).toMatchObject({ step: "Pulling control's images.", pull, running: true });
  });

  it("says in a sentence why the last one failed", async () => {
    const failure = "Could not pull control's images for release 2026.11.1: manifest unknown.";
    const finished = progress({ finished: "2026-11-12T09:59:00.000Z", passed: false, failure, step: "Failed." });
    const box = await status(NAMED, io({ files: { [PROGRESS]: finished } }));
    expect(box.updating).toMatchObject({ passed: false, running: false });
    expect(box.failures).toEqual([failure]);
  });

  it("says when one stopped before it finished", async () => {
    const stopped = { ...UPDATER, State: { Status: "exited" } };
    const box = await status(NAMED, io({ files: { [PROGRESS]: progress({}) }, containers: [...CONTAINERS, stopped] }));
    expect(box.failures).toEqual([
      "The update to 2026.11.1 stopped before it finished, at: Starting control. Its log is in the log bundle.",
    ]);
    const applying = progress({ action: "apply", from: "2026.11.0", to: "2026.11.0", step: "Stopping dccex." });
    const applied = await status(NAMED, io({ files: { [PROGRESS]: applying }, containers: [...CONTAINERS, stopped] }));
    expect(applied.failures).toEqual([
      "Applying the setup at 2026.11.0 stopped before it finished, at: Stopping dccex. Its log is in the log bundle.",
    ]);
  });
});
