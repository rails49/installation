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

/** Each stack the box can run: the label in `BOX_UIS` that declares it, its
 *  name in a release's manifest, and its compose project. The installation
 *  always runs. In the order the stacks are brought up (decision 8). */
export const STACKS = [
  { label: null, stack: "installation", project: "installation" },
  { label: "control", stack: "control", project: "tc49" },
  { label: "dccex", stack: "dccex", project: "dccex" },
  { label: "jmri", stack: "jmri", project: "jmri" },
  { label: "occupancy", stack: "occupancy-service", project: "occupancy" },
];

export const RECORD = "/var/lib/rails49/deploys/installation";
export const CHECK = "/var/lib/rails49/check.json";

/** @param {string} release */
export const manifestPath = (release) => `/var/lib/rails49/releases/${release}/manifest.json`;

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

  const ids = (await io.docker(["ps", "-aq"])).split("\n").filter(Boolean);
  /** @type {{ Name: string, State: { Status: string }, Config: { Labels: Record<string, string> | null } }[]} */
  const containers = ids.length ? JSON.parse(await io.docker(["inspect", ...ids])) : [];
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

  /** @type {{ checked?: string | null, succeeded?: string | null, latest?: string | null }} */
  const check = parse(await io.read(CHECK)) ?? {};
  const succeeded = check.succeeded ?? null;
  const could_not_check = Boolean(check.checked) && check.checked !== succeeded;
  const update = {
    latest: check.latest ?? null,
    available: Boolean(check.latest) && check.latest !== release,
    checked: check.checked ?? null,
    succeeded,
    could_not_check,
  };
  if (could_not_check) {
    failures.push(
      `Could not check for a new release. ${succeeded ? `The last check that succeeded was at ${when(succeeded)}.` : "No check has succeeded yet."}`,
    );
  }

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
      // The door renews with a third of the certificate's life left.
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
    disk,
    docker,
    certificate,
    resolves,
    failures,
    notes,
  };
}

/** @param {unknown} error */
function message(error) {
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
