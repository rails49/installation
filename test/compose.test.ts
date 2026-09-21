/**
 * The compose files as data: what never reaches the page.
 *
 * Whether Traefik actually routes with these labels is not covered here and
 * deliberately so — a wrong label parses and asserts fine. That is caught by
 * reaching every name on a real box, which is a step of the cutover and is
 * written as one rather than dressed up as automation. What is worth holding
 * here is what a reader cannot see is wrong: a network named by the project
 * rather than fixed, a mount one character away from binding an inode, a door
 * with no redirect, an ACME resolver left to whatever the box's router
 * answers.
 *
 * The files are read as written, with `${BOX_DOMAIN}` and the rest still in
 * them: what is asserted is that the declaration is where those values come
 * from.
 */

import { readFileSync } from "node:fs";

import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

/** The fixed name four repositories hardcode (ADR-0001). It is the expensive
 *  half of that decision and the one thing here that cannot quietly change. */
const NETWORK = "rails49";

/** How the box's declaration reaches a compose file. Every stack on the box is
 *  started against this one path, so two stacks cannot come to different
 *  answers about the box's name. */
const DECLARATION = "/etc/rails49/box.env";

/** A compose file, read as written. Its shape is the file's rather than
 *  anything this repository declares, so the assertions below are what say
 *  which parts of it are load-bearing. */
type Compose = any;

function compose(path: string): Compose {
  return parse(readFileSync(new URL(path, root), "utf8"));
}

const installation: Compose = compose("compose.yaml");
const jmri: Compose = compose("jmri/compose.yaml");

/** A service's labels, as a map. Compose takes either form; these files use
 *  the list, and a test that read only one form would pass on a file that had
 *  quietly changed to the other. */
function labels(service: Compose): Record<string, string> {
  const declared: string[] | Record<string, string> = service.labels ?? [];
  if (!Array.isArray(declared)) return declared;
  return Object.fromEntries(
    declared.map((label) => {
      const at = label.indexOf("=");
      return [label.slice(0, at), label.slice(at + 1)];
    }),
  );
}

/** The door's command line, which is the whole of its static configuration. */
const door: string[] = installation.services.door.command;

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
      jmri.services.jmri,
    ]) {
      expect(service.networks).toEqual([NETWORK]);
    }
  });

  it("is named again on every container the door reaches", () => {
    // Each sits on two networks and the docker provider otherwise picks
    // whichever container address it finds first, which is a route that works
    // until it does not (ADR-0001).
    for (const service of [installation.services.page, jmri.services.jmri]) {
      expect(labels(service)["traefik.docker.network"]).toBe(NETWORK);
    }
  });
});

describe("the door", () => {
  it("answers on 443 and redirects 80 to it", () => {
    expect(installation.services.door.ports).toEqual(["80:80", "443:443"]);
    expect(door).toContain("--entryPoints.web.address=:80");
    expect(door).toContain("--entryPoints.websecure.address=:443");
    expect(door).toContain(
      "--entryPoints.web.http.redirections.entryPoint.to=websecure",
    );
    expect(door).toContain(
      "--entryPoints.web.http.redirections.entryPoint.scheme=https",
    );
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
    for (const service of [installation.services.page, jmri.services.jmri]) {
      expect(labels(service)["traefik.enable"]).toBe("true");
    }
  });

  it("takes the DNS provider from the box's declaration", () => {
    const provider = door.find((flag) =>
      flag.startsWith("--certificatesResolvers.le.acme.dnsChallenge.provider="),
    );
    expect(provider).toMatch(/\$\{BOX_ACME_PROVIDER/);
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
    // A secret in the declaration is a secret handed to `control`, `dccex` and
    // `occupancy` for no reason, so it lives in a second file at the same fixed
    // directory and this is the one service that reads it.
    const read = (service: Compose): string[] =>
      (service.env_file ?? []).map((entry: Compose) => entry.path ?? entry);
    expect(read(installation.services.door)).toEqual(["/etc/rails49/acme.env"]);
    expect(read(installation.services.page)).toEqual([]);
    expect(read(jmri.services.jmri)).toEqual([]);
  });

  it("watches containers and starts none", () => {
    expect(installation.services.door.volumes).toContain(
      "/var/run/docker.sock:/var/run/docker.sock:ro",
    );
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

  it("mounts the render script's directory, not the script", () => {
    // A single-file bind mount binds the inode, and `git pull` replaces a file
    // rather than writing through it, so a container mounted at the script
    // would go on rendering from the one it started with (control#353). It is
    // one character away from the mount that does not.
    expect(installation.services.page.volumes).toEqual(["./page:/page:ro"]);
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

describe("nothing here is built", () => {
  it("runs stock images and publishes none", () => {
    for (const service of [
      installation.services.door,
      installation.services.page,
      jmri.services.jmri,
    ]) {
      expect(service.image).toBeTruthy();
      expect(service.build).toBeUndefined();
    }
  });
});

describe("JMRI", () => {
  it("is a compose project of its own", () => {
    // Not a profile on the installation's own stack, which is what the README
    // beside it denies (ADR-0002).
    expect(jmri.name).toBe("jmri");
    expect(jmri.name).not.toBe(installation.name);
    for (const service of Object.values<Compose>(installation.services)) {
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

  it("is reachable at exactly one address, its label under the box's name", () => {
    const routers = Object.keys(labels(jmri.services.jmri)).filter((label) =>
      label.startsWith("traefik.http.routers."),
    );
    const named = new Set(routers.map((label) => label.split(".")[3]));
    expect([...named]).toEqual(["jmri"]);
    expect(labels(jmri.services.jmri)["traefik.http.routers.jmri.rule"]).toBe(
      "Host(`jmri.${BOX_DOMAIN:?start this with --env-file /etc/rails49/box.env}`)",
    );
  });

  it("names the port the door reaches, the image exposing three", () => {
    expect(
      labels(jmri.services.jmri)["traefik.http.services.jmri.loadbalancer.server.port"],
    ).toBe("6901");
  });
});

describe("a stack started without the box's declaration", () => {
  it("is told so rather than coming up half named", () => {
    // `${BOX_DOMAIN}` unset is an empty host rule: a door with a router for
    // no name, a certificate never asked for, and nothing saying why.
    for (const file of ["compose.yaml", "jmri/compose.yaml"]) {
      const text = readFileSync(new URL(file, root), "utf8");
      expect(text, file).toContain(`--env-file ${DECLARATION}`);
      expect(text, file).toMatch(/\$\{BOX_DOMAIN:\?/);
    }
  });
});
