/**
 * What `install.sh` does to a box (#69 decisions 5 to 8 and 11).
 *
 * It runs as root in the stock Debian image `box` is built on, with `docker`,
 * `curl`, `ip`, `apt-get` and `systemctl` replaced by scripts that write
 * down what they were asked. `curl` answers from a release made here, and
 * `docker run` writes the progress file `rails49-update` would. What the
 * script left under `/etc` and `/var/lib/rails49` is read back with each
 * path's owner and mode.
 */

import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);
const image = readFileSync(new URL("box/Dockerfile", root), "utf8").match(/^FROM (\S+)/m)![1]!;

const COMMIT = "1".repeat(40);
const BOX_IMAGE = `ghcr.io/rails49/installation-box:${COMMIT}@sha256:${"2".repeat(64)}`;

/** Each stub writes its arguments, one call per line, to `/out/calls`. */
const STUBS: Record<string, string> = {
  curl: `#!/bin/sh
echo "curl $*" >> /out/calls
out= write=
while [ $# -gt 1 ]; do
  case $1 in
    -o) out=$2; shift 2 ;;
    -w) write=1; shift 2 ;;
    *) shift ;;
  esac
done
case $1 in
  */releases/latest) [ -z "$write" ] || printf 'https://github.com/rails49/installation/releases/tag/2026.11.3' ;;
  */releases/download/2026.11.3/*|*/releases/download/2026.11.4/*) cp "/tmp/fixtures/\${1##*/}" "$out" ;;
  */gpg) echo key > "$out" ;;
  *) echo "curl: (22) The requested URL returned error: 404" >&2; exit 22 ;;
esac
`,
  ip: `#!/bin/sh
echo "1.1.1.1 via 192.168.1.1 dev eth0 src 192.168.1.20 uid 0"
`,
  "apt-get": `#!/bin/sh
echo "apt-get $*" >> /out/calls
case " $* " in *" docker-ce "*) cp /stubs/docker /usr/local/bin/docker ;; esac
`,
  systemctl: `#!/bin/sh
echo "systemctl $*" >> /out/calls
`,
};

/** \`docker run\` writes the progress file \`rails49-update\` would leave. */
const DOCKER = `#!/bin/sh
echo "docker $*" >> /out/calls
case $1 in
  run) cat /fixtures/update.json > /var/lib/rails49/update.json; echo 0123abcd ;;
  wait) echo 0 ;;
esac
`;

const PASSED = { step: "Done.", passed: true, failure: null };

type Options = {
  args?: string[];
  /** Shell run as root before the script, to shape the box. */
  before?: string;
  /** Docker Engine is installed. */
  docker?: boolean;
  user?: string;
  update?: { step: string; passed: boolean; failure: string | null };
};

/** Runs `install.sh` on a fresh box shaped by `before`. Returns its exit
 *  status and output, the stubs' calls, and every path it left under
 *  `/etc/rails49`, `/etc/docker` and `/var/lib/rails49` as
 *  `{ owner: "user:group mode", text }`. */
