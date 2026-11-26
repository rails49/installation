// The box's own requests, served on every name the door serves: whether this
// box can be turned off from here, with the update the status page offers
// (#147), and turning it off (ADR-0005); the status page at `/box/`, the
// files `status-page/` built, read from `../status-page/dist/` (#161), the
// status it shows at `/box/status`, a check for a new release, the log bundle (#65 decisions 5 to 7), starting an update or
// going back (decisions 8 to 10, `update.mjs`), applying the setup of
// stacks and devices (#69 decisions 10 to 15, `setup.mjs`), offering
// pre-releases (#105), and downloading a newer release in the background
// (#121, `download.mjs`).
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

import { execFile, execFileSync } from "node:child_process";
import { lookup } from "node:dns/promises";
import { readFileSync } from "node:fs";
import { readdir, readFile, statfs, writeFile } from "node:fs/promises";
import { createServer, request } from "node:http";
import { extname, join, relative } from "node:path";
import { connect } from "node:tls";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { bundle, pack } from "./bundle.mjs";
import { check, due } from "./check.mjs";
import { beginDownload, offered, starting } from "./download.mjs";
import { apply, form, offerDownload, offerPrereleases } from "./setup.mjs";
import { CHECK, downloads, message, prereleases, status } from "./status.mjs";
import { docker, read, start } from "./update.mjs";

const PORT = 8080;

const POWEROFF = ["nsenter", "-t", "1", "-m", "-u", "-i", "-n", "-p", "--", "systemctl", "poweroff"];

/** The type each kind of built file is served with. */
/** @type {Record<string, string>} */
const TYPES = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  svg: "image/svg+xml",
  json: "application/json",
};

/** Built files other than `index.html` are named by their hash, or are
 *  Shoelace's assets of the version the page was built with. */
const IMMUTABLE = "public, max-age=31536000, immutable";

/**
 * The status page's built files under `dir`, by the path each is served at:
 * `index.html` at `/box/`, every other file at `/box/` and its path. Nothing
 * outside this list is read from disk.
 *
 * @param {string} dir
 * @returns {Promise<Map<string, string>>}
 */
export async function built(dir) {
  const files = await readdir(dir, { recursive: true, withFileTypes: true });
  return new Map(
    files
      .filter((file) => file.isFile())
      .map((file) => {
        const path = relative(dir, join(file.parentPath, file.name));
        return [path === "index.html" ? "/box/" : `/box/${path}`, join(dir, path)];
      }),
  );
}

/**
 * @typedef {{ status: number, type: string, body: string | Buffer, headers?: Record<string, string> }} Answer
 */

