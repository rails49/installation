/**
 * The compose files as data: what never reaches the page.
 *
 * Whether Traefik actually routes with these labels is not covered here and
 * deliberately so — a wrong label parses and asserts fine. That is caught by
 * reaching every name on a real box, which is a step of the cutover and is
 * written as one rather than dressed up as automation. What is worth holding
 * here is what a reader cannot see is wrong: a network named by the project
 * rather than fixed, a mount one character away from binding an inode, a door
 * whose redirect takes more than the box's names, an ACME resolver left to
 * whatever the box's router answers.
 *
 * The files are read as written, with `${BOX_DOMAIN}` and the rest still in
 * them: what is asserted is that the declaration is where those values come
 * from. The door's script is the exception: it is run under `sh`, once per
 * kind of box, with a `traefik` on PATH that prints the flags it was handed.
 */

import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";
import { afterAll, describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

/** The fixed name every stack hardcodes (ADR-0004). It is the expensive
 *  half of that decision and the one thing here that cannot quietly change. */
const NETWORK = "rails49";

/** How the box's declaration reaches a compose file. Every stack on the box is
 *  started against this one path, so two stacks cannot come to different
 *  answers about the box's name. */
const DECLARATION = "/etc/rails49/box.env";

/** Where `control` writes the root of its store, `TC49_STORE`, when it deploys
 *  itself. JMRI's profile lives under that root, so JMRI is started against
 *  this file as well as the declaration. */
const DEPLOYMENT = "/etc/rails49/deploy.env";

/** Any node of a parsed compose file. Its shape is the file's rather than
 *  anything this repository declares, so the assertions below are what say
 *  which parts of it are load-bearing. */
type Node = any;

function compose(path: string): Node {
  return parse(readFileSync(new URL(path, root), "utf8"));
}

const installation: Node = compose("compose.yaml");
const jmri: Node = compose("jmri/compose.yaml");

/** A service's labels, as a map. Both files declare them as a list, which is
 *  the form compose writes them in here. */
function labels(service: Node): Record<string, string> {
  const declared: string[] = service.labels ?? [];
  return Object.fromEntries(
    declared.map((label) => {
      const at = label.indexOf("=");
      return [label.slice(0, at), label.slice(at + 1)];
    }),
  );
}

/** The door's script, as compose hands it to `sh`. `$$` is compose's spelling
 *  of a `$` it leaves for the shell. */
const doorScript: string = installation.services.door.command
  .at(-1)
  .replaceAll("$$", "$");

/** A directory holding a `traefik` that prints its arguments, one per line. */
const stub = mkdtempSync(join(tmpdir(), "door-"));
writeFileSync(join(stub, "traefik"), '#!/bin/sh\nprintf "%s\\n" "$@"\n');
chmodSync(join(stub, "traefik"), 0o755);
afterAll(() => rmSync(stub, { recursive: true, force: true }));

/** Runs the door's script under `sh` against `env` and nothing else from this
 *  process's environment, and returns the flags it hands Traefik. */
function doorWith(env: Record<string, string>) {
  const run = spawnSync("sh", ["-c", doorScript], {
    env: { PATH: `${stub}:/usr/bin:/bin`, ...env },
    encoding: "utf8",
  });
  return {
    status: run.status,
    flags: run.stdout.split("\n").filter(Boolean),
    stderr: run.stderr,
  };
}

/** The flags on a box with a box name, which is the whole of the door's static
 *  configuration there. */
const door: string[] = doorWith({
  BOX_DOMAIN: "example.org",
  BOX_ACME_PROVIDER: "cloudflare",
}).flags;

/** The flags every box passes: the provider, and the page and each UI on its
 *  UI port over plain HTTP. */
const EVERY_BOX = [
  "--providers.docker=true",
  "--providers.docker.exposedByDefault=false",
  "--entryPoints.web.address=:80",
  "--entryPoints.control.address=:8081",
  "--entryPoints.dccex.address=:8082",
  "--entryPoints.jmri.address=:8083",
  "--entryPoints.occupancy.address=:8084",
];

describe("the network every stack on the box shares", () => {
  it("is created here under the fixed name", () => {
    expect(installation.networks[NETWORK].name).toBe(NETWORK);
  });

  it("is the installation's to create and nobody else's", () => {
    // `name:` rather than compose's own prefix: this network belongs to no
    // single project, and `installation_rails49` is a name no other repository
    // could hardcode.
    expect(installation.networks[NETWORK].external).toBeUndefined();
    expect(jmri.networks[NETWORK].external).toBe(true);
    expect(jmri.networks[NETWORK].name ?? NETWORK).toBe(NETWORK);
  });

  it("is what the door and everything it reaches are on", () => {
    for (const service of [
      installation.services.door,
      installation.services.page,
      installation.services.box,
      jmri.services.jmri,
    ]) {
      expect(service.networks).toEqual([NETWORK]);
    }
  });

  it("is named again on every container the door reaches", () => {
    // Each sits on two networks and the docker provider otherwise picks
    // whichever container address it finds first, which is a route that works
    // until it does not (ADR-0004).
    for (const service of [
      installation.services.page,
      installation.services.box,
      jmri.services.jmri,
    ]) {
      expect(labels(service)["traefik.docker.network"]).toBe(NETWORK);
    }
  });
});

describe("the door", () => {
  it("publishes 80, 443 and every UI port", () => {
    expect(installation.services.door.ports).toEqual([
      "80:80",
      "443:443",
      "8081:8081",
      "8082:8082",
      "8083:8083",
      "8084:8084",
    ]);
  });

  it("is a shell that builds Traefik's flags and becomes Traefik", () => {
    expect(installation.services.door.command.slice(0, 2)).toEqual(["/bin/sh", "-c"]);
    expect(doorScript).toMatch(/^exec traefik "\$@"$/m);
  });

  it("reads the declaration from its environment, which compose fills", () => {
    // Every `$` in the script is the shell's; compose interpolates nothing in
    // it, so what the script tests is what the container was started with.
    expect(installation.services.door.command.at(-1).replaceAll("$$", "")).not.toContain("$");
    expect(installation.services.door.environment).toEqual({
      BOX_DOMAIN: "${BOX_DOMAIN?start this with --env-file /etc/rails49/box.env}",
      BOX_ACME_PROVIDER: "${BOX_ACME_PROVIDER-}",
    });
  });

  it("with a box name answers on 443 and serves every UI port", () => {
    // No redirect on the entry point: that would take every name on 80, an
    // address included. The `to-https` router takes the box's names alone.
    expect([...door].sort()).toEqual(
      [
        ...EVERY_BOX,
        "--entryPoints.websecure.address=:443",
        "--certificatesResolvers.le.acme.storage=/acme/acme.json",
        "--certificatesResolvers.le.acme.dnsChallenge.provider=cloudflare",
        "--certificatesResolvers.le.acme.dnsChallenge.resolvers=1.1.1.1:53,9.9.9.9:53",
      ].sort(),
    );
  });

  it("with no certificate serves 80 and every UI port, and nothing else", () => {
    // No provider either: a box with no certificate has no DNS host to name.
    const plain = doorWith({ BOX_DOMAIN: "" });
    expect(plain.status).toBe(0);
    expect([...plain.flags].sort()).toEqual([...EVERY_BOX].sort());
  });

  it("with a box name and no DNS provider stops and says which is missing", () => {
    const refused = doorWith({ BOX_DOMAIN: "example.org" });
    expect(refused.status).not.toBe(0);
    expect(refused.flags).toEqual([]);
    expect(refused.stderr).toContain("BOX_ACME_PROVIDER");
  });

  it("reads its routers off containers and out of no file", () => {
    // There is no route table anywhere after this, so there is nothing to
    // disagree with the labels the first time either changes.
    expect(door).toContain("--providers.docker=true");
    expect(door.join(" ")).not.toContain("providers.file");
  });

  it("routes a container only when that container asks", () => {
    // The provider sees every container on the box, including ones that are
    // nobody's browser's business.
    expect(door).toContain("--providers.docker.exposedByDefault=false");
    for (const service of [
      installation.services.page,
      installation.services.box,
      jmri.services.jmri,
    ]) {
      expect(labels(service)["traefik.enable"]).toBe("true");
    }
  });

  it("takes the DNS provider from the box's declaration", () => {
    const { flags } = doorWith({ BOX_DOMAIN: "example.org", BOX_ACME_PROVIDER: "route53" });
    expect(flags).toContain("--certificatesResolvers.le.acme.dnsChallenge.provider=route53");
  });

  it("pins the resolvers it asks which zone a name is in", () => {
    // A consumer router answers that question with SERVFAIL often enough to
    // matter. A hardcoded default and not a parameter: an operator who has to
    // name a resolver to get a certificate has been handed somebody else's bug.
    const resolvers = door.find((flag) =>
      flag.startsWith("--certificatesResolvers.le.acme.dnsChallenge.resolvers="),
    );
    expect(resolvers).toBe(
      "--certificatesResolvers.le.acme.dnsChallenge.resolvers=1.1.1.1:53,9.9.9.9:53",
    );
    expect(resolvers).not.toContain("$");
  });

  it("keeps what it is issued across a restart", () => {
    expect(door).toContain("--certificatesResolvers.le.acme.storage=/acme/acme.json");
    expect(installation.services.door.volumes).toContain("acme:/acme");
    expect(installation.volumes).toHaveProperty("acme");
  });

  it("is the only thing handed the ACME credential", () => {
    // A secret in the declaration is a secret handed to every stack on the box
    // for no reason, so it lives in a second file at the same fixed
    // directory and this is the one service that reads it.
    const read = (service: Node): string[] =>
      (service.env_file ?? []).map((entry: Node) => entry.path ?? entry);
    expect(read(installation.services.door)).toEqual(["/etc/rails49/acme.env"]);
    expect(read(installation.services.page)).toEqual([]);
    expect(read(installation.services.box)).toEqual([]);
    expect(read(jmri.services.jmri)).toEqual([]);
  });

  it("watches containers and starts none", () => {
    expect(installation.services.door.volumes).toContain(
      "/var/run/docker.sock:/var/run/docker.sock:ro",
    );
  });

  // v3.3 asked the daemon for API 1.24 and took no answer about it, so a box
  // whose daemon had raised its minimum refused every call: no container read,
  // no router built, and every name 404 behind a door that looked healthy.
  // Negotiation arrived after v3.4. The version is a floor rather than an
  // equality because the point is the behaviour and not the number, and a
  // downgrade is the one edit that brings the fault back.
  it("runs a version that negotiates the API with the daemon", () => {
    const tag = String(installation.services.door.image).split(":")[1];
    const [major, minor] = tag.replace(/^v/, "").split(".").map(Number);
    expect(major).toBeGreaterThanOrEqual(3);
    expect(major > 3 || minor >= 7).toBe(true);
  });
});

describe("the page", () => {
  it("is served at the apex of the name in the declaration", () => {
    expect(labels(installation.services.page)["traefik.http.routers.page.rule"])
      .toBe("Host(`${BOX_DOMAIN}`)");
  });

  it("is served over TLS with a certificate the door fetches", () => {
    const page = labels(installation.services.page);
    expect(page["traefik.http.routers.page.entrypoints"]).toBe("websecure");
    expect(page["traefik.http.routers.page.tls.certresolver"]).toBe("le");
  });

  it("is served over plain HTTP on 80, at whatever host it was reached", () => {
    // The rule is written out: a docker router with none gets
    // `Host(<container name>)`.
    const page = labels(installation.services.page);
    expect(page["traefik.http.routers.page-http.rule"]).toBe("PathPrefix(`/`)");
    expect(page["traefik.http.routers.page-http.entrypoints"]).toBe("web");
    expect(page["traefik.http.routers.page-http.tls"]).toBeUndefined();
  });

  it("redirects 80 to HTTPS for the box name and the names under it, and no other", () => {
    // An address or a `.local` name gets the page over plain HTTP. `/box`
    // under the box's names redirects too, so this is above `box-http`.
    const page = labels(installation.services.page);
    expect(page["traefik.http.routers.to-https.rule"]).toBe(
      "Host(`${BOX_DOMAIN}`) || HostRegexp(`^.+\\.${BOX_DOMAIN}$$`)",
    );
    expect(page["traefik.http.routers.to-https.entrypoints"]).toBe("web");
    expect(page["traefik.http.routers.to-https.middlewares"]).toBe("to-https");
    expect(page["traefik.http.middlewares.to-https.redirectscheme.scheme"]).toBe("https");
    expect(Number(page["traefik.http.routers.to-https.priority"])).toBeGreaterThan(
      Number(labels(installation.services.box)["traefik.http.routers.box-http.priority"]),
    );
  });

  it("mounts the render script's directory and look's, not the files in them", () => {
    // A single-file bind mount binds the inode, and `git pull` replaces a file
    // rather than writing through it, so a container mounted at the script
    // would go on rendering from the one it started with (control#353). It is
    // one character away from the mount that does not. The box's hostname is
    // the one file mount, and the one the render script reads by default.
    expect(installation.services.page.volumes).toEqual([
      "./page:/page:ro",
      "./look:/usr/share/nginx/html/look:ro",
      "/etc/hostname:/host/hostname:ro",
    ]);
    const script = readFileSync(new URL("page/render.sh", root), "utf8");
    expect(script).toContain("${HOSTNAME_FILE:-/host/hostname}");
  });

  it("renders once at start and is a file from then on", () => {
    expect(installation.services.page.command.at(-1)).toBe(
      "/page/render.sh > /usr/share/nginx/html/index.html && exec nginx -g 'daemon off;'",
    );
  });

  it("is told what the box is called and what it serves, and no more", () => {
    expect(installation.services.page.environment).toEqual({
      BOX_DOMAIN: expect.stringContaining("${BOX_DOMAIN"),
      BOX_UIS: "${BOX_UIS}",
    });
  });
});

describe("the box", () => {
  const box = installation.services.box;
  const router = labels(box);

  it("runs the stock node image in the box's own PID namespace", () => {
    // `nsenter` into PID 1 is how it reaches the box's systemd.
    expect(box.image).toBe("node:22-slim");
    expect(box.privileged).toBe(true);
    expect(box.pid).toBe("host");
    expect(box.restart).toBe("unless-stopped");
  });

  it("mounts the script's directory, not the script", () => {
    // The page's reason (control#353): a file mount binds the inode.
    expect(box.volumes).toEqual(["./box:/box:ro"]);
    expect(box.command).toEqual(["node", "/box/server.mjs"]);
  });

  it("is reached at /box on every name the door serves", () => {
    expect(router["traefik.http.routers.box.rule"]).toBe("PathPrefix(`/box`)");
    expect(router["traefik.http.routers.box.rule"]).not.toContain("Host");
    expect(router["traefik.http.routers.box.entrypoints"]).toBe("websecure");
  });

  it("is reached at /box over plain HTTP on 80 and every UI port", () => {
    // A second router, because one with `tls=true` does not match plain HTTP.
    // The same priority as the first, so it wins over each UI port's own.
    expect(router["traefik.http.routers.box-http.rule"]).toBe("PathPrefix(`/box`)");
    expect(router["traefik.http.routers.box-http.entrypoints"]).toBe(
      "web,control,dccex,jmri,occupancy",
    );
    expect(router["traefik.http.routers.box-http.priority"]).toBe("100");
    expect(router["traefik.http.routers.box-http.tls"]).toBeUndefined();
  });

  it("uses the certificate each name's own router already has", () => {
    expect(router["traefik.http.routers.box.tls"]).toBe("true");
    expect(router["traefik.http.routers.box.tls.certresolver"]).toBeUndefined();
  });

  it("is above every other router but the redirect", () => {
    // A router with no priority of its own has its rule's length, so a label's
    // `Host` rule would otherwise take `/box` for itself.
    const priority = Number(router["traefik.http.routers.box.priority"]);
    const others = [installation.services.page, jmri.services.jmri].flatMap((service) =>
      Object.entries(labels(service))
        .filter(([label]) => /^traefik\.http\.routers\.[^.]+\.rule$/.test(label))
        .filter(([label]) => label !== "traefik.http.routers.to-https.rule")
        .map(([label, rule]) => {
          const set = labels(service)[label.replace(/rule$/, "priority")];
          return set === undefined ? rule.length : Number(set);
        }),
    );
    expect(others.length).toBeGreaterThan(0);
    for (const other of others) expect(priority).toBeGreaterThan(other);
  });

  it("answers the origin check every UI names as same-origin@docker", () => {
    // The door dials `box` by its service name on the shared network, and
    // the script answers `/origin`.
    expect(router["traefik.http.middlewares.same-origin.forwardauth.address"]).toBe(
      `http://box:${router["traefik.http.services.box.loadbalancer.server.port"]}/origin`,
    );
    expect(box.networks).toEqual([NETWORK]);
    const script = readFileSync(new URL("box/server.mjs", root), "utf8");
    expect(script).toContain('route === "GET /origin"');
  });

  it("is served on the port the script listens on", () => {
    const script = readFileSync(new URL("box/server.mjs", root), "utf8");
    const port = router["traefik.http.services.box.loadbalancer.server.port"];
    expect(script).toContain(`const PORT = ${port};`);
  });
});

describe("nothing here is built but JMRI", () => {
  it("runs stock images and publishes none", () => {
    for (const service of [
      installation.services.door,
      installation.services.page,
      installation.services.box,
    ]) {
      expect(service.image).toBeTruthy();
      expect(service.build).toBeUndefined();
    }
  });

  it("builds JMRI, which no other repository owns, as the person", () => {
    // The stock image fixes its user at 61000, and a restore of the store
    // writes JMRI's profile as the person (rails49/.github ADR-0013).
    expect(jmri.services.jmri.image).toBeUndefined();
    expect(jmri.services.jmri.build.args).toEqual({
      TC49_UID: "${TC49_UID:-1000}",
      TC49_GID: "${TC49_GID:-1000}",
    });
    const dockerfile = readFileSync(new URL("jmri/Dockerfile", root), "utf8");
    expect(dockerfile).toMatch(/^FROM jsa1987\/jmri-docker:stable$/m);
    expect(dockerfile).toMatch(/usermod -o -u "\$TC49_UID"/);
  });
});

describe("JMRI", () => {
  it("is a compose project of its own", () => {
    // Not a profile on the installation's own stack, which is what the README
    // beside it denies (ADR-0002).
    expect(jmri.name).toBe("jmri");
    expect(jmri.name).not.toBe(installation.name);
    for (const service of Object.values<Node>(installation.services)) {
      expect(service.profiles).toBeUndefined();
    }
    expect(Object.keys(installation.services)).not.toContain("jmri");
  });

  it("publishes no port at all", () => {
    // 6901 is noVNC and goes behind the door; 12080 is JMRI's own web server,
    // which a browser reaches and which is therefore behind the door or
    // nowhere; 5901 is raw VNC, which is not a browser's.
    expect(jmri.services.jmri.ports).toBeUndefined();
  });

  it("is reachable at its label under the box name and on its UI port, and nowhere else", () => {
    const router = labels(jmri.services.jmri);
    const routers = Object.keys(router).filter((label) =>
      label.startsWith("traefik.http.routers."),
    );
    const named = new Set(routers.map((label) => label.split(".")[3]));
    expect([...named]).toEqual(["jmri", "jmri-http", "jmri-ws", "jmri-ws-http"]);
    expect(router["traefik.http.routers.jmri.rule"]).toBe(
      "Host(`jmri.${BOX_DOMAIN?start this with --env-file /etc/rails49/box.env}`)",
    );
    expect(router["traefik.http.routers.jmri-http.rule"]).toBe("PathPrefix(`/`)");
    expect(router["traefik.http.routers.jmri-http.entrypoints"]).toBe("jmri");
    expect(router["traefik.http.routers.jmri-http.tls"]).toBeUndefined();
  });

  it("puts noVNC's websocket behind the origin check on both ways in", () => {
    const router = labels(jmri.services.jmri);
    expect(router["traefik.http.routers.jmri-ws.rule"]).toBe(
      "Host(`jmri.${BOX_DOMAIN}`) && PathPrefix(`/websockify`)",
    );
    expect(router["traefik.http.routers.jmri-ws.entrypoints"]).toBe("websecure");
    expect(router["traefik.http.routers.jmri-ws-http.rule"]).toBe("PathPrefix(`/websockify`)");
    expect(router["traefik.http.routers.jmri-ws-http.entrypoints"]).toBe("jmri");
    for (const name of ["jmri-ws", "jmri-ws-http"]) {
      expect(router[`traefik.http.routers.${name}.middlewares`], name).toBe("same-origin@docker");
    }
    // Neither names a priority, so each is above its catch-all by its rule's
    // length.
    expect(router["traefik.http.routers.jmri-ws.rule"].length).toBeGreaterThan(
      router["traefik.http.routers.jmri.rule"].replace(/\?[^}]*/, "").length,
    );
    expect(router["traefik.http.routers.jmri-ws-http.rule"].length).toBeGreaterThan(
      router["traefik.http.routers.jmri-http.rule"].length,
    );
  });

  it("gets a fresh /tmp on every start", () => {
    // The image's websockify dials `localhost:5901` while its `vncserver`
    // takes the first display with no socket in /tmp/.X11-unix, so a restart
    // that kept the writable layer would move the VNC server one port away
    // from the one noVNC connects to. Carried from `control`'s compose, and
    // one line from being tidied away by someone who has not met the fault.
    expect(jmri.services.jmri.tmpfs).toEqual(["/tmp"]);
  });

  it("keeps its profile in the store, outside the home it makes world-writable", () => {
    // The entrypoint runs `chmod -R 777 /home/jmri` on every start, which
    // inside the store would change the mode of every file git holds.
    expect(jmri.services.jmri.environment.JMRI_OPTIONS).toBe(
      "-Dorg.jmri.profile=/profile",
    );
    expect(jmri.services.jmri.volumes).toContainEqual({
      type: "bind",
      // `control`'s root and no other: a default here would be a second
      // answer to where the store is.
      source: "${TC49_STORE}/jmri",
      target: "/profile",
      // Docker makes a missing source owned by root, which neither JMRI nor
      // the store can write.
      bind: { create_host_path: false },
    });
    expect(jmri.services.jmri.volumes).toContain("jmri:/home/jmri");
  });

  it("names the port the door reaches, the image exposing three", () => {
    expect(
      labels(jmri.services.jmri)["traefik.http.services.jmri.loadbalancer.server.port"],
    ).toBe("6901");
  });
});

