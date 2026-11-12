// The check for a new release (#65 decision 4): GitHub's latest release of
// the installation, which is never a pre-release. What a check found is kept in `CHECK`, which the status
// page reads; a check that fails keeps when the last one succeeded.

import { message } from "./status.mjs";

export const LATEST = "https://api.github.com/repos/rails49/installation/releases/latest";

const DAY = 24 * 60 * 60 * 1000;

/**
 * @typedef {{ checked: string | null, succeeded: string | null, latest: string | null }} State
 *
 * @typedef {{
 *   fetch: (url: string, init?: RequestInit) => Promise<Response>,
 *   read: () => Promise<string | null>,
 *   write: (text: string) => Promise<void>,
 *   now: () => Date,
 * }} Io
 *
 * `read` and `write` are the state file's text.
 */

/** @param {Io} io */
export async function check(io) {
  const before = await saved(io);
  const now = io.now().toISOString();
  /** @type {State} */
  let after;
  try {
    const answer = await io.fetch(LATEST, {
      headers: { accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(15_000),
    });
    // 404 is a repository with no full release yet.
    if (answer.status !== 404 && !answer.ok) throw new Error(`GitHub answered ${answer.status}`);
    const latest = answer.status === 404 ? null : /** @type {{ tag_name: string }} */ (await answer.json()).tag_name;
    after = { checked: now, succeeded: now, latest };
  } catch (error) {
    console.error(`checking for a new release: ${message(error)}`);
    after = { ...before, checked: now };
  }
  await io.write(`${JSON.stringify(after)}\n`);
}

/** Whether a day has passed since the last check that succeeded.
 *  @param {Io} io */
export async function due(io) {
  const { succeeded } = await saved(io);
  return succeeded === null || io.now().getTime() - Date.parse(succeeded) >= DAY;
}

/** @param {Io} io
 *  @returns {Promise<State>} */
async function saved(io) {
  const text = await io.read();
  return text ? JSON.parse(text) : { checked: null, succeeded: null, latest: null };
}
