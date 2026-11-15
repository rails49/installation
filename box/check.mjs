// The check for a new release (#65 decision 4): GitHub's latest release of
// the installation, which is never a pre-release. On a box whose `box.env`
// sets `BOX_PRERELEASES=yes`, the newest release by number instead,
// pre-releases included (#105). What a check found is kept in `CHECK`, which the status
// page reads; a check that fails keeps when the last one succeeded.

import { message, older } from "./status.mjs";

export const LATEST = "https://api.github.com/repos/rails49/installation/releases/latest";
/** Every release, pre-releases included, up to 100. */
export const RELEASES = "https://api.github.com/repos/rails49/installation/releases?per_page=100";

/**
 * @typedef {{ checked: string | null, succeeded: string | null, latest: string | null, prerelease: boolean }} State
 *
 * @typedef {{
 *   fetch: (url: string, init?: RequestInit) => Promise<Response>,
 *   read: () => Promise<string | null>,
 *   write: (text: string) => Promise<void>,
 *   now: () => Date,
 *   prereleases: () => Promise<boolean>,
 * }} Io
 *
 * `read` and `write` are the state file's text. `prereleases` is whether
 * `box.env` sets `BOX_PRERELEASES=yes` now.
 */

/** @typedef {{ tag_name: string, prerelease: boolean, draft: boolean }} Release */

/** @param {Io} io */
export async function check(io) {
  const before = await saved(io);
  const now = io.now().toISOString();
  const prereleases = await io.prereleases();
  /** @type {State} */
  let after;
  try {
    const answer = await io.fetch(prereleases ? RELEASES : LATEST, {
      headers: { accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(15_000),
    });
    // 404 is a repository with no full release yet.
    if (answer.status !== 404 && !answer.ok) throw new Error(`GitHub answered ${answer.status}`);
    /** @type {Release | undefined} */
    const found = answer.status === 404 ? undefined : prereleases ? newest(await answer.json()) : await answer.json();
    after = { checked: now, succeeded: now, latest: found?.tag_name ?? null, prerelease: found?.prerelease ?? false };
  } catch (error) {
    console.error(`checking for a new release: ${message(error)}`);
    after = { ...before, checked: now };
  }
  await io.write(`${JSON.stringify(after)}\n`);
}

/** The newest of GitHub's releases by number, drafts left out.
 *  @param {Release[]} releases */
function newest(releases) {
  return releases.filter((release) => !release.draft).sort((a, b) => (older(a.tag_name, b.tag_name) ? 1 : -1))[0];
}

/** Whether no check has succeeded since the last 2:00 on the box's clock
 *  (#144). A box that missed 2:00, off or offline, is due at once.
 *  @param {Io} io */
export async function due(io) {
  const { succeeded } = await saved(io);
  const now = io.now();
  const two = new Date(now);
  two.setHours(2, 0, 0, 0);
  if (two > now) two.setDate(two.getDate() - 1);
  return succeeded === null || Date.parse(succeeded) < two.getTime();
}

/** @param {Io} io
 *  @returns {Promise<State>} */
async function saved(io) {
  const text = await io.read();
  return text ? JSON.parse(text) : { checked: null, succeeded: null, latest: null, prerelease: false };
}