/**
 * The answer to one request. `box.pid1` is the name of the box's PID 1, and
 * `box.turnOff` is called once a `POST /box/off` has been accepted.
 * `box.update` is the release the status page offers "Update to" for, or
 * null (#147). `box.status` gathers what the status page shows, `box.check`
 * asks GitHub for the latest release, and `box.bundle` packs the log bundle.
 * `box.start` starts an update or going back, and `box.apply` applies the
 * setup the page posted as its form's body; each says why it will not.
 * `box.prereleases` writes whether the check takes pre-releases.
 * `box.automatic` reads whether the box downloads after every check, and
 * `box.setAutomatic` writes it; with it off, only `POST /box/check`
 * downloads (#141). `box.page` is the status page's built files, from
 * `built()`.
 * `box.download` starts downloading the release a check found, where it is
 * newer than the one the box runs and not the one it has downloaded (#121,
 * #126).
 * It answers once `download.json` names the release, not once the release's
 * box image has pulled, so a press is answered at once and the status the
 * page fetches after it shows the download (#125). It does not reject: a
 * failure goes to the log and to `download.json` (#124).
 *
 * The page's presses (`POST /box/check`, `/box/prereleases`,
 * `/box/download`, `/box/update` and `/box/back`) answer 204, or 409 with
 * the sentence that says why the box refused.
 *
 * @param {{ method?: string, url?: string, headers: { origin?: string, host?: string, accept?: string, "x-forwarded-host"?: string }, body?: string }} request
 * @param {{ pid1: string, turnOff: () => void, status: () => Promise<import("../status-page/src/status.ts").Status>, update: () => Promise<string | null>, check: () => Promise<void>, download: () => Promise<void>, bundle: () => Promise<{ name: string, body: Buffer }>, start: (action: "update" | "back") => Promise<string | null>, apply: (body: string) => Promise<string | null>, prereleases: (on: boolean) => Promise<void>, automatic: () => Promise<boolean>, setAutomatic: (on: boolean) => Promise<void>, page: Map<string, string> }} box
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
    // A person who typed the status page's address and left the slash off
    // gets the status page; control's `fetch`, which sends `*/*`, the JSON
    // (#86). Both vary on `Accept`, so no cache answers one with the other.
    if (request.headers.accept?.includes("text/html")) {
      return {
        status: 303,
        type: "text/plain; charset=utf-8",
        body: "",
        headers: { location: "/box/", vary: "accept" },
      };
    }
    return {
      status: 200,
      type: "application/json",
      body: JSON.stringify({ can_turn_off: canTurnOff, update: await box.update().catch(offerless) }),
      headers: { vary: "accept" },
    };
  }
  if (route === "POST /box/off") {
    if (!canTurnOff) return text(409, "this server cannot be turned off from here");
    box.turnOff();
    return text(202, "");
  }
  if (route === "GET /box/status") {
    return { status: 200, type: "application/json", body: JSON.stringify(await box.status()) };
  }
  if (route === "POST /box/check") {
    await box.check();
    await box.download();
    return text(204, "");
  }
  if (route === "POST /box/prereleases") {
    await box.prereleases(new URLSearchParams(request.body ?? "").get("prereleases") === "yes");
    await box.check();
    if (await box.automatic()) await box.download();
    return text(204, "");
  }
  if (route === "POST /box/download") {
    const on = new URLSearchParams(request.body ?? "").get("download") === "yes";
    await box.setAutomatic(on);
    if (on) await box.download();
    return text(204, "");
  }
  if (route === "POST /box/update" || route === "POST /box/back") {
    const refusal = await box.start(route === "POST /box/update" ? "update" : "back");
    if (refusal !== null) return text(409, refusal);
    return text(204, "");
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
  const file = request.method === "GET" ? box.page.get(route.slice("GET ".length)) : undefined;
  if (file) {
    return {
      status: 200,
      type: TYPES[extname(file).slice(1)] ?? "application/octet-stream",
      body: await readFile(file),
      headers: { "cache-control": route === "GET /box/" ? "no-cache" : IMMUTABLE },
    };
  }
  return text(404, "");
}

/**
 * The time zone `readlink /etc/localtime` names on the host, as
 * `Asia/Tokyo`, or null where it names none. The box's clock is in it, so
 * the daily check runs at 2:00 there (#144).
 *
 * @param {string} link
 */
export function zone(link) {
  return link.trim().split("/zoneinfo/")[1] || null;
}

/**
 * Asked every hour, and as `box` starts: checks when none has succeeded since
 * the last 2:00 on the box's clock (#144), and downloads what the last check
 * found, so a download a reboot stopped carries on. A box that downloads only
 * after a press of "Check for update" downloads nothing here (#141).
 *
 * @param {{ due: () => Promise<boolean>, check: () => Promise<void>, download: () => Promise<void>, automatic: () => Promise<boolean> }} box
 */
export async function tick(box) {
  try {
    if (await box.due()) await box.check();
  } catch (error) {
    console.error(`checking for a new release: ${message(error)}`);
  }
  if (await box.automatic()) await box.download();
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

/** No update, where the files it is decided from cannot be read, as while an
 *  update writes `update.json`. The failure goes to the log.
 *  @param {unknown} error */
function offerless(error) {
  console.error(`reading the update the page offers: ${message(error)}`);
  return null;
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

/** What the Engine API's one-shot stats say of a container, or null where it
 *  answers anything but 200, as for a container that has gone.
 *  @param {string} id
 *  @returns {Promise<import("./status.mjs").Stats | null>} */
function stats(id) {
  return new Promise((resolve, reject) => {
    const path = `/containers/${encodeURIComponent(id)}/stats?stream=false&one-shot=true`;
    request({ socketPath: "/var/run/docker.sock", path }, async (answer) => {
      let body = "";
      for await (const chunk of answer) body += chunk;
      resolve(answer.statusCode === 200 ? JSON.parse(body) : null);
    })
      .on("error", reject)
      .end();
  });
}

/** What the Engine API's container inspect says of a container's size, or
 *  null where it answers anything but 200, as for a container that has gone.
 *  @param {string} id
 *  @returns {Promise<{ SizeRootFs: number, SizeRw: number } | null>} */
function size(id) {
  return new Promise((resolve, reject) => {
    request({ socketPath: "/var/run/docker.sock", path: `/containers/${encodeURIComponent(id)}/json?size=true` }, async (answer) => {
      let body = "";
      for await (const chunk of answer) body += chunk;
      resolve(answer.statusCode === 200 ? JSON.parse(body) : null);
    })
      .on("error", reject)
      .end();
  });
}

// Listening, only when run rather than imported by the tests.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  // On a Mac this is the PID 1 of Docker Desktop's virtual machine, which is
  // not systemd, so the box there answers no.
  const pid1 = readFileSync("/proc/1/comm", "utf8").trim();
  // The host's time zone, before anything reads the clock.
  try {
    const link = execFileSync("nsenter", ["-t", "1", "-m", "--", "readlink", "/etc/localtime"], { encoding: "utf8" });
    const name = zone(link);
    if (name) process.env.TZ = name;
  } catch (error) {
    console.error(`reading the host's time zone: ${message(error)}`);
  }
  // The status page, built beside this script in the image (`box/Dockerfile`).
  const page = await built(fileURLToPath(new URL("../status-page/dist/", import.meta.url)));
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
    prereleases: () => prereleases(read),
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
    stats,
    size,
    starting,
    now,
  };
  const startIo = { docker, read, write: writeFile, now, fetch };
  const setupIo = {
    read,
    // In place, so each file keeps its owner and mode.
    write: writeFile,
    // The box's `/dev`, mounted under `/host`.
    list: async (/** @type {string} */ dir) => await readdir(`/host${dir}`).catch(() => []),
    docker,
    start: async (/** @type {string} */ uis, /** @type {string} */ domain) =>
      start("apply", { ...env, BOX_DOMAIN: domain, BOX_UIS: uis, address: await address() }, startIo),
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

  // Starts downloading the release the last check found, where there is one
  // to download, and answers before its box image pulls (#125). A failure
  // goes to the log and, as the download's, to the page (#124), and is tried
  // again after the next check.
  const download = () => beginDownload(env, startIo);
  const automatic = () => downloads(read);
  const daily = () => tick({ due: () => due(checkIo), check: () => check(checkIo), download, automatic });
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
      update: () => offered(read),
      check: () => check(checkIo),
      download,
      bundle: async () => {
        const { name, entries } = await bundle(env, bundleIo);
        return { name, body: await pack(name, entries) };
      },
      start: async (action) => start(action, { ...env, address: await address() }, startIo),
      apply: (body) => apply(new URLSearchParams(body), setupIo),
      prereleases: (on) => offerPrereleases(on, setupIo),
      automatic,
      setAutomatic: (on) => offerDownload(on, setupIo),
      page,
    }).catch((error) => {
      console.error(`${req.method} ${req.url}: ${error.stack}`);
      return text(500, `${error.message}`);
    });
    res.writeHead(answer.status, { "content-type": answer.type, ...answer.headers }).end(answer.body);
  }).listen(PORT);
}
