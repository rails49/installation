// The box's own requests, served on every name the door serves: whether this
// box can be turned off from here, and turning it off (ADR-0005); the status
// page at `/box/`, the status it shows at `/box/status`, a check for a new
// release, the log bundle (#65 decisions 5 to 7), starting an update or
// going back (decisions 8 to 10, `update.mjs`), and applying the setup of
// stacks and devices (#69 decisions 10 to 15, `setup.mjs`).
//
// Node's standard library and nothing else, run by `node:22-slim` with the
// Docker CLI added. The container shares the box's PID namespace and is
// privileged, so `nsenter` into PID 1 reaches the box's systemd and its
// network. It has the Docker socket, through which it reads the stacks. No
// command it runs takes anything from the request.
//
// No authentication: the LAN is the trust boundary (control ADR-0042). A page
// on another origin is refused, by the rule the store and the broker apply
// (control ADR-0055, ADR-0057). `GET /origin` answers the same rule for the
// door, which asks it about every UI's websocket and write paths
// (rails49/.github#69).

import { execFile } from "node:child_process";
import { lookup } from "node:dns/promises";
import { readFileSync } from "node:fs";
import { readdir, readFile, rename, statfs, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { connect } from "node:tls";
import { promisify } from "node:util";

import { bundle, pack } from "./bundle.mjs";
import { check, due } from "./check.mjs";
import { render } from "./page.mjs";
import { apply, form } from "./setup.mjs";
import { CHECK, message, status } from "./status.mjs";
import { docker, read, start } from "./update.mjs";

const PORT = 8080;

const POWEROFF = ["nsenter", "-t", "1", "-m", "-u", "-i", "-n", "-p", "--", "systemctl", "poweroff"];

/** The files the page loads, by path: where each is, beside this script or
 *  in the image, and its type. Nothing else is read from disk. */
/** @type {Record<string, [URL, string]>} */
const ASSETS = {
  "GET /box/page.css": [new URL("page.css", import.meta.url), "text/css; charset=utf-8"],
  "GET /box/tick.js": [new URL("tick.js", import.meta.url), "text/javascript; charset=utf-8"],
  "GET /box/look/look.bundle.js": [
    new URL("../look/look.bundle.js", import.meta.url),
    "text/javascript; charset=utf-8",
  ],
};

/**
 * @typedef {{ status: number, type: string, body: string | Buffer, headers?: Record<string, string> }} Answer
 */

/**
 * The answer to one request. `box.pid1` is the name of the box's PID 1, and
 * `box.turnOff` is called once a `POST /box/off` has been accepted.
 * `box.status` gathers what the status page shows, `box.check` asks GitHub
 * for the latest release, and `box.bundle` packs the log bundle.
 * `box.start` starts an update or going back, and `box.apply` applies the
 * setup the page posted as its form's body; each says why it will not.
 *
 * @param {{ method?: string, url?: string, headers: { origin?: string, host?: string, "x-forwarded-host"?: string }, body?: string }} request
 * @param {{ pid1: string, turnOff: () => void, status: () => Promise<import("./page.mjs").Status>, check: () => Promise<void>, bundle: () => Promise<{ name: string, body: Buffer }>, start: (action: "update" | "back") => Promise<string | null>, apply: (body: string) => Promise<string | null> }} box
 * @returns {Promise<Answer>}
 */
export async function handle(request, box) {
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
  if (route === "GET /box/status") {
    return { status: 200, type: "application/json", body: JSON.stringify(await box.status()) };
  }
  if (route === "GET /box/") {
    return { status: 200, type: "text/html; charset=utf-8", body: render(await box.status()) };
  }
  if (route === "POST /box/check") {
    await box.check();
    return { status: 303, type: "text/plain; charset=utf-8", body: "", headers: { location: "/box/" } };
  }
  if (route === "POST /box/update" || route === "POST /box/back") {
    const refusal = await box.start(route === "POST /box/update" ? "update" : "back");
    if (refusal !== null) return text(409, refusal);
    return { status: 303, type: "text/plain; charset=utf-8", body: "", headers: { location: "/box/" } };
  }
  if (route === "POST /box/setup") {
    const refusal = await box.apply(request.body ?? "");
    if (refusal !== null) return text(409, refusal);
    return { status: 303, type: "text/plain; charset=utf-8", body: "", headers: { location: "/box/" } };
  }
  if (route === "GET /box/bundle") {
    const { name, body } = await box.bundle();
    return {
      status: 200,
      type: "application/gzip",
      body,
      headers: { "content-disposition": `attachment; filename="${name}"` },
    };
  }
  const asset = ASSETS[route];
  if (asset) return { status: 200, type: asset[1], body: await readFile(asset[0]) };
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
 * @returns {Answer}
 */
function text(status, body) {
  return { status, type: "text/plain; charset=utf-8", body };
}

const run = promisify(execFile);

/** The most a command may print: a container's last 1000 lines fit. */
const MAX_OUTPUT = 64 * 1024 * 1024;

/** The box's address on its LAN: the source of the route to the internet in
 *  the box's own network namespace, as `ip route get` says it. No packet is
 *  sent. Nothing where the box has no route. */
const ADDRESS_SCRIPT = `const s = require("node:dgram").createSocket("udp4");
s.on("error", () => s.close());
s.connect(53, "1.1.1.1", () => { console.log(s.address().address); s.close(); });`;

async function address() {
  const { stdout } = await run("nsenter", ["-t", "1", "-n", "--", "node", "-e", ADDRESS_SCRIPT]);
  return stdout.trim() || null;
}

/** What the door presents for `name` on 443: read from a TLS connection,
 *  never from `acme.json`.
 *  @param {string} name
 *  @returns {Promise<{ valid_from: string, valid_to: string, error: string | null }>} */
function certificate(name) {
  return new Promise((resolve, reject) => {
    const socket = connect({ host: "door", port: 443, servername: name, rejectUnauthorized: false, timeout: 10_000 }, () => {
      const presented = socket.getPeerCertificate();
      socket.end();
      if (!presented.valid_to) return reject(new Error("the door presented no certificate"));
      resolve({
        valid_from: new Date(presented.valid_from).toISOString(),
        valid_to: new Date(presented.valid_to).toISOString(),
        error: socket.authorized ? null : String(socket.authorizationError),
      });
    });
    socket.on("error", reject);
    socket.on("timeout", () => socket.destroy(new Error("the door did not answer on 443")));
  });
}

// Listening, only when run rather than imported by the tests.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  // On a Mac this is the PID 1 of Docker Desktop's virtual machine, which is
  // not systemd, so the box there answers no.
  const pid1 = readFileSync("/proc/1/comm", "utf8").trim();
  const env = {
    BOX_DOMAIN: process.env.BOX_DOMAIN ?? "",
    BOX_UIS: process.env.BOX_UIS ?? "",
    hostname: readFileSync("/host/hostname", "utf8").trim(),
  };
  const now = () => new Date();
  const checkIo = {
    fetch,
    read: () => read(CHECK),
    write: (/** @type {string} */ text) => writeFile(CHECK, text),
    now,
  };
  const statusIo = {
    docker,
    read,
    disk: async () => {
      // The file system Docker keeps its images and logs on.
      const disk = await statfs("/");
      return { free: disk.bavail * disk.bsize, total: disk.blocks * disk.bsize };
    },
    address,
    certificate,
    resolve: async (/** @type {string} */ name) => (await lookup(name, { all: true })).map((a) => a.address),
    now,
  };
  const startIo = { docker, read, write: writeFile, now, fetch };
  const setupIo = {
    read,
    // Beside the file and renamed over it, so a stack never reads half of one.
    write: async (/** @type {string} */ path, /** @type {string} */ text) => {
      await writeFile(`${path}.part`, text);
      await rename(`${path}.part`, path);
    },
    // The box's `/dev`, mounted under `/host`.
    list: async (/** @type {string} */ dir) => await readdir(`/host${dir}`).catch(() => []),
    docker,
    start: async (/** @type {string} */ uis) =>
      start("apply", { ...env, BOX_UIS: uis, address: await address() }, startIo),
  };
  const bundleIo = {
    docker,
    // Both streams, interleaved as the container wrote them.
    logs: async (/** @type {string} */ container) =>
      (await run("sh", ["-c", 'docker logs --tail 1000 "$1" 2>&1', "sh", container], { maxBuffer: MAX_OUTPUT })).stdout,
    read,
    list: async (/** @type {string} */ dir) => (await readdir(dir).catch(() => [])),
    now,
  };

  // Asked every hour, and checks when a day has passed since the last check
  // that succeeded.
  const daily = async () => {
    try {
      if (await due(checkIo)) await check(checkIo);
    } catch (error) {
      console.error(`checking for a new release: ${message(error)}`);
    }
  };
  daily();
  setInterval(daily, 60 * 60 * 1000);

  createServer(async (req, res) => {
    /** @type {Buffer[]} */
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");
    const answer = await handle({ method: req.method, url: req.url, headers: req.headers, body }, {
      pid1,
      // After the 202 has gone out. Where the command fails nothing is left to
      // answer, so the failure goes to the container's log.
      turnOff: () =>
        res.once("finish", () =>
          execFile(POWEROFF[0], POWEROFF.slice(1), (error, _, stderr) => {
            if (error) console.error(`${POWEROFF.join(" ")}: ${error.message} ${stderr}`);
          }),
        ),
      status: async () => ({ ...(await status(env, statusIo)), setup: await form(setupIo) }),
      check: () => check(checkIo),
      bundle: async () => {
        const { name, entries } = await bundle(env, bundleIo);
        return { name, body: await pack(name, entries) };
      },
      start: async (action) => start(action, { ...env, address: await address() }, startIo),
      apply: (body) => apply(new URLSearchParams(body), setupIo),
    }).catch((error) => {
      console.error(`${req.method} ${req.url}: ${error.stack}`);
      return text(500, `${error.message}`);
    });
    res.writeHead(answer.status, { "content-type": answer.type, ...answer.headers }).end(answer.body);
  }).listen(PORT);
}
