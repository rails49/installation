// What the status page shows (#65 decision 16), gathered from the docker CLI,
// the box's files under /var/lib/rails49, the disk, the door's certificate
// and DNS. Each of those is handed in as `io`, so this reads nothing itself.
// A failure is said in a sentence in `failures`, and a stack on a local build
// in `notes` (decision 13).

/**
 * @typedef {{
 *   docker: (args: string[]) => Promise<string>,
 *   read: (path: string) => Promise<string | null>,
 *   disk: () => Promise<{ free: number, total: number }>,
 *   address: () => Promise<string | null>,
 *   certificate: (name: string) => Promise<{ valid_from: string, valid_to: string, error: string | null }>,
 *   resolve: (name: string) => Promise<string[]>,
 *   now: () => Date,
 * }} Io
 *
 * `docker` is the CLI's stdout. `read` is a file's text, or null where there
 * is none. `address` is the box's address on its LAN. `certificate` is what
 * the door presents for a name, with `error` saying why it is not valid.
 * `resolve` is the addresses a name resolves to, and throws where it does not.
 */

/**
 * @typedef {{ BOX_DOMAIN: string, BOX_UIS: string, hostname: string }} Env
 */

/**
 * One container as `docker inspect` writes it, the fields read here and in
 * the update.
 *
 * @typedef {{ Name: string, Image: string, State: { Status: string, StartedAt: string }, Config: { Labels: Record<string, string> | null } }} Container
 */

/** Each stack the box can run: the label in `BOX_UIS` that declares it, its
 *  name in a release's manifest, its compose project, its compose files in
 *  the release's box files, the one more it is started with on a box with a
 *  box name, and its settings beside `box.env` (decision 14).
 *  The installation always runs. In the order the stacks are brought up
 *  (decision 8). JMRI is the installation's, and reads control's settings.
 *
 *  `https` holds the routers that need a box name: on `websecure`, with the
 *  `le` resolver, or with `BOX_DOMAIN` in a rule. A box with no certificate
 *  has neither, and the door logs an error for each such router at every
 *  start (#92).
 *
 *  @type {{ label: string | null, stack: string, project: string, files: string[], https: string | null, env: string | null }[]} */
export const STACKS = [
  {
    label: null,
    stack: "installation",
    project: "installation",
    files: ["installation/compose.yaml"],
    https: "installation/compose.https.yaml",
    env: null,
  },
  {
    label: "control",
    stack: "control",
    project: "tc49",
    files: ["control/compose.yaml"],
    https: "control/compose.https.yaml",
    env: "control.env",
  },
  {
    label: "dccex",
    stack: "dccex",
    project: "dccex",
    files: ["dccex/compose.yaml", "dccex/compose.box.yaml"],
    https: "dccex/compose.https.yaml",
    env: "dccex.env",
  },
  {
    label: "jmri",
    stack: "jmri",
    project: "jmri",
    files: ["installation/jmri/compose.yaml"],
    https: "installation/jmri/compose.https.yaml",
    env: "control.env",
  },
  {
    label: "occupancy",
    stack: "occupancy-service",
    project: "occupancy",
    files: ["occupancy-service/compose.yaml"],
    https: "occupancy-service/compose.https.yaml",
    env: "occupancy.env",
  },
];

export const BOX = "/etc/rails49/box.env";
export const DEPLOYS = "/var/lib/rails49/deploys";
export const RECORD = `${DEPLOYS}/installation`;
export const CHECK = "/var/lib/rails49/check.json";
export const RELEASES = "/var/lib/rails49/releases";
/** What the update or going back that ran last is doing, or did. */
export const PROGRESS = "/var/lib/rails49/update.json";

/** @param {string} release */
export const manifestPath = (release) => `${RELEASES}/${release}/manifest.json`;

/** The stacks `BOX_UIS` declares, the installation first.
 *  @param {string} uis */
export function declared(uis) {
  const labels = uis.split(/\s+/);
  return STACKS.filter(({ label }) => label === null || labels.includes(label));
}

/**
 * The release the box runs: the one the last update or going back that
 * passed moved it to, from the record (decision 11). Null on a box never
 * updated.
 *
 * @param {(path: string) => Promise<string | null>} read
 */
export async function currentRelease(read) {
  const record = (await read(RECORD)) ?? "";
  const passed = [...record.matchAll(/->\s+(\S+)\s+passed\s*$/gm)];
  return passed.at(-1)?.[1] ?? null;
}

/**
 * The release going back returns to: the one the box ran before the last
 * line of the record. Null on a box never updated, and after a line that
 * passed and moved the box to the same release or an older one, which was
 * going back: there is one step back.
 *
 * @param {(path: string) => Promise<string | null>} read
 */
