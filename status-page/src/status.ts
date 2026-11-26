// What `GET /box/status` answers: the status `box` gathers and the setup
// form, together. Plain types with no imports. `box` names this type for
// what it serves, so the type-check of `box` checks the server against what
// the page reads. Times are ISO 8601 in UTC, sizes in bytes.

export interface Status {
  /** The box name, or the hostname on a box with no certificate. */
  name: string;
  /** The box's address on its LAN, or null where it has none. */
  address: string | null;
  /** The release the box runs, or null on a box never updated. */
  release: string | null;
  /** The installation and each stack `BOX_UIS` declares. */
  stacks: Stack[];
  update: Update;
  /** The update, going back or applying that ran last, or null. */
  updating: Run | null;
  /** Downloading the newest release, or null where none ran. */
  download: Download | null;
  /** The release going back returns to, or null. */
  back: string | null;
  disk: { free: number; total: number };
  /** The box's memory, or null where /proc/meminfo cannot be read. */
  memory: { used: number; total: number } | null;
  docker: Docker;
  /** What the door presents for the box name, or null on a box with no
   *  box name or where it could not be read. */
  certificate: { expires: string; valid: boolean } | null;
  /** What the box name resolves to, or null on a box with no box name. */
  resolves: { addresses: string[]; to_this_box: boolean } | null;
  /** Each failure in a sentence. */
  failures: string[];
  /** Each note in a sentence, a commit in backticks. */
  notes: string[];
  setup: Setup;
}

export interface Stack {
  /** Its name in a release's manifest, as `control` or `occupancy-service`. */
  stack: string;
  state: "running" | "restarting" | "stopped";
  commit: string | null;
  local_build: boolean;
  /** What its running containers use, or null where none says. */
  memory: number | null;
  /** What its images take unpacked, or null where the Engine does not say. */
  disk: number | null;
}

/** What the last check for a new release found. */
export interface Update {
  latest: string | null;
  /** Whether `latest` is a pre-release. */
  prerelease: boolean;
  /** Whether the check takes pre-releases. */
  prereleases: boolean;
  /** Whether the box downloads a newer release after every check. */
  download: boolean;
  /** Whether `latest` is newer than the release the box runs. */
  available: boolean;
  /** Whether the release the box runs is newer than `latest`. */
  newer: boolean;
  checked: string | null;
  succeeded: string | null;
  could_not_check: boolean;
  /** Whether `latest` is downloaded. */
  downloaded: boolean;
}

/** A step of a run. */
export type Step = "download" | "pull" | "stop" | "start" | "watch" | "probe" | "prune";

export interface Bytes {
  current: number;
  total: number;
}

/** The image being pulled, its place among the images the run pulls, and
 *  its bytes. `run` is the bytes of every image the run pulls, or null where
 *  the manifest lists no layers. */
export interface Pull {
  image: string;
  index: number;
  count: number;
  current: number;
  total: number;
  run?: Bytes | null;
}

/** An update, going back or applying the setup. `steps`, `at`, `since`,
 *  `pull` and `building` are missing from the file `box` writes as it starts
 *  one. `at` is null once it has passed. */
export interface Run {
  action: "update" | "back" | "apply";
  from: string;
  to: string;
  started: string;
  steps?: Step[];
  at?: Step | null;
  /** When the step it is at began. */
  since?: string;
  /** The step it is at, in a sentence. */
  step: string;
  pull?: Pull | null;
  /** Whether JMRI is being built. */
  building?: boolean;
  finished: string | null;
  passed: boolean | null;
  failure: string | null;
  /** Whether its container runs. */
  running: boolean;
}

/** Downloading a release. `disk` says why it was refused or stopped for
 *  want of room, or is null. */
export interface Download {
  release: string;
  started: string;
  finished: string | null;
  downloaded: boolean;
  failure: string | null;
  disk: { needs: number; free: number } | { keeps: number; free: number } | null;
  bytes: Bytes | null;
  /** Whether it runs, or `box` is starting it. */
  running: boolean;
}

export interface Docker {
  version: string;
  /** The Engine versions the release was tested on. */
  tested: string[];
  log_driver: string;
}

/** The setup form. */
export interface Setup {
  /** The labels `BOX_UIS` declares. */
  uis: string[];
  /** Each stack a box can run, beside the label its checkbox posts. */
  stacks: { stack: string; label: string }[];
  devices: Device[];
}

/** A device the form offers: its field, what it is, the path that names no
 *  device, the one chosen or null, and the ones plugged in. */
export interface Device {
  field: string;
  what: string;
  none: string;
  current: string | null;
  found: string[];
}