function installed({ args = [], before = "", docker = true, user, update = PASSED }: Options = {}) {
  const scratch = mkdtempSync(join(tmpdir(), "install-"));
  const stubs = join(scratch, "stubs");
  const fixtures = join(scratch, "fixtures");
  const out = join(scratch, "out");
  mkdirSync(join(stubs, "bin"), { recursive: true });
  mkdirSync(join(fixtures, "files", "installation"), { recursive: true });
  mkdirSync(out);
  chmodSync(out, 0o777);

  for (const [name, text] of Object.entries(STUBS)) writeFileSync(join(stubs, "bin", name), text, { mode: 0o755 });
  writeFileSync(join(stubs, "docker"), DOCKER, { mode: 0o755 });

  writeFileSync(join(fixtures, "manifest.json"), `${JSON.stringify({ release: "2026.11.3" }, null, 2)}\n`);
  writeFileSync(
    join(fixtures, "files", "installation", "compose.yaml"),
    `services:\n  page:\n    image: ghcr.io/rails49/installation-page:${COMMIT}@sha256:${"3".repeat(64)}\n  box:\n    image: ${BOX_IMAGE}\n`,
  );
  writeFileSync(
    join(fixtures, "update.json"),
    `${JSON.stringify({ action: "update", from: "-", to: "2026.11.3", started: "2026-11-12T10:00:00.000Z", finished: "2026-11-12T10:02:00.000Z", ...update })}\n`,
  );

  const setup = [
    "groupadd -g 993 render",
    "cp /stubs/bin/* /usr/local/bin/",
    // GNU tar, as GitHub's runner makes the release's archive.
    "cp -r /fixtures /tmp/fixtures && tar -czf /tmp/fixtures/box-files.tar.gz -C /fixtures/files .",
    docker ? "cp /stubs/docker /usr/local/bin/docker" : "",
    before,
    "touch /out/calls && chmod 666 /out/calls",
  ].join("\n");
  const run = [
    `${user ? `su -s /bin/sh ${user} -c 'sh /install.sh "$@"' -- install.sh` : "sh /install.sh"} "$@" >/out/stdout 2>/out/stderr`,
    "echo $? > /out/status",
    `find /etc/rails49 /etc/docker /var/lib/rails49 2>/dev/null | sort | while read -r path; do
       printf '== %s %s\\n' "$path" "$(stat -c '%U:%G %a' "$path")"
       [ -d "$path" ] || cat "$path"
     done > /out/report`,
  ].join("\n");

  try {
    const docker = spawnSync(
      "docker",
      [
        "run",
        "--rm",
        "--hostname",
        "shed",
        "-v",
        `${fileURLToPath(new URL("install.sh", root))}:/install.sh:ro`,
        "-v",
        `${stubs}:/stubs:ro`,
        "-v",
        `${fixtures}:/fixtures:ro`,
        "-v",
        `${out}:/out`,
        image,
        "sh",
        "-c",
        `${setup}\n${run}`,
        "sh",
        ...args,
      ],
      { encoding: "utf8" },
    );
    if (docker.status !== 0) throw new Error(`docker run failed: ${docker.stderr}`);
    const read = (name: string) => readFileSync(join(out, name), "utf8");
    const files: Record<string, { owner: string; text: string }> = {};
    for (const entry of read("report").split(/^== /m).filter(Boolean)) {
      const [head, ...rest] = entry.split("\n");
      const [path, ...owner] = head!.split(" ");
      files[path!] = { owner: owner.join(" "), text: rest.join("\n") };
    }
    return {
      status: Number(read("status")),
      stdout: read("stdout"),
      stderr: read("stderr"),
      calls: read("calls").trimEnd().split("\n").filter(Boolean),
      files,
    };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const ADDRESSES = ["http://shed.local/box/", "http://192.168.1.20/box/"];

describe("installing a fresh box", () => {
  const run = installed();

  it("passes and prints the status page's two addresses", () => {
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    for (const address of ADDRESSES) expect(run.stdout).toContain(address);
  });

  it("declares a box with no certificate that serves nothing", () => {
    expect(run.files["/etc/rails49/box.env"]).toEqual({ owner: "root:root 644", text: "BOX_DOMAIN=\nBOX_UIS=\n" });
  });

  it("writes the host facts for control and occupancy, with the rails49 user's ids", () => {
    const control = run.files["/etc/rails49/control.env"]!;
    const uid = control.text.match(/^TC49_UID=(\d+)$/m)![1];
    const gid = control.text.match(/^TC49_GID=(\d+)$/m)![1];
    expect(control).toEqual({
      owner: "root:root 644",
      text: `TC49_UID=${uid}\nTC49_GID=${gid}\nTC49_STORE=/var/lib/rails49/tc49\nCOMPOSE_PROFILES=layout,sim\n`,
    });
    expect(run.files["/etc/rails49/occupancy.env"]).toEqual({
      owner: "root:root 644",
      text:
        `TC49_UID=${uid}\nTC49_GID=${gid}\nTC49_STORE=/var/lib/rails49/tc49\n` +
        "VIDEO_GID=44\nRENDER_GID=993\nOCCUPANCY_ARCHIVES=/var/lib/rails49/tc49/occupancy\n",
    });
    expect(Number(uid)).toBeLessThan(1000);
  });

  it("makes the store, its archives and JMRI's profile, owned by rails49", () => {
    for (const dir of ["", "/occupancy", "/jmri"]) {
      expect(run.files[`/var/lib/rails49/tc49${dir}`]?.owner).toBe("rails49:rails49 755");
    }
  });

  it("asks for Docker's local log driver and restarts Docker", () => {
    expect(run.files["/etc/docker/daemon.json"]).toEqual({ owner: "root:root 644", text: '{"log-driver": "local"}\n' });
    expect(run.calls).toContain("systemctl restart docker");
  });

  it("installs avahi-daemon, and not Docker, which is there", () => {
    expect(run.calls).toContain("apt-get install -y -q avahi-daemon");
    expect(run.calls.filter((call) => call.includes("docker-ce"))).toEqual([]);
  });

  it("downloads the latest full release and unpacks its box files", () => {
    expect(run.calls).toContain(
      "curl -fsSLI -o /dev/null -w %{url_effective} https://github.com/rails49/installation/releases/latest",
    );
    expect(Object.keys(run.files).filter((path) => path.startsWith("/var/lib/rails49/releases/"))).toEqual([
      "/var/lib/rails49/releases/2026.11.3",
      "/var/lib/rails49/releases/2026.11.3/installation",
      "/var/lib/rails49/releases/2026.11.3/installation/compose.yaml",
      "/var/lib/rails49/releases/2026.11.3/manifest.json",
    ]);
  });

  it("brings the installation up by updating from nothing with the release's rails49-update", () => {
    const docker = run.calls.filter((call) => call.startsWith("docker "));
    expect(docker).toEqual([
      "docker run -d --name rails49-update -v /var/run/docker.sock:/var/run/docker.sock " +
        "-v /etc/rails49:/etc/rails49:ro -v /var/lib/rails49:/var/lib/rails49 " +
        "-e BOX_DOMAIN= -e BOX_UIS= -e BOX_HOSTNAME=shed -e BOX_ADDRESS=192.168.1.20 " +
        `--add-host shed.local:192.168.1.20 ${BOX_IMAGE} node /box/update.mjs update - 2026.11.3`,
      "docker wait rails49-update",
    ]);
  });
});

describe("installing", () => {
  it("installs the release --release names", () => {
    const run = installed({ args: ["--release", "2026.11.4"] });
    expect(run.status).toBe(0);
    expect(run.calls.filter((call) => call.includes("releases/latest"))).toEqual([]);
    expect(run.files["/var/lib/rails49/releases/2026.11.4/manifest.json"]).toBeDefined();
    expect(run.calls).toContain("docker wait rails49-update");
    expect(run.calls.find((call) => call.startsWith("docker run"))).toMatch(/ update - 2026\.11\.4$/);
  });

  it("refuses a release GitHub does not have, and starts nothing", () => {
    const run = installed({ args: ["--release", "2026.11.9"] });
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("Could not download release 2026.11.9 from GitHub.");
    expect(run.calls.filter((call) => call.startsWith("docker "))).toEqual([]);
    expect(run.files["/etc/rails49/box.env"]).toBeUndefined();
  });

  it("downloads nothing when the release's files are there already", () => {
    // The release workflow puts them there before the release is published.
    const run = installed({
      args: ["--release", "2026.11.4"],
      before: "mkdir -p /var/lib/rails49/releases/2026.11.4 && cp -r /fixtures/files/. /fixtures/manifest.json /var/lib/rails49/releases/2026.11.4/",
    });
    expect(run.status).toBe(0);
    expect(run.calls.filter((call) => call.startsWith("curl "))).toEqual([]);
  });

  it("refuses on an installed box, prints the status page's addresses, and changes nothing", () => {
    const run = installed({ before: "mkdir -p /etc/rails49 && echo BOX_DOMAIN=example.org > /etc/rails49/box.env" });
    expect(run.status).toBe(1);
    expect(run.stdout).toContain("installed already");
    for (const address of ADDRESSES) expect(run.stdout).toContain(address);
    expect(run.calls).toEqual([]);
    expect(Object.keys(run.files)).toEqual(["/etc/rails49", "/etc/rails49/box.env"]);
  });

  it("keeps an existing daemon.json as it is, and leaves Docker running", () => {
    const daemon = '{\n  "data-root": "/srv/docker"\n}\n';
    const run = installed({ before: `mkdir -p /etc/docker && printf '${daemon.replace(/\n/g, "\\n")}' > /etc/docker/daemon.json` });
    expect(run.status).toBe(0);
    expect(run.files["/etc/docker/daemon.json"]!.text).toBe(daemon);
    expect(run.stdout).toContain("/etc/docker/daemon.json is there already");
    expect(run.calls.filter((call) => call.startsWith("systemctl"))).toEqual([]);
  });

  it("installs Docker Engine from Docker's apt repository where there is none", () => {
    const run = installed({ docker: false });
    expect(run.status).toBe(0);
    expect(run.calls).toContain("curl -fsSL -o /etc/apt/keyrings/docker.asc https://download.docker.com/linux/debian/gpg");
    expect(run.calls).toContain(
      "apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
    );
    expect(run.calls).toContain("docker wait rails49-update");
  });

  it("refuses without root, and changes nothing", () => {
    const run = installed({ user: "nobody" });
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("Run this as root");
    expect(run.calls).toEqual([]);
    expect(run.files).toEqual({});
  });

  it("refuses without apt, and changes nothing", () => {
    const run = installed({ before: "rm /usr/bin/apt-get /usr/local/bin/apt-get" });
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("no apt");
    expect(run.calls).toEqual([]);
    expect(run.files).toEqual({});
  });

  it("fails with the update's sentence and the status page's addresses when the installation does not come up", () => {
    const failure = "installation is not running 60 seconds after updating to release 2026.11.3: installation-door-1 restarted.";
    const run = installed({ update: { step: "Failed.", passed: false, failure } });
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(`Release 2026.11.3 did not come up: ${failure}`);
    for (const address of ADDRESSES) expect(run.stderr).toContain(address);
  });
});