export async function backTo(read) {
  const record = (await read(RECORD)) ?? "";
  const last = [...record.matchAll(/^\S+\s+(\S+)\s+->\s+(\S+)\s+(passed|failed)\s*$/gm)].at(-1);
  if (!last) return null;
  const [, from = "-", to = "-", result] = last;
  if (from === "-" || (result === "passed" && !older(from, to))) return null;
  return from;
}

/**
 * Whether `box.env` sets `BOX_PRERELEASES=yes`, with which the check takes
 * the newest release, pre-releases included (#105).
 *
 * @param {(path: string) => Promise<string | null>} read
 */
export async function prereleases(read) {
  return setting((await read(BOX)) ?? "", "BOX_PRERELEASES") === "yes";
}

/**
 * The value the env file's text sets `key` to, without its quotes, or null
 * where it sets none.
 *
 * @param {string} text @param {string} key
 */
export function setting(text, key) {
  const value = text.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim();
  return value === undefined ? null : value.replace(/^(["'])(.*)\1$/, "$2");
}

/** Whether release `a` is older than release `b`, by year, month and count.
 *  @param {string} a @param {string} b */
export function older(a, b) {
  const [x, y] = [a, b].map((release) => release.split(".").map(Number));
  const i = x.findIndex((part, j) => part !== y[j]);
  return i !== -1 && x[i] < y[i];
}

/**
 * Every container on the box, as `docker inspect` writes it. One that goes
 * between `docker ps` and `docker inspect`, as when an update recreates the
 * stacks, is left out: the CLI then says "no such object" for it, writes
 * nothing for the rest and exits 1, so the ones still there are inspected
 * again. Any other failure throws (#97).
 *
 * @param {(args: string[]) => Promise<string>} docker
 * @returns {Promise<Container[]>}
 */
export async function inspected(docker) {
  let ids = (await docker(["ps", "-aq"])).split("\n").filter(Boolean);
  while (ids.length) {
    try {
      return JSON.parse(await docker(["inspect", ...ids]));
    } catch (error) {
      const lines = message(error).split("\n").filter((line) => line.trim());
      const gone = lines.map((line) => line.match(/no such object:\s*(\S+)/i)?.[1]);
      const left = ids.filter((id) => !gone.includes(id));
      if (!lines.length || gone.some((id) => id === undefined) || left.length === ids.length) throw error;
      ids = left;
    }
  }
  return [];
}

/**
 * @param {Env} env
 * @param {Io} io
 */
export async function status(env, io) {
  /** @type {string[]} */
  const failures = [];
  /** @type {string[]} */
  const notes = [];

  const release = await currentRelease(io.read);
  const manifest = release === null ? null : parse(await io.read(manifestPath(release)));

  const containers = await inspected(io.docker);
  containers.sort((a, b) => a.Name.localeCompare(b.Name));

  const stacks = declared(env.BOX_UIS).map(({ stack, project }) => {
    const own = containers.filter((c) => c.Config.Labels?.["com.docker.compose.project"] === project);
    const states = own.map((c) => c.State.Status);
    const state = states.includes("restarting")
      ? "restarting"
      : states.length && states.every((s) => s === "running")
        ? "running"
        : "stopped";
    if (state !== "running") failures.push(`${stack} is ${state}.`);
    const commit =
      own.map((c) => c.Config.Labels?.["org.opencontainers.image.revision"]).find(Boolean) ?? null;
    // JMRI is built on the box from a stock image and is in no release.
    const local_build = stack !== "jmri" && own.length > 0 && commit !== manifest?.stacks?.[stack]?.commit;
    if (local_build) {
      const of = commit ? `of \`${commit.slice(0, 7)}\`` : "with no commit named";
      notes.push(`${stack} runs a local build ${of}${release ? `, not release ${release}` : ""}.`);
    }
    return { stack, state, commit, local_build };
  });

  /** @type {{ checked?: string | null, succeeded?: string | null, latest?: string | null, prerelease?: boolean }} */
  const check = parse(await io.read(CHECK)) ?? {};
  const succeeded = check.succeeded ?? null;
  const could_not_check = Boolean(check.checked) && check.checked !== succeeded;
  const latest = check.latest ?? null;
  // A box on no release yet is offered the latest; a box on a pre-release
  // newer than the latest full release is offered nothing (#88).
  const update = {
    latest,
    prerelease: check.prerelease ?? false,
    prereleases: await prereleases(io.read),
    available: latest !== null && (release === null || older(release, latest)),
    newer: latest !== null && release !== null && older(latest, release),
    checked: check.checked ?? null,
    succeeded,
    could_not_check,
  };
  if (could_not_check) {
    failures.push(
      `Could not check for a new release. ${succeeded ? `The last check that succeeded was at ${when(succeeded)}.` : "No check has succeeded yet."}`,
    );
  }

  // The update, going back or applying that ran last, from its progress
  // file, and whether its container runs.
  // `pull` is null outside a pull, and missing from a file an older
  // release's `rails49-update` wrote.
  /** @type {{ action: "update" | "back" | "apply", from: string, to: string, started: string, step: string, pull?: import("./update.mjs").Pull | null, finished: string | null, passed: boolean | null, failure: string | null } | null} */
  const progress = parse(await io.read(PROGRESS));
  const updater = containers.find((c) => c.Name === "/rails49-update");
  const updating = progress && { ...progress, running: updater?.State.Status === "running" };
  if (updating && !updating.running) {
    if (updating.finished === null) {
      failures.push(
        `${named(updating.action, updating.to).stopped} stopped before it finished, at: ${updating.step} Its log is in the log bundle.`,
      );
    } else if (updating.failure) {
      failures.push(updating.failure);
    }
  }
  const back = await backTo(io.read);

  const disk = await io.disk();
  if (disk.free < disk.total / 10) failures.push(`The disk has ${gb(disk.free)} free of ${gb(disk.total)}.`);

  const address = await io.address();
  if (address === null) failures.push("This box has no address on a network.");

  const info = JSON.parse(await io.docker(["info", "--format", "{{json .}}"]));
  /** @type {string[]} */
  const tested = [...new Set(Object.values(manifest?.docker ?? {}).map(String))];
  const major = (/** @type {string} */ version) => version.split(".")[0];
  if (tested.length && !tested.some((t) => major(t) === major(info.ServerVersion))) {
    failures.push(
      `Docker Engine ${info.ServerVersion} is not the major version release ${release} was tested on, ${tested.join(", ")}.`,
    );
  }
  if (info.LoggingDriver !== "local") {
    failures.push(
      `Docker's log driver is ${info.LoggingDriver}, not local. Set "log-driver": "local" in /etc/docker/daemon.json and restart Docker.`,
    );
  }
  const docker = { version: info.ServerVersion, tested, log_driver: info.LoggingDriver };

  const name = env.BOX_DOMAIN;
  /** @type {{ expires: string, valid: boolean } | null} */
  let certificate = null;
  /** @type {{ addresses: string[], to_this_box: boolean } | null} */
  let resolves = null;
  if (name) {
    try {
      const presented = await io.certificate(name);
      certificate = { expires: presented.valid_to, valid: presented.error === null };
      const end = Date.parse(presented.valid_to);
      // The door renews with a third of the certificate's life left. Under a
      // quarter left, it has not.
      const life = end - Date.parse(presented.valid_from);
      if (presented.error !== null) {
        failures.push(`The certificate the door presents for ${name} is not valid: ${presented.error}.`);
      } else if (end - io.now().getTime() < life / 4) {
        failures.push(`The certificate for ${name} expires on ${presented.valid_to.slice(0, 10)} and has not been renewed.`);
      }
    } catch (error) {
      failures.push(`Could not read the certificate the door presents for ${name}: ${message(error)}.`);
    }

    try {
      const addresses = await io.resolve(name);
      resolves = { addresses, to_this_box: address !== null && addresses.includes(address) };
      if (address !== null && !resolves.to_this_box) {
        failures.push(`${name} resolves to ${addresses.join(", ")}, not to this box at ${address}.`);
      }
    } catch (error) {
      resolves = { addresses: [], to_this_box: false };
      failures.push(`${name} does not resolve: ${message(error)}.`);
    }
  }

  return {
    name: env.BOX_DOMAIN || env.hostname,
    address,
    release,
    stacks,
    update,
    updating,
    back,
    disk,
    docker,
    certificate,
    resolves,
    failures,
    notes,
  };
}

/** How a sentence names each action, and its end.
 *  @param {"update" | "back" | "apply"} action @param {string} to */
export function named(action, to) {
  return {
    update: { stopped: `The update to ${to}`, after: "the update" },
    back: { stopped: `The going back to ${to}`, after: "going back" },
    apply: { stopped: `Applying the setup at ${to}`, after: "applying the setup" },
  }[action];
}

/** @param {unknown} error */
export function message(error) {
  return error instanceof Error ? error.message : String(error);
}

/** A time as the page says it. @param {string} iso */
export function when(iso) {
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

/** @param {number} bytes */
export function gb(bytes) {
  return `${(bytes / 1e9).toFixed(1)} GB`;
}

/** A JSON file's content, or null where there is none or it is empty.
 *  @param {string | null} text */
function parse(text) {
  return text ? JSON.parse(text) : null;
}
