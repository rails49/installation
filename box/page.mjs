// The status page at `/box/`, rendered from the status `GET /box/status`
// answers (#65 decision 16), with updating and going back on a press
// (decisions 2, 10 and 13). It loads look's bundle and its stylesheet from
// under `/box`.

import { gb, when } from "./status.mjs";

/** @typedef {Awaited<ReturnType<typeof import("./status.mjs").status>>} Status */

/**
 * @param {Status} status
 * @returns {string}
 */
export function render(status) {
  const { update, docker, certificate, resolves } = status;
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
      : `${update.available ? `Release ${escape(update.latest ?? "")} is out.` : update.latest ? "This box runs the latest release." : "No release yet."} Checked at ${when(update.checked)}.`;

  // While one runs the page says what it is doing and reloads itself; the
  // door and `box` are recreated on the way, so a reload may find neither.
  const running = status.updating?.running ? status.updating : null;
  const offers = [
    update.available && update.latest
      ? `<form method="post" action="/box/update"><button>Update to ${escape(update.latest)}</button></form>`
      : "",
    status.back
      ? `<form method="post" action="/box/back"><button>Go back to ${escape(status.back)}</button></form>`
      : "",
  ].filter(Boolean);
  const press = running
    ? `<p class="updating">${running.action === "update" ? "Updating" : "Going back"} to ${escape(running.to)}: ${escape(running.step)}</p>`
    : offers.length
      ? `<section class="update">\n<p>Updating or going back stops the railroad for about a minute.</p>\n${offers.join("\n")}\n</section>`
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
<script type="module" src="/box/look/look.bundle.js"></script>
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
<dl>
<dt>Release</dt>
<dd>${escape(status.release ?? "none")}</dd>
<dt>Update</dt>
<dd>${latest} <form method="post" action="/box/check"><button>Check now</button></form></dd>
<dt>Disk free</dt>
<dd>${gb(status.disk.free)} of ${gb(status.disk.total)}</dd>
<dt>Address</dt>
<dd>${escape(status.address ?? "none")}</dd>
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

/** A sentence as a list item, with a commit in backticks set as code.
 *  @param {string} text */
function sentence(text) {
  return `<li>${escape(text).replace(/`([^`]+)`/g, "<code>$1</code>")}</li>`;
}

/** @param {string} value */
function escape(value) {
  return value.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}
