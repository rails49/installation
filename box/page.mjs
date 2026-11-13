// The status page at `/box/`, rendered from the status `GET /box/status`
// answers (#65 decision 16), with updating and going back on a press
// (decisions 2, 10 and 13), and the setup: the stacks the box runs and their
// devices (#69 decisions 9 to 15). It loads look's stylesheet and bundle, its
// own stylesheet and the script that ticks control from under `/box`. A
// toggle beside "Check for update" has the check take pre-releases (#105).
//
// The failures come first. Then two parts of bordered groups: the release
// and the setup, and the status (#111).

import { gb, STACKS, when } from "./status.mjs";

/** @typedef {Awaited<ReturnType<typeof import("./status.mjs").status>> & { setup: Awaited<ReturnType<typeof import("./setup.mjs").form>> }} Status */

/** What the page says before a press that brings the stacks up, while a
 *  declared stack runs: the images are pulled first, with the railroad
 *  running (#96). The installation is left out, since it runs whenever the
 *  page is served and is no railroad. */
const KEEPS = "<p>The railroad keeps running while the new images download. It stops while its stacks restart.</p>";

/** Each stack by the name the page gives it, in the order the page lists
 *  them. */
const NAMES = new Map([
  ["installation", "Installation"],
  ["control", "Control"],
  ["occupancy-service", "Occupancy"],
  ["jmri", "JMRI"],
  ["dccex", "DCC-EX translator"],
]);
const ORDER = [...NAMES.keys()];

/** What the step list calls each step of a run. */
const STEPS = {
  download: "Download release",
  pull: "Pull images",
  stop: "Stop stacks no longer chosen",
  start: "Start stacks",
  watch: "Watch for 60 seconds",
  probe: "Probe",
  prune: "Remove unused images",
};

/**
 * @param {Status} status
 * @param {Date} [now] what the 60 seconds are counted down to
 * @returns {string}
 */
export function render(status, now = new Date()) {
  const { update, docker, certificate, resolves } = status;
  const railroad = status.stacks.some(({ stack, state }) => stack !== "installation" && state !== "stopped");
  const failures = status.failures.length
    ? `<fieldset class="group failures">\n<legend>Errors</legend>\n<ul>\n${status.failures.map(sentence).join("\n")}\n</ul>\n</fieldset>`
    : '<p><span class="dot ok"></span>No errors.</p>';
  const notes = status.notes.length
    ? `\n<fieldset class="group">\n<legend>Notes</legend>\n<ul>\n${status.notes.map(sentence).join("\n")}\n</ul>\n</fieldset>`
    : "";

  const stacks = status.stacks
    .toSorted((a, b) => ORDER.indexOf(a.stack) - ORDER.indexOf(b.stack))
    .map(({ stack, state, commit, memory }) => {
      const dot = state === "running" ? "ok" : state === "stopped" ? "off" : "bad";
      return `<tr><td><span class="dot ${dot}"></span>${escape(NAMES.get(stack) ?? stack)}</td><td>${escape(state)}</td><td class="number">${memory === null ? "" : mb(memory)}</td><td>${commit ? escape(commit.slice(0, 7)) : "n/a"}</td></tr>`;
    })
    .join("\n");

  // While one runs the page says what it is doing and reloads itself; the
  // door and `box` are recreated on the way, so a reload may find neither.
  const running = status.updating?.running ? status.updating : null;
  const tested = docker.tested.length ? `, release tested on ${docker.tested.map(escape).join(" and ")}` : "";

  // Only a box with a box name has a certificate and a name to resolve.
  const named = resolves
    ? `
<dt>Certificate</dt>
<dd>${certificate ? `${certificate.valid ? "" : "not valid, "}expires ${certificate.expires.slice(0, 10)}` : "could not be read"}</dd>
<dt>Box name</dt>
<dd>${escape(status.name)} resolves to ${resolves.to_this_box ? "this box" : escape(resolves.addresses.join(", ") || "nothing")}</dd>`
    : "";
  const memory = status.memory
    ? `\n<dt>Memory</dt>\n<dd>${mb(status.memory.used)} used of ${mb(status.memory.total)}</dd>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">${running ? '\n<meta http-equiv="refresh" content="5">' : ""}
<title>Server (box) status &amp; updates: ${escape(status.name)}</title>
<link rel="stylesheet" href="/box/look/look.css">
<script type="module" src="/box/look/look.bundle.js"></script>
<script type="module" src="/box/tick.js"></script>
<link rel="stylesheet" href="/box/page.css">
</head>
<body>
<look-shell>
<look-band ui="status" help="https://github.com/rails49/installation#the-status-page"><look-about name="${escape(status.name)}"></look-about></look-band>
<main>
${failures}${notes}
<h2>Release and setup</h2>
<fieldset class="group">
<legend>Release</legend>
${running ? progress(running, now) : release(status, railroad)}
</fieldset>${running ? "" : `\n${setup(status.setup)}`}
<h2>Status</h2>
<fieldset class="group">
<legend>Stacks</legend>
<table>
<thead><tr><th>Stack</th><th>State</th><th class="number">Memory</th><th>Commit</th></tr></thead>
<tbody>
${stacks}
</tbody>
</table>
</fieldset>
<fieldset class="group">
<legend>Box</legend>
<dl>
<dt>Disk free</dt>
<dd>${gb(status.disk.free)} of ${gb(status.disk.total)}</dd>${memory}
<dt>IP address</dt>
<dd>${status.address ? `${escape(status.address)}. Reserve this address for the box in your router.` : "none"}</dd>${named}
</dl>
</fieldset>
<fieldset class="group">
<legend>Docker</legend>
<dl>
<dt>Docker Engine</dt>
<dd>${escape(docker.version)}${tested}</dd>
<dt>Log driver</dt>
<dd>${escape(docker.log_driver)}</dd>
</dl>
</fieldset>
<p><a href="/box/bundle" download>Download the log bundle</a></p>
</main>
</look-shell>
</body>
</html>
`;
}

