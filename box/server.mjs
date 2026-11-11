// The box's own two requests, served on every name the door serves: whether
// this box can be turned off from here, and turning it off (ADR-0005).
//
// Node's standard library and nothing else, run by `node:22-slim`. The
// container shares the box's PID namespace and is privileged, so `nsenter`
// into PID 1 reaches the box's systemd. The command takes nothing from the
// request.
//
// No authentication: the LAN is the trust boundary (control ADR-0042). A page
// on another origin is refused, by the rule the store and the broker apply
// (control ADR-0055, ADR-0057). `GET /origin` answers the same rule for the
// door, which asks it about every UI's websocket and write paths
// (rails49/.github#69).

import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const PORT = 8080;

const POWEROFF = ["nsenter", "-t", "1", "-m", "-u", "-i", "-n", "-p", "--", "systemctl", "poweroff"];

/**
 * The answer to one request. `box.pid1` is the name of the box's PID 1, and
 * `box.turnOff` is called once a `POST /box/off` has been accepted.
 *
 * @param {{ method?: string, url?: string, headers: { origin?: string, host?: string, "x-forwarded-host"?: string } }} request
 * @param {{ pid1: string, turnOff: () => void }} box
 * @returns {{ status: number, type: string, body: string }}
 */
export function handle(request, box) {
  const { origin, host } = request.headers;
  const route = `${request.method} ${request.url?.split("?")[0]}`;
  // The door's `same-origin` middleware asks this about every websocket and
  // write path of every UI. Its question carries the request's own headers,
  // and the `Host` it arrived with as `X-Forwarded-Host`.
  if (route === "GET /origin") {
    return sameOrigin(origin, request.headers["x-forwarded-host"]) ? text(200, "") : refused();
  }
  if (!sameOrigin(origin, host)) return refused();
  const canTurnOff = box.pid1 === "systemd";
  if (route === "GET /box") {
    return { status: 200, type: "application/json", body: JSON.stringify({ can_turn_off: canTurnOff }) };
  }
  if (route === "POST /box/off") {
    if (!canTurnOff) return text(409, "this server cannot be turned off from here");
    box.turnOff();
    return text(202, "");
  }
  return text(404, "");
}

/**
 * Whether a request from the page at `origin` was sent to that page's own
 * origin, `host`. `Origin` is absent where there is no page: `curl`, a
 * same-origin GET. Host against host and not scheme against scheme, because
 * TLS ends at the door. `null`, which a sandboxed page sends, parses to no
 * host, and no host matches nothing, a missing `Host` included.
 *
 * @param {string | undefined} origin
 * @param {string | undefined} host
 */
function sameOrigin(origin, host) {
  return origin === undefined || (URL.parse(origin)?.host || null) === host;
}

function refused() {
  return text(403, "refused: a page on another origin");
}

/**
 * @param {number} status
 * @param {string} body
 */
function text(status, body) {
  return { status, type: "text/plain; charset=utf-8", body };
}

// Listening, only when run rather than imported by the tests.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  // On a Mac this is the PID 1 of Docker Desktop's virtual machine, which is
  // not systemd, so the box there answers no.
  const pid1 = readFileSync("/proc/1/comm", "utf8").trim();
  createServer((req, res) => {
    const answer = handle(req, {
      pid1,
      // After the 202 has gone out. Where the command fails nothing is left to
      // answer, so the failure goes to the container's log.
      turnOff: () =>
        res.once("finish", () =>
          execFile(POWEROFF[0], POWEROFF.slice(1), (error, _, stderr) => {
            if (error) console.error(`${POWEROFF.join(" ")}: ${error.message} ${stderr}`);
          }),
        ),
    });
    res.writeHead(answer.status, { "content-type": answer.type }).end(answer.body);
  }).listen(PORT);
}
