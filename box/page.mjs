// The status page at `/box/`, rendered from the status `GET /box/status`
// answers (#65 decision 16), with updating and going back on a press
// (decisions 2, 10 and 13), and the setup: the stacks the box runs and their
// devices (#69 decisions 9 to 15). It loads look's stylesheet and bundle, its
// own stylesheet and the script that ticks control from under `/box`. A
// toggle beside "Check now" has the check take pre-releases (#105).

import { LABELS } from "./setup.mjs";
import { gb, when } from "./status.mjs";

/** @typedef {Awaited<ReturnType<typeof import("./status.mjs").status>> & { setup: Awaited<ReturnType<typeof import("./setup.mjs").form>> }} Status */

/** What the page says before a press that brings the stacks up, while a
 *  declared stack runs: the images are pulled first, with the railroad
 *  running (#96). The installation is left out, since it runs whenever the
 *  page is served and is no railroad. */
const KEEPS = "<p>The railroad keeps running while images download. It stops for about a minute while the stacks start.</p>";


/**
 * @param {Status} status
 * @returns {string}
 */
export function render(status) {
  const { update, docker, certificate, resolves } = status;
  const railroad = status.stacks.some(({ stack, state }) => stack !== "installation" && state !== "stopped");
  const failures = status.failures.length
    ? `<ul class="failures">\n${status.failures.map(sentence).join("\n")}\n</ul>`
    : "<p>Nothing is wrong.</p>";
  const notes = status.notes.length ? `<ul class="notes">\n${status.notes.map(sentence).join("\n")}\n</ul>` : "";
  const stacks = status.stacks
    .map(
      ({ stack, state, commit }) =>
        `<tr><td>${escape(stack)}</td><td>${escape(state)}</td><td>${commit ? `<code>${escape(commit.slice(0, 7))}</code>` : "none"}</td></tr>`,
    )
    .join("\n");

  const latest = update.could_not_check
    ? `Could not check. ${update.succeeded ? `The last check that succeeded was at ${when(update.succeeded)}.` : "No check has succeeded yet."}`
    : update.checked === null
      ? "Not checked yet."
      : `${
          update.available
            ? `${update.prerelease ? "Pre-release" : "Release"} ${escape(update.latest ?? "")} is out.`
            : update.newer
              ? `This box runs ${escape(status.release ?? "")}, newer than the latest release, ${escape(update.latest ?? "")}.`
              : update.latest
                ? "This box runs the latest release."
                : "No release yet."
        } Checked at ${when(update.checked)}.`;

  // While one runs the page says what it is doing and reloads itself; the
  // door and `box` are recreated on the way, so a reload may find neither.
  const running = status.updating?.running ? status.updating : null;
  const offers = [
    update.available && update.latest
      ? `<form method="post" action="/box/update"><button>Update to ${update.prerelease ? "pre-release " : ""}${escape(update.latest)}</button></form>`
      : "",
    status.back
      ? `<form method="post" action="/box/back"><button>Go back to ${escape(status.back)}</button></form>`
      : "",
  ].filter(Boolean);
  /** @param {NonNullable<typeof running>} running */
  const doing = ({ action, to }) =>
    action === "apply" ? "Applying the setup" : `${action === "update" ? "Updating" : "Going back"} to ${escape(to)}`;
  /** The step, and while an image is pulled, which, of how many, and its
   *  bytes as far as they are known.
   *  @param {NonNullable<typeof running>} running */
  const step = ({ step, pull }) => {
    if (!pull) return escape(step);
    const bytes = pull.total ? `, ${size(pull.current)} of ${size(pull.total)}` : "";
    const image = pull.image.replace(/@.*$/, "").replace(/:[^/:]*$/, "");
    return `${escape(step.replace(/\.$/, ""))}: ${escape(image)}, image ${pull.index} of ${pull.count}${bytes}.`;
  };
  const press = running
    ? `<p class="updating">${doing(running)}: ${step(running)}</p>`
    : offers.length
      ? `<section class="update">\n${railroad ? `${KEEPS}\n` : ""}${offers.join("\n")}\n</section>`
      : "";

  const tested = docker.tested.length ? `, release tested on ${docker.tested.map(escape).join(" and ")}` : "";

  // Only a box with a box name has a certificate and a name to resolve.
  const box = resolves
    ? `
<dt>Certificate</dt>
<dd>${certificate ? `${certificate.valid ? "" : "not valid, "}expires ${certificate.expires.slice(0, 10)}` : "could not be read"}</dd>
<dt>Box name</dt>
<dd>${escape(status.name)} resolves to ${resolves.to_this_box ? "this box" : escape(resolves.addresses.join(", ") || "nothing")}</dd>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">${running ? '\n<meta http-equiv="refresh" content="5">' : ""}
<title>Box status: ${escape(status.name)}</title>
<link rel="stylesheet" href="/box/look/look.css">
<script type="module" src="/box/look/look.bundle.js"></script>
<script type="module" src="/box/tick.js"></script>
<link rel="stylesheet" href="/box/page.css">
</head>
<body>
<look-shell>
<look-band ui="status" help="https://github.com/rails49/installation#the-status-page"><look-about name="${escape(status.name)}"></look-about></look-band>
<main>
${failures}
${notes}
${press}
<table>
<thead><tr><th>Stack</th><th>State</th><th>Commit</th></tr></thead>
<tbody>
${stacks}
</tbody>
</table>
${running ? "" : setup(status.setup, railroad)}
<dl>
<dt>Release</dt>
<dd>${escape(status.release ?? "none")}</dd>
<dt>Update</dt>
<dd>${latest} <form method="post" action="/box/check"><button>Check now</button></form> ${prereleases(update.prereleases)}</dd>
<dt>Disk free</dt>
<dd>${gb(status.disk.free)} of ${gb(status.disk.total)}</dd>
<dt>Address</dt>
<dd>${status.address ? `${escape(status.address)}. Reserve this address for the box in your router.` : "none"}</dd>
<dt>Docker Engine</dt>
<dd>${escape(docker.version)}${tested}</dd>
<dt>Log driver</dt>
<dd>${escape(docker.log_driver)}</dd>${box}
</dl>
<p><a href="/box/bundle" download>Download the log bundle</a></p>
</main>
</look-shell>
</body>
</html>
`;
}

/**
 * The form that chooses the stacks and their devices, and applies them.
 *
 * @param {Status["setup"]} setup
 * @param {boolean} railroad whether a declared stack runs
 */
function setup({ uis, devices }, railroad) {
  const checkboxes = LABELS.map(
    (label) =>
      `<label><input type="checkbox" name="ui" value="${label}"${uis.includes(label) ? " checked" : ""}> ${label}</label>`,
  );
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
      `<label>${label} <select name="${field}">\n${options.join("\n")}\n</select></label>`,
      ...(found.length ? [] : [`<p>No ${what} is plugged in.</p>`]),
    ].join("\n");
  });
  return `<form method="post" action="/box/setup" class="setup">
<fieldset>
<legend>Stacks</legend>
${checkboxes.join("\n")}
<p>Ticking dccex or occupancy ticks control too: each dials its broker.</p>
</fieldset>
${selects.join("\n")}${railroad ? `\n${KEEPS}` : ""}
<button>Apply</button>
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

/** A sentence as a list item, with a commit in backticks set as code.
 *  @param {string} text */
function sentence(text) {
  return `<li>${escape(text).replace(/`([^`]+)`/g, "<code>$1</code>")}</li>`;
}

/** @param {string} value */
function escape(value) {
  return value.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}