describe("JMRI's start command", () => {
  it("reads the store root from where control writes it", () => {
    // Started against the declaration alone, the profile mount fell back to
    // a directory `control` never uses, and DecoderPro wrote a roster nobody
    // backs up.
    for (const file of ["jmri/compose.yaml", "README.md"]) {
      const text = readFileSync(new URL(file, root), "utf8");
      expect(text, file).toContain(
        `--env-file ${DECLARATION} --env-file ${DEPLOYMENT}`,
      );
      expect(text, file).toContain(`. ${DEPLOYMENT} && mkdir -p "$TC49_STORE/jmri"`);
      expect(text, file).not.toContain("~/tc49");
    }
  });
});

describe("a stack started without the box's declaration", () => {
  it("is told so rather than coming up half named", () => {
    // `${BOX_DOMAIN}` unset is a door that cannot say which kind of box it
    // is. Empty is a box with no certificate, so the guard refuses unset and
    // admits empty: `?`, not `:?`. The gate runs compose over both.
    for (const file of ["compose.yaml", "jmri/compose.yaml"]) {
      const text = readFileSync(new URL(file, root), "utf8");
      expect(text, file).toContain(`--env-file ${DECLARATION}`);
      expect(text, file).toMatch(/\$\{BOX_DOMAIN\?/);
      expect(text, file).not.toMatch(/\$\{BOX_DOMAIN:\?/);
    }
  });
});

describe("the UI ports", () => {
  /** README's table, one row per entry point: `[label, entry point, port]`,
   *  with no label for the page's row. */
  const readme = readFileSync(new URL("README.md", root), "utf8");
  const table = [
    ...readme.matchAll(/^\| (?:`([a-z]+)`|\(the page\)) \| `([a-z]+)` \| (\d+) \|$/gm),
  ].map(([, label, entryPoint, port]) => [label, entryPoint!, Number(port)] as const);
  const uis = table.filter(([label]) => label !== undefined);

  it("are a table in the README, the page's 80 and one row per label", () => {
    expect(table[0]).toEqual([undefined, "web", 80]);
    expect(uis.length).toBeGreaterThan(0);
    // The entry point is named after the label, which stacks in other
    // repositories rely on.
    for (const [label, entryPoint] of uis) expect(entryPoint).toBe(label);
  });

  it("are what the door opens and publishes, on every box", () => {
    const opened = doorWith({ BOX_DOMAIN: "" }).flags.flatMap((flag) => {
      const at = flag.match(/^--entryPoints\.([a-z]+)\.address=:(\d+)$/);
      return at ? [[at[1], Number(at[2])]] : [];
    });
    expect(opened).toEqual(table.map(([, entryPoint, port]) => [entryPoint, port]));
    for (const [, , port] of table) {
      expect(installation.services.door.ports).toContain(`${port}:${port}`);
    }
  });

  it("are what the page links on a box with no certificate", () => {
    const hostname = join(stub, "hostname");
    writeFileSync(hostname, "shed\n");
    const html = spawnSync(fileURLToPath(new URL("page/render.sh", root)), {
      env: {
        PATH: "/usr/bin:/bin",
        BOX_DOMAIN: "",
        BOX_UIS: uis.map(([label]) => label).join(" "),
        HOSTNAME_FILE: hostname,
      },
      encoding: "utf8",
    }).stdout;
    const linked = [...html.matchAll(/<a href="http:\/\/shed\.local:(\d+)"[^>]*>([a-z]+)<\/a>/g)].map(
      ([, port, label]) => [label, Number(port)],
    );
    expect(linked).toEqual(uis.map(([label, , port]) => [label, port]));
  });

  it("each reach the box's own requests", () => {
    expect(labels(installation.services.box)["traefik.http.routers.box-http.entrypoints"]).toBe(
      table.map(([, entryPoint]) => entryPoint).join(","),
    );
  });
});