/**
 * The release group while nothing runs: the release the box runs, what the
 * last check found with the update to it, going back, the railroad, and the
 * check. Each button sits on its sentence's row.
 *
 * @param {Status} status
 * @param {boolean} railroad whether a declared stack runs
 */
function release({ release, update, back }, railroad) {
  /** @param {string} said @param {string[]} [forms] */
  const row = (said, forms = []) => `<div class="row">${said ? `<p>${said}</p>` : ""}${forms.join("")}</div>`;
  const runs = release ? `This box runs release ${escape(release)}.` : "This box runs no release yet.";
  const checked = update.checked !== null && !update.could_not_check;
  const latest = update.available
    ? `${update.prerelease ? "Pre-release" : "Release"} ${escape(update.latest ?? "")} is out.`
    : !checked
      ? ""
      : update.newer
        ? `It is newer than the latest release, ${escape(update.latest ?? "")}.`
        : update.latest
          ? "It is the latest release."
          : "No release is out yet.";
  const offer = update.available && update.latest
    ? [`<form method="post" action="/box/update"><button>Update to ${update.prerelease ? "pre-release " : ""}${escape(update.latest)}</button></form>`]
    : [];
  const check = update.could_not_check
    ? `Could not check. ${update.succeeded ? `The last check that succeeded was at ${when(update.succeeded)}.` : "No check has succeeded yet."}`
    : update.checked === null
      ? "Not checked yet."
      : `Checked at ${when(update.checked)}.`;
  return [
    row(runs),
    ...(latest ? [row(latest, offer)] : []),
    ...(back ? [row("", [`<form method="post" action="/box/back"><button>Revert to ${escape(back)}</button></form>`])] : []),
    ...(railroad && (offer.length || back) ? [KEEPS] : []),
    row(check, [
      '<form method="post" action="/box/check"><button>Check for update</button></form>',
      prereleases(update.prereleases),
    ]),
  ].join("\n");
}

/**
 * The release group while an update, going back or applying runs: the steps
 * it takes, those done ticked and the current one with a spinner. While it
 * pulls, a bar of the images done of all of them, and the image with its
 * bytes; while it watches, the seconds left. A file an older release wrote
 * lists no steps, and the page says the step in a sentence.
 *
 * @param {NonNullable<Status["updating"]>} running
 * @param {Date} now
 */
function progress(running, now) {
  const { steps, at, since, pull, building } = running;
  if (!steps?.length) return `<p class="updating">${doing(running)}: ${step(running)}</p>`;
  const current = at ? steps.indexOf(at) : steps.length;
  const items = steps.map((id, i) => {
    const name = STEPS[id] ?? id;
    if (i < current) return `<li class="done">${name}</li>`;
    if (i > current) return `<li>${name}</li>`;
    if (id === "watch" && since) {
      const left = Math.max(0, Math.ceil(60 - (now.getTime() - Date.parse(since)) / 1000));
      return `<li class="current">Watching for 60 seconds: ${left} left</li>`;
    }
    if (id === "pull" && building) return '<li class="current">Building JMRI</li>';
    if (id === "pull" && pull) {
      const done = pull.index - 1;
      const image = repository(pull).replace(/^.*\//, "");
      return `<li class="current">${name} <progress value="${done}" max="${pull.count}">${done} of ${pull.count}</progress> ${escape(image)}${bytes(pull)}</li>`;
    }
    return `<li class="current">${name}</li>`;
  });
  return `<p>${doing(running)}</p>\n<ol class="steps">\n${items.join("\n")}\n</ol>`;
}

/** @param {NonNullable<Status["updating"]>} running */
function doing({ action, to }) {
  return action === "apply" ? "Applying the setup" : `${action === "update" ? "Updating" : "Going back"} to ${escape(to)}`;
}

/** The step, and while an image is pulled, which, of how many, and its
 *  bytes as far as they are known.
 *  @param {NonNullable<Status["updating"]>} running */
function step({ step, pull }) {
  if (!pull) return escape(step);
  return `${escape(step.replace(/\.$/, ""))}: ${escape(repository(pull))}, image ${pull.index} of ${pull.count}${bytes(pull)}.`;
}

/** The image pulled, without its tag and digest.
 *  @param {import("./update.mjs").Pull} pull */
function repository({ image }) {
  return image.replace(/@.*$/, "").replace(/:[^/:]*$/, "");
}

/** The bytes pulled of the image's total, once the stream has said any.
 *  @param {import("./update.mjs").Pull} pull */
function bytes({ current, total }) {
  return total ? `, ${size(current)} of ${size(total)}` : "";
}

/**
 * The form that chooses the stacks and their devices, and applies them.
 * Apply sits in the devices group, the last of the form.
 *
 * @param {Status["setup"]} setup
 */
function setup({ uis, devices }) {
  const checkboxes = ORDER.flatMap((name) => {
    const label = STACKS.find(({ stack }) => stack === name)?.label;
    if (!label) return [];
    return [
      `<label><input type="checkbox" name="ui" value="${label}"${uis.includes(label) ? " checked" : ""}> ${NAMES.get(name)}</label>`,
    ];
  });
  const selects = devices.map(({ field, what, none, current, found }) => {
    const chosen = current ?? none;
    /** @param {string} value @param {string} text */
    const option = (value, text) =>
      `<option value="${escape(value)}"${value === chosen ? " selected" : ""}>${escape(text)}</option>`;
    const name = (/** @type {string} */ path) => path.slice(path.lastIndexOf("/") + 1);
    const options = [
      option(none, "none"),
      ...found.map((path) => option(path, name(path))),
      ...(current !== null && current !== none && !found.includes(current)
        ? [option(current, `${name(current)}, not plugged in`)]
        : []),
    ];
    const label = what[0]?.toUpperCase() + what.slice(1);
    return [
      `<label class="row">${label} <select name="${field}">\n${options.join("\n")}\n</select></label>`,
      ...(found.length ? [] : [`<p>No ${what} is plugged in.</p>`]),
    ].join("\n");
  });
  return `<form method="post" action="/box/setup" class="setup">
<fieldset class="group">
<legend>Stacks to run</legend>
${checkboxes.join("\n")}
<p>Occupancy and DCC-EX translator use the broker installed with Control.</p>
</fieldset>
<fieldset class="group">
<legend>Devices</legend>
${selects.join("\n")}
<div class="row"><button>Apply</button></div>
</fieldset>
</form>`;
}

/** The toggle that has the check take pre-releases or not, showing which.
 *  @param {boolean} on */
function prereleases(on) {
  return `<form method="post" action="/box/prereleases"><button name="prereleases" value="${on ? "no" : "yes"}" aria-pressed="${on}">Pre-releases: ${on ? "on" : "off"}</button></form>`;
}

/** Bytes as the page says them while an image is pulled: in gigabytes from
 *  one, and in megabytes under it.
 *  @param {number} bytes */
function size(bytes) {
  return bytes >= 1e9 ? gb(bytes) : `${Math.round(bytes / 1e6)} MB`;
}

/** Memory as the page says it: in whole megabytes of 2^20 bytes.
 *  @param {number} bytes */
function mb(bytes) {
  return `${Math.round(bytes / 2 ** 20).toLocaleString("en-US")} MB`;
}

/** A sentence as a list item, with a commit in backticks set as code.
 *  @param {string} text */
function sentence(text) {
  return `<li>${escape(text).replace(/`([^`]+)`/g, "<code>$1</code>")}</li>`;
}

/** @param {string} value */
function escape(value) {
  return value.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}
