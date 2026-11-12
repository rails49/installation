# Installing, updating and monitoring a box

Researched 2026-11-11. The question is `~/rails49/INSTALL.md`: how to install, update and monitor the software on a box (not rails49.org, which is served from the cloud), so that a person with no programming experience can do it. It also asks how `.r49` archives reach the box, and what this means for rails49/occupancy-service#62.

Repo claims cite `repo/path:line` at the commits pulled on 2026-11-11. Outside claims cite a numbered source [S…]; the list is at the end. "Unverified" means I found no primary source. Words follow `installation/GLOSSARY.md` and `.github/GLOSSARY.md`: box, installation, door, declaration, label, box name, installation page, stack.

## TL;DR

1. Today every stack is a git clone on the box, built on the box with `docker compose up --build`, and updated over ssh from a development machine by that repository's `deploy.sh`. No repository publishes a container image. Installing needs docker, git, a shell, a domain with a DNS API token, files under `/etc/rails49`, and, for `control`, node and pnpm on the box. It is not a path for a non-programmer.
2. Linux is the box the compose files are written for. The command station (USB serial), the camera (V4L2) and the GPU are device files, and turning the box off needs systemd as PID 1. Docker Desktop on macOS and Windows runs the stacks in a VM with no direct USB passthrough and no GPU for these containers, and the installation answers no to turning it off. It runs the simulator as is. It can run a box with hardware too, with the station's serial port kept on the host and carried to the VM over TCP or USB/IP, and the camera sent as a network stream (section 4, "OS independence"). Neither is built or tested, the classifier runs on the CPU there, and a computer that sleeps stops the railroad.
3. Starting point: a 64-bit Debian-family Linux (Ubuntu Server LTS on x86-64, Raspberry Pi OS 64-bit on a Pi) plus one install script. A prepared image, flashed with Raspberry Pi Imager or a disk writer, can come later and run the same script on first boot through cloud-init. An OS of our own with A/B updates (the Home Assistant OS or balenaOS shape) costs far more than this project needs now.
4. The hardest install step is not docker but the box name: a domain, A records and a DNS API token (org ADR-0018 rule 7). The domain buys a secure context, and what a box loses without one is small: the screen wake lock and one copy button. What stops a box with no certificate today is the door's configuration, which serves HTTPS only. rails49/installation#53 makes an empty `BOX_DOMAIN` mean a box with no certificate: each UI over plain HTTP on its UI port, at `<hostname>.local` or the box's address. Every box serves the UI ports. A label under a zone the project runs would also work, and puts the project in the path of every box's renewal.
5. Update: publish each stack's images to GHCR, named by commit as dccex ADR-0005 already does, for amd64 and arm64. One installation release is a manifest that pins every stack's images by digest, and the box runs the stacks it declares from that release. An updater container in the installation checks for a newer release, shows it, and applies it on a press, with the previous release kept for one-step rollback. Watchtower is archived (Dec 2025) and follows moving tags, which dccex ADR-0005 forbids.
6. Two recorded decisions change under prebuilt images: control ADR-0067 (the image carries the person's uid and is never pushed) and the installation's own "builds and publishes no image" line. A thin layer built on the box over the published image keeps ADR-0067's rule with no toolchain on the box.
7. Monitoring: necessary are each stack's state, versions, update available, disk, certificate expiry and whether the box name still resolves to the box. Useful are temperatures, the devices present, and a log bundle for an issue. Failures on the railroad already show in each UI's band (`.github/docs/OPERATING.md`), and the box's status should not repeat them. No compose file has a healthcheck or log rotation today.
8. Archives: the cloud page cannot reach a box (org ADR-0018 rule 5), so an archive goes through the person's device. Today it is copied to the box by hand. The box's own occupancy page already edits the archive in place (`occupancy-service/LIVE.md:248`), but cannot load a different one. One new route on the service, uploading a `.r49` that replaces the archive, closes the gap.
9. #62 works under every strategy. It needs additions only if images are published: build both architectures on native runners, publish to GHCR under the release, make the GPU settings in `compose.yaml` optional on a box with no GPU, and settle the AGPL detector in a published image.

## 1. What exists now

### The order and the pieces

| Stack | Repository | Images | How it gets on the box | Needs on the box |
| --- | --- | --- | --- | --- |
| installation (door, installation page, box) | `installation` | Stock `traefik`, `nginx`, `node`; nothing built (`installation/compose.yaml:84`) | README steps 1–5, by hand (`installation/README.md:95`) | docker, `/etc/rails49/box.env`, `/etc/rails49/acme.env`, A records, DNS API token |
| control | `control` | `nginx`, `mosquitto`, and one app image built on the box (`control/deploy/compose.yaml:146`) | `scripts/deploy.sh` over ssh: `git pull`, `pnpm --dir ui build`, `up -d --build` (`control/scripts/deploy.sh:58`, `:101`) | git, node and pnpm, `/etc/rails49/deploy.env`, `TC49_UID`/`TC49_GID` |
| dccex | `dccex` | `dccex:<commit>`, `dccex-ui:<commit>`, built on the box | `scripts/deploy.sh`: pull, clean tree, build under the commit, append to `/var/lib/rails49/deploys/dccex` (dccex ADR-0005 d.1–d.7) | git, a one-time clone, the station's `/dev/serial/by-id` path |
| JMRI | `installation/jmri/` | Stock `jsa1987/jmri-docker` with the uid renumbered, built on the box (`installation/jmri/Dockerfile`) | A second compose command by hand (`installation/README.md:208`) | `control`'s store directory |
| occupancy (service and page) | `occupancy-service` | Service and page images built on the box; the page pinned to an `occupancy` commit (`occupancy-service/compose.yaml:57`) | README "Box", by hand, five variables on the command line | the archive as a folder, the camera's `/dev/v4l/by-id` path, `video` and `render` group ids |

The installation runs first, since it creates the `rails49` network (installation ADR-0004). `control` runs second, since it owns the broker and the store and writes `TC49_STORE` to `deploy.env`, which JMRI reads. `dccex` and `occupancy-service` dial `broker:1883` and `store:8765`.

`occupancy-service/README.md:311` says the installation "runs `broker`". The broker is `control`'s (`control/deploy/compose.yaml:79`).

### Versions and releases

- No repository publishes a container image. CI in `occupancy-service` builds both images and tests them, and pushes nothing (`occupancy-service/.github/workflows/ci.yml`). `CommandStation-EX` stopped pushing its image (`CommandStation-EX/docs/adr/0007-…md:21`).
- Only libraries have release tags: `r49` (v0.4.0), `look` (v0.10.0), `detector` (v0.0.2), `classifier` (v0.1.0), checked with `gh api repos/rails49/<repo>/tags`. `control`, `dccex`, `installation` and `occupancy-service` have none. A box runs whatever `main` was at its last deploy.
- dccex is the one stack that can say what it runs and go back: the image name and its `org.opencontainers.image.revision` label carry the commit, a record on the box lists each deploy, and the previous image is kept (dccex ADR-0005 d.4–d.7).
- Every stock base image the stacks use publishes amd64 and arm64: `traefik:v3.7`, `eclipse-mosquitto:2`, `nginx:alpine`, `node:22-slim`, `python:3.12-slim`, `ubuntu:24.04` and `jsa1987/jmri-docker:stable` [S56]. The one amd64-only piece found is `intel-opencl-icd` in `occupancy-service/deploy/service.Dockerfile:10` [S40], which is #62's subject.

### Monitoring now

- Every service is `restart: unless-stopped`, and Docker is the only thing that starts the stacks at boot (`control/docs/DEPLOY.md`, "The layout server").
- No compose file in any repository declares a `healthcheck` or a `logging` section (grep over every `compose*.yaml`).
- Each UI's band names the failures of what it talks to, in red while they hold (`.github/docs/OPERATING.md`, "Rules"). `control` names a silent app. The occupancy service reports camera status, timings and the last MQTT messages in `latest` (`occupancy-service/LIVE.md`).
- The installation page is a file rendered once at start. It lists labels and asks neither the door nor the daemon (org ADR-0009, "What this amends in ADR-0007"). `GET /box` answers only whether the box can be turned off.

### Archives now

`GO.md` step 5 copies the archive to the box as a folder named `*.r49`, sets `OCCUPANCY_ARCHIVE`, and starts the stack. The occupancy page on the box then opens it from the service and saves back into the folder, file by file, under an `ETag` (`occupancy-service/LIVE.md:248`). A zip is served read-only (`occupancy-service/README.md:335`). A save that changes the archive's `id` is refused (`LIVE.md:280`). A hand edit takes effect at restart (`LIVE.md:288`). The cloud page saves a `.r49` to the person's own disk through the File System Access API or a download (`occupancy/ui/src/persistence.ts`).

## 2. Recorded decisions that bound the options

| Decision | What it requires | Where a strategy meets it |
| --- | --- | --- |
| org ADR-0018 rule 7 | An installation brings a name; the certificate comes from DNS-01 over a zone the operator controls. A CA on the box and `.local` were rejected (`:115`). | Every install path has to produce a name and a certificate. Let's Encrypt validates DNS-01 by a TXT record in public DNS [S44] and does not issue for names nobody owns [S43]; `.local` is link-local [S45]. rails49/installation#53 changes it with the box with no certificate (section 4). |
| org ADR-0018 rule 8 | The installation runs with no internet. | An update check fails quietly offline. No step of operation may need the cloud. |
| org ADR-0018 rules 5, 6 | Nothing from the cloud reaches an installation's data; one door per box. | No cloud page can push to a box. An updater's UI sits behind the door. |
| org ADR-0009, installation ADR-0002 | Each stack is its own repository and compose project. The installation knows names and nothing about builds. A box may run the installation and `dccex` only. | A release must let a box run a subset of stacks. |
| org ADR-0009 (amending ADR-0007) | The installation page asks neither the proxy nor the daemon, and is a file. | A status view that asks the daemon is not the installation page. It needs its own path or label. |
| installation ADR-0005 | Turning the box off needs systemd as PID 1; Docker Desktop answers no. | A box on Docker Desktop cannot be turned off from its page. |
| control ADR-0042 | The LAN is the trust boundary; no authentication. | An update button on the LAN can be pressed by anyone on it, as turning the box off can. |
| control ADR-0067 | The app image carries the store's uid, set at build; "Images are built on the box and never pushed anywhere" (`:59`). | Prebuilt images conflict with it. Section 5.4. |
| dccex ADR-0005 | One image per commit; the name never moves; "Nothing on a box runs `latest`" (`:46`); a record; one step back kept. | Rules out tools that follow a moving tag. Fits a digest-pinned release. |
| control ADR-0075 | `dccex` takes `tc49` from control `main` (`:9`), dials `broker` and `store`, routes to `tc49-mqtt`. | Stacks depend on each other at run time. Updating one alone can break another. |
| org ADR-0022 rule 5 | Each consumer pins `r49`; an older reader refuses a newer archive. | The box's service lags the cloud page until the box updates. Today the page pins 0.3.0 (`occupancy/pnpm-workspace.yaml:9`), the service 0.4.0 (`occupancy-service/pyproject.toml:15`). |

## 3. Starting point of a fresh install

| Option | What the person starts with | For | Against |
| --- | --- | --- | --- |
| A. Linux with Docker Engine already running (today) | A box someone has set up | Nothing to build. Matches every compose file now. | The person has to install Linux and Docker first. Docker's convenience script "isn't recommended for production environments" [S6]. |
| B. Plain Linux plus one script | Ubuntu Server or Raspberry Pi OS 64-bit, installed by the vendor's own installer or Imager | One path for x86-64 and arm64. The distro's installer and update system do the OS. Ubuntu Server applies security updates by default [S48]. Docker Engine supports arm64 on Debian and Ubuntu [S7]. | The person installs an OS and types one command at a console or over ssh. |
| C. Prepared image of our own, built on Ubuntu or Raspberry Pi OS | An image flashed to an SD card or disk | No command typed. Raspberry Pi Imager lists third-party images from a custom repository JSON (`--repo`, or a setting in Imager 2.0) and sets hostname, user, Wi-Fi and SSH [S33][S34][S35]. Raspberry Pi OS on Trixie has begun moving that first-boot setup to cloud-init [S36]; cloud-init's NoCloud source reads user-data from a volume labelled `CIDATA` [S37], so the same script can run on first boot. | An image per board family to build, test and host. x86 needs a disk-writing step like Home Assistant's, which boots a live USB to write the image [S28]. |
| D. An OS of our own with A/B updates (Home Assistant OS shape) | An image flashed as in C | The OS and the apps update as one, with automatic fallback when the new slot does not boot (RAUC [S24][S46], Mender [S47]). | We would maintain an embedded Linux distribution per board. Home Assistant does this with a dedicated team and has dropped other install methods to afford it [S27]. |
| E. balenaOS | A balenaOS image tied to a balenaCloud fleet | A/B host OS updates with rollback [S29][S30], container delta updates [S32], fleet monitoring. | Every box joins a cloud fleet; free for the first ten devices [S31], or self-hosted openBalena [S31]. A project whose users each run one box would own or require a fleet. Whether `pid: host` and the privileged `box` service work there: unverified. |
| F. Docker Desktop on macOS or Windows | The person's own computer | Familiar installer. The simulator runs unchanged. Hardware is reachable through the workarounds in section 4, "OS independence". | No direct USB passthrough [S2]; USB/IP since 4.35 [S66], or the serial port kept on the host. GPU only NVIDIA on WSL2 [S1]. PID 1 is Docker's VM, so the box cannot be turned off (installation ADR-0005). Licence free only for personal use and businesses under 250 employees and $10M revenue [S4]. A computer that sleeps or is carried away stops the railroad. |
| G. A third-party home-server platform (CasaOS, Umbrel) | Their script or OS | An app store and a UI exist. CasaOS installs by `curl … \| sudo bash` [S22]; umbrelOS is its own OS and cannot go on an existing Linux [S23]. | Their door, their update rules and their app format. The door, the box name and the shared network are the installation's (org ADR-0009). |

B is the base to build on. C is B packaged, worth doing once B is stable. F runs the simulator today, and a box with hardware after the work in section 4, "OS independence".

## 4. The first install

### What each method asks of the person

| Method | The person | Prerequisites | Notes |
| --- | --- | --- | --- |
| Prose (today) | Reads and types about a dozen commands as root, edits two files, writes DNS records, repeats per stack | Shell, sudo, a text editor, a DNS provider account | Intentional: "this is what is about to happen to your box, and you can read it before it does" (`installation/README.md:97`). |
| One-line script | Types `curl -fsSL <url> \| sh` on the box, answers a few questions | A Debian-family Linux and network | The script installs Docker Engine from Docker's apt repository rather than the convenience script [S6], writes `/etc/rails49/*`, and starts the installation and the chosen stacks. The README stays the prose of what the script does. |
| Installer container | Types `docker run … ghcr.io/rails49/setup` | Docker already running | The container needs the Docker socket and a bind mount of `/etc/rails49`. The socket gives root on the box [S16]. It saves nothing over the script on a box with no Docker. |
| Setup in the browser | Runs the script or flashes an image, then opens a setup page | A second device, or a browser on the box | Before a name and certificate exist, the setup page is plain HTTP at the box's address or an mDNS `.local` name [S45]. That is a period outside "one door per box" and the certificate rule, and needs a decision. Below. |
| A cloud URL | Fills a form at rails49.org that produces the answers (box name, labels, stacks), then pastes a code or file into the box's setup | A browser | rails49.org never reaches the box (org ADR-0018 rule 5). It can hand out a name (below) and write the declaration for the person to carry over. |

### Setup from a page

The script, or a prepared image, starts only the updater container of section 5.3. Its page asks for the box name or none, the DNS provider and token when there is a box name, and the stacks to run. On confirm it writes `/etc/rails49`, pulls the release and starts the stacks. The same page then shows status and updates.

Before setup the box has no box name. Ways to reach the page the first time:

| Way | Works when | Notes |
| --- | --- | --- |
| The script prints `http://<address>` and `http://<hostname>.local` | It ran from a terminal | Covers the script path. |
| `http://localhost` on the box | The box has a screen and a browser | `localhost` is a secure context [S43], and the DNS token does not cross the LAN. |
| The box's screen shows the address and a QR code | A prepared image with a monitor | A phone scans it. |
| The router's list of connected devices | The person can log in to the router | Hard for a non-programmer. |
| A finder page on rails49.org | The box has internet | The box reports its LAN address and the page lists the boxes behind the same public address. Synology and Philips Hue do this (unverified). The project then runs a service and sees public addresses. |
| `http://<hostname>.local` | The client resolves mDNS | Varies by client; see below. |

An address printed or shown changes when the router hands out another. The setup page tells the person to reserve the box's address in the router. With a box name, the DNS token crosses the LAN once in plain HTTP, which control ADR-0042's trust boundary allows and a decision should state.

### The box name

Docker is a solved step. The box name is not: a domain, an A record per label holding the box's LAN address, and an API token for the DNS provider (`installation/README.md:100`).

#### What the name buys

A certificate the browser trusts, so the page has a secure context. The UIs use these features of one:

| Feature | Where | Without it |
| --- | --- | --- |
| Camera, `getUserMedia` | `occupancy/ui/src/capture.ts:22` | Not used by the box copy, which runs in service mode: "Plain HTTP is enough" (`occupancy/README.md:69`). Labelling with a phone's camera is on rails49.org, which has its own certificate. |
| Screen wake lock | `control/ui/src/ui/wake.ts` | Does nothing, by design. A phone that sleeps while holding a train stops sending `throttle_alive`, and `layout` releases the train: it stops in `manual` and keeps its speed to the end of its move in `automatic` (control ADR-0079, ADR-0081). The person sets a longer screen timeout on the phone. |
| Clipboard write | "Copy the key" on `control`'s backup tab (`control/ui/src/ui/tc-backup.ts:481`) | Fails with no message; the store's public key stays on screen to select. `document.execCommand("copy")` would work over plain HTTP. |
| Save-file picker | `occupancy/ui/src/persistence.ts:278` | Falls back to a download. |
| Cross-origin isolation, threaded WASM | `occupancy/ui/src/detectorSession.ts:44` | Not used in service mode: the model runs on the server. |

Not affected: `control` and `dccex` open `ws://` from an HTTP page and `wss://` from an HTTPS one (`control/ui/src/model/session.ts:178`, `dccex/ui/src/framing.js:84`). `control` mints throttle ids with `getRandomValues` because `randomUUID` is missing over plain HTTP (`session.ts:258`). The store's origin rule compares `Origin` with `Host`, not scheme with scheme (`control/src/tc49/lib/origin.py`). JMRI's noVNC works over plain HTTP and shows a banner, "Running without HTTPS is not recommended": the image starts its VNC server with no authentication, and only noVNC's RSA-AES authentication needs `crypto.subtle` (rails49/installation#53).

What does stop a box with no certificate is the door. Every router is on the `websecure` entry point with a certificate resolver (`control/deploy/compose.yaml:65,114,209`, `dccex/compose.box.yaml:73`, `installation/jmri/compose.yaml:70`, `occupancy-service/compose.yaml:45,63`), and port 80 only redirects (`installation/compose.yaml:58-60`). ADR-0004's "`control`'s run view loses its socket" comes to this configuration.

The name also gives one origin per UI under one readable name, and the same name for ssh and deploy (org ADR-0007).

#### What the name costs

- A domain, a DNS provider with an API token, and an A record per label.
- The A record holds a LAN address, which changes when the router hands out another; `GO.md` records the box's address differing from the one `control`'s docs give. Reserving the address in the router avoids it.
- Name resolution needs the internet unless the router answers for the name (org ADR-0018 rule 8). A phone cannot have a `hosts` line (control ADR-0042).
- Many routers and resolvers block a public name that resolves to a private address, as DNS rebinding protection. Plex users meet it with `plex.direct`, and the fix is an exception in the router or turning the protection off [S60][S61]. Today's A records holding a LAN address meet the same block. Which routers block by default: unverified.
- The names and the private address are public, in DNS and in the certificate transparency logs (control ADR-0042).

#### Ways to a name, or none

| Way | The person | Secure context | Against |
| --- | --- | --- | --- |
| A. The operator's own zone (today) | Buys a domain, gets a token, writes records | Yes | The step above. Traefik's ACME client carries every provider (`installation/compose.yaml`, `dnsChallenge.provider`). |
| B. No certificate: plain HTTP on a UI port per label (rails49/installation#53) | Nothing | No | Loses the features above. Nothing outside the house. |
| C. A label under a zone the project runs, e.g. `<railroad>.box.rails49.org` | Picks a name | Yes | Below. |
| D. A certificate authority on the box | Installs a root certificate on every phone | Yes | Rejected in org ADR-0018: "that step is where people stop". |
| E. Tailscale and its `ts.net` certificates | Installs Tailscale on the box and every phone | Yes | An app and an account on every device; a third party in the path. |
| F. nip.io or sslip.io | Nothing | No | These answer a name with the address written in it: `192-168-1-20.nip.io` is `192.168.1.20` [S58]. A certificate for such a name comes "typically through the HTTP-01 challenge" [S58], which Let's Encrypt cannot run against a LAN address, and DNS-01 needs a TXT record in their zone. They issue no wildcard: theirs was revoked after its private key was published [S58]. Two people run both, with no service commitment [S58]. They give a name in place of an address and nothing more, and meet DNS rebinding protection as A does. |

#### A label under a zone the project runs

One development box is named this way today (org ADR-0011). It needs:

1. DNS records for the label and its UIs, holding the box's LAN address, written when the box registers.
2. A way for the box to answer the DNS-01 challenge without a credential for the whole zone. The project runs an acme-dns server, which answers ACME DNS challenges through a small API so that no zone credential leaves the project [S54]. Each box name gets a CNAME of `_acme-challenge` to its acme-dns account, and Traefik's ACME client supports it as provider `acmedns` [S55]. A small function that writes the TXT record for a box that proves it is that box does the same.
3. Rate limits: Let's Encrypt issues up to 50 certificates per registered domain every 7 days, and renewals are exempt [S57]. Enough for this project.

Plex does this for its servers under `plex.direct`: a per-server wildcard, issued through a partnership with DigiCert, and names that resolve to the server's LAN address [S59].

One wildcard for `*.rails49.org` shared by every box does not work. It covers one label, so `control.<railroad>.rails49.org` is outside it [S62]. Every box would hold its private key, so anyone who installs could pose as any `*.rails49.org` host, including `occupancy.rails49.org`. A CA revokes a certificate within 24 hours of learning its key is compromised [S63], and that stops every box at once. Renewal would still push a new key to every box. The working form is a wildcard per box, `*.<railroad>.box.rails49.org`, obtained by the box over DNS-01, with the key never leaving it.

What has to be up, and when:

| | A. Own domain | C. Project zone | B. No certificate |
| --- | --- | --- | --- |
| To start a train | Public DNS for the domain, unless the router answers | Public DNS for the project's zone, unless the router answers | Nothing outside the house |
| Every ~60 days, to renew | The operator's DNS provider's API | The project's acme-dns or function | Nothing |
| If that is down | Trains run until the certificate expires, about 30 days after renewal starts | Same | n/a |
| One mistake stops every box | No | Yes: a lapsed domain, a closed account, a bad change | No |

C adds nothing to name resolution if the zone is with a large DNS provider; where rails49.org's DNS is hosted: unverified. The new dependency is renewal, with about 30 days of slack, which shrinks as Let's Encrypt shortens certificate lifetimes (schedule unverified). The real cost is the last row. A zone of its own, apart from rails49.org, keeps a mistake there off the project's own sites.

#### A box with no certificate: one UI port per label

rails49/installation#53 has the decisions. In short:

- `BOX_DOMAIN=`, set and empty, means a box with no certificate. An unset `BOX_DOMAIN` is still refused.
- The installation owns the table of UI ports: the page 80, `control` 8081, `dccex` 8082, `jmri` 8083, `occupancy` 8084.
- The door's command builds Traefik's flags and execs it. With a box name it adds `websecure`, the certificate resolver and the redirect on port 80. With none, port 80 serves the page.
- Every box serves the UI ports, so a box with a box name stays reachable when DNS or the certificate fails. Each stack declares a router per UI port beside its `Host()` routers. On a box with no certificate, Traefik drops the `websecure` routers with an error in its log and serves the rest, so no compose file is split by kind of box.
- The installation's part merges first; `control`, `dccex` and `occupancy-service` each get a child issue for their routers and origin rule.

Ports rather than labels under `.local`:

| Way | For | Against |
| --- | --- | --- |
| Labels under `.local`, `control.<hostname>.local` | The door's `Host()` rules stay. | Avahi publishes only `<hostname>.local` by default; more names go in `/etc/avahi/hosts`, one line each [S65], rewritten when the address changes. Linux's `nss-mdns` rejects names of more than two labels in its recommended setup: "If the request has more than two labels, it is rejected" [S64]. Android and Windows: unverified. |
| A UI port per label, `http://<hostname>.local:8081` | Works at `<hostname>.local`, which Avahi publishes by default, and at the bare address. One origin per UI, as the origin rules need. | Ports to remember; the installation page links them. |
| A path per UI, `http://<box>/control/` | One port. | Rejected in org ADR-0007: one origin for every UI, and each app built under a prefix. |
| nip.io names, `control.192-168-1-20.nip.io` | Labels with no mDNS. | Internet and a third party in the path, DNS rebinding protection, a URL that changes with the address. |

The door's refusal of a foreign `Origin` on `/mqtt` matches a fixed origin built from `BOX_DOMAIN` (`control/deploy/compose.yaml:119`, `dccex/compose.box.yaml:78`, which admits only `https://`). On a box with no certificate the box's address is not known when the rule is written. #53 admits only an `http://` origin on the UI's own port whose host is a `.local` name or an RFC 1918 IPv4 address, which no page on the internet can have. A page served by another host on the LAN at the same port passes, as control ADR-0042's trust boundary allows.

### OS independence

The compose files are written for Linux: USB serial for the station (`dccex/compose.box.yaml:160`, `/dev/serial/by-id`), V4L2 for the camera (`occupancy-service/compose.yaml:33`), `/dev/dri` for the GPU, systemd for turning off. On macOS and Windows, Docker Desktop runs everything inside a VM [S5] with no direct USB passthrough [S2] and no GPU for these containers [S1]. `control`'s `sim` profile and the installation run there unchanged. A box with hardware runs there only through one of the ways below. None is built or tested.

Each device, and what reaches it from Docker Desktop:

| Device | Today | Way on macOS or Windows | Cost |
| --- | --- | --- | --- |
| Command station | `mirror` opens the serial device and repeats it on TCP 2560; the translator dials `mirror:2560` (`dccex/compose.box.yaml:86`, `:255`). Everything else talks to 2560. | A. Run `mirror` on the host, not in a container, and point the translator at `host.docker.internal:2560`. | `mirror` opens the device with `os.open` and `termios` (`dccex/src/dccex_usb/station.py:82`, `:192`). macOS has both; Windows has no `termios`, so on Windows this needs a port of `station.py`. Firmware flashing runs esptool on the host, which esptool supports. A second way to install and update `mirror`, outside the release. |
| | | B. A serial-to-TCP bridge on the host (`socat` on macOS; a pyserial or com2tcp bridge on Windows), and in the container `socat` turning that TCP port back into a pty that `mirror` opens unchanged. | No change to `mirror`. Flashing does not work: esptool cannot flash a pty (`dccex/src/dccex_usb/firmware.py:36`). Two more processes to keep running. |
| | | C. USB/IP into Docker Desktop's VM, Docker Desktop 4.35 or later, on macOS and on Windows with the Hyper-V backend, not WSL2 [S66][S67]. | Needs a USB/IP server on the host. Windows has usbipd-win [S3]; macOS has no complete server [S68]. The attach runs from a privileged container that must keep running, and is repeated after every restart [S66]. Whether the VM's kernel has the `ch341` driver the station's `1a86` adapter needs: unverified. |
| | | D. A command station with WiFi or Ethernet, which DCC-EX offers on port 2560. | No USB at all. `mirror` takes a device path only (`dccex/src/dccex_usb/__main__.py:210`), so it needs B's pty or a TCP mode of its own. Flashing still needs USB. |
| Camera | The service runs ffmpeg with `-f v4l2` on a `/dev/v4l/by-id` path (`occupancy-service/src/occupancy_service/capture.py:131`). | A network stream: an IP camera, or ffmpeg or mediamtx on the host serving the USB camera. ffmpeg in the container reads RTSP or HTTP. | A change to `capture.py` and `--camera` to accept a stream URL. A second process on the host for a USB camera. |
| GPU | `/dev/dri` and OpenVINO on an Intel GPU, chosen by `--engine` (`occupancy-service/src/occupancy_service/__main__.py:70`). The default engine is onnxruntime on the CPU (`occupancy-service/src/occupancy_service/l1.py:82`). | The CPU, with onnxruntime. Docker Desktop gives a container no GPU on macOS and only NVIDIA on WSL2 [S1]. Podman with the libkrun provider gives containers on Apple silicon a Vulkan GPU translated to Metal [S69]. Running the service on the host, not in a container, reaches Apple's GPU through onnxruntime's CoreML execution provider [S70]. | CPU scoring is slower; whether fast enough for a layout: unverified. Neither onnxruntime's Linux build nor OpenVINO is known to use Podman's Vulkan device: unverified. OpenVINO's GPU plugin is for Intel GPUs only [S41]. |
| Turning off | The `box` service, PID 1 being systemd (installation ADR-0005). | None. Docker Desktop's PID 1 is its VM. | The installation page answers no, as it does today. |

Two things no way above changes. A computer that sleeps, or is carried away, stops the railroad. And a box on Docker Desktop is a second kind of box: its own compose overrides, its own install steps, and tests on both operating systems. A Mac kept running for the railroad and not used for Linux is where this would pay for itself.

A full Linux VM on the Mac or PC is the other way round: UTM with QEMU, Parallels, VMware Fusion or Workstation, and VirtualBox pass a USB device through to the guest (unverified per product), and the guest is a Linux box as in section 3, B. It needs bridged networking so phones reach it. There is no GPU in the guest. Lima, colima and OrbStack have no USB passthrough (unverified).

## 5. Updates

### 5.1 How the box learns of an update

| Source | For | Against |
| --- | --- | --- |
| GitHub Releases, `GET /repos/{owner}/{repo}/releases/latest` [S19] | Exists, no server to run. | 60 unauthenticated requests per hour [S20]; one check a day is far below. |
| A static file on rails49.org, as Home Assistant's Supervisor reads `version.home-assistant.io/{channel}.json` [S26] | Channels (stable, beta) are one file each. Served from the cloud the project already runs. | One more thing to publish per release. |
| The registry itself (tags on GHCR) | No extra file. | Says what exists, not what was tested together. |

Either way the box asks, the answer is a release number and a manifest, and an offline box shows "could not check" (org ADR-0018 rule 8). A check reveals the box's public address to GitHub or rails49.org.

### 5.2 Granularity

| Unit | For | Against |
| --- | --- | --- |
| Per container | Smallest change. | Containers of one repository share one image and one commit (dccex ADR-0005 d.2, control's one app image). |
| Per stack (repository) | Matches how the code is owned (org ADR-0009). dccex already versions this way. | Stacks depend on each other at run time (control ADR-0075; occupancy's `control` profile; JMRI's profile in `control`'s store; `r49` pins). Per-stack updates reach combinations nobody tested, and the person has to know the order. |
| One installation release | One number to read and report. CI can start every stack of a release together. The person makes one choice. | A release process to run, and a fix in one stack waits for, or makes, a release. |

The installation release can list every stack and still let a box run a subset: the box declares which stacks it runs, as it declares its labels in `BOX_UIS`.

### 5.3 Mechanisms

| Mechanism | How it works | For | Against |
| --- | --- | --- | --- |
| Build on the box (today) | `git pull` and `up --build` per clone | Nothing to publish. The image carries the uid (control ADR-0067). | Toolchains on the box (`pnpm` for `control`). Slow on a Pi. Two boxes on the same commit can build different images. Updating is ssh from a development machine. |
| Pull prebuilt images by digest | CI publishes to GHCR; the box pulls `image@sha256:…` [S11][S10] | No toolchain on the box. What runs is what CI tested. Public GHCR images pull anonymously [S10]. One tag holds both architectures [S10]. | Changes control ADR-0067 and the installation's "publishes no image" (5.4). |
| Watchtower | Polls registries, recreates containers on a new image | No code of ours. | Archived on 2025-12-17, "no longer maintained" [S17]. Follows moving tags per container, which dccex ADR-0005 d.1 forbids. |
| Podman auto-update | `io.containers.autoupdate=registry` on containers run by systemd units; rolls back a unit that fails to start [S18] | Rollback built in. | Podman and systemd units in place of Docker Compose for every stack. Per container, tag-based. |
| An updater container (Home Assistant Supervisor shape) | A container in the installation, with the Docker socket, that reads the release manifest, pulls every image first, brings stacks up in order, checks them, and records what it did. The Supervisor updates Core, OS, apps and itself this way [S25]. | Update and rollback from a page. Generalises dccex ADR-0005's record and one-step-back rule to every stack. | Code we write and test. The socket gives root on the box [S16]; the `box` service is already privileged (installation ADR-0005). |
| A release as a Compose OCI artifact | `docker compose publish`, then `docker compose -f oci://… up` [S13] | The compose files travel with the release; no clone on the box. | The installation and `control` bind-mount directories from their clones (`installation/compose.yaml`, `./page`, `./box`, `./look`; `control/deploy/compose.yaml`, `../ui/dist`). Those would move into images first. |
| A/B OS images (RAUC, Mender, balenaOS, Home Assistant OS) | Write the new system to the other slot, boot it, fall back if it is not marked good [S24][S29][S46][S47] | Covers the OS and Docker Engine too. | Section 3, D and E. |

A failing healthcheck marks a container unhealthy and does not restart it outside Swarm [S14]. An updater that wants to judge a new release has to read health itself.

Docker Engine updates can break the door: Traefik v3.3 and v3.4 asked for an API version that Docker Engine 29 had dropped, and every name served 404 (`installation/compose.yaml:28`). A release should name the Docker Engine versions it was tested on, and the box should report its own.

### 5.4 What prebuilt images change

- control ADR-0067: the app image carries the store's uid as a build argument so that ssh in the backup has a passwd entry. Three ways with a published image: run every box as one fixed uid; `nss_wrapper`, which ADR-0067 lists as an alternative; or build on the box only a thin layer `FROM ghcr.io/rails49/control@sha256:…` that adds the passwd entry, as `installation/jmri/Dockerfile` already does over a stock image. The third keeps the rule with a build of seconds and no toolchain.
- `control`'s UI is built on the host by pnpm (`control/scripts/deploy.sh:58`) and mounted into nginx. It moves into an image.
- The installation's `page` and `box` services run code mounted from the clone. With no clone on the box, that code goes into images or is fetched with the release.
- dccex ADR-0005 holds, with `ghcr.io/rails49/dccex:<commit>` as the name. Its record and one-step-back rule become the updater's for every stack.

### 5.5 Updating from the box's own UI

An updater can serve a page behind the door. Under control ADR-0042 anyone on the LAN can press it, as anyone can turn the box off (installation ADR-0005). An update stops every stack it changes, so trains stop. Whether it may run while track power is on is a question about `control`, and the installation knows nothing about railroads (org ADR-0009); the page can say that the update stops the railroad and leave the choice to the person.

Rollback is a press that brings back the previous release from images kept on the box. An update that fails to pull changes nothing, since every image is pulled before any container is recreated.

### 5.6 The OS

Ubuntu Server installs `unattended-upgrades` by default and applies security updates [S48]. Debian's default: unverified. Leaving the OS to the distro is simpler than an image of our own, and loses atomic rollback of the OS.

## 6. Monitoring

| Item | Necessary or useful | Source on the box | Why |
| --- | --- | --- | --- |
| Each stack: running, restarting, stopped | Necessary | Docker API | A stack that is down is the one failure no band reports: its own UI does not load. |
| Release and per-stack version | Necessary | The release record; `org.opencontainers.image.revision` [S21] | The first question in any issue. |
| Update available, last check | Necessary | Updater | Section 5.1. |
| Disk free | Necessary | `statfs` | The json-file log driver does not rotate by default [S15]; kept images grow. journald caps itself at 10% of the file system, at most 4G [S49]. Set rotation in `daemon.json` or per service, and prune images beyond one step back. |
| Certificate expiry; the box name resolving to this box | Necessary on a box with a domain | The door's `acme.json`; a DNS lookup against the box's own address | A renewal that failed, an A record left at an old address, or a router blocking the name as DNS rebinding makes every UI unreachable. |
| The box's address, and whether the router reserves it | Useful on a box with no certificate | The box's interfaces | The links people saved hold the address. |
| Camera and command station present | Useful | `/dev/v4l/by-id`, `/dev/serial/by-id` [S52][S53] | Bands already say "camera lost" or "link down" (`.github/docs/OPERATING.md`). The box view can say which device is missing. by-id names exist only for devices that report a serial [S53]. |
| Engine and device the classifier runs on | Useful | `latest`, once #62 adds it | Says whether the GPU is in use. |
| Temperatures, throttling | Useful | `/sys/class/thermal/thermal_zone*/temp` [S50]; `vcgencmd get_throttled` on a Pi [S51] | A Pi that throttles scores fewer frames. |
| Docker Engine version | Useful | Docker API | Section 5.3. |
| Logs | Useful | `docker logs` | A button that downloads a bundle: versions, the declaration, the last logs of each container. The declaration has no secret by design (`installation/README.md`, "The box declaration"); `acme.env` is never in it. |

Not needed: a metrics database, graphs, push notifications. `.github/docs/OPERATING.md` has no sound and no push notification, and a failure shows while it holds.

A non-programmer sees this on one page on the box. The installation page cannot hold it, since it asks neither the door nor the daemon (org ADR-0009). Two places fit: a path under `/box`, which the `box` service already answers on every name (installation ADR-0005), or a label of its own. It uses look's band and states a failure in a plain sentence, as org ADR-0018 rule 10 asks of a UI.

## 7. Archives

### How one gets from rails49.org to the box

The cloud page cannot write to a box: nothing from the cloud reaches an installation's data (org ADR-0018 rule 5), and an HTTPS page on rails49.org cannot call a LAN service on another origin. An archive passes through the person's device.

| Option | The person | Change needed | Against |
| --- | --- | --- | --- |
| A. Copy by hand (today) | Copies a folder to the box, sets `OCCUPANCY_ARCHIVE`, restarts | None | Needs a shell. |
| B. Upload on the box's page | Saves the `.r49` from the cloud page, opens the box's occupancy page, chooses "Put on the service" | A route in `LIVE.md` that takes a `.r49` zip, writes it into the archive folder, accepts a new `id`, and reloads. Today a change of `id` is refused (`LIVE.md:280`). | One archive per service stays, so a second layout replaces the first. |
| C. Several archives on the service | Picks one on the box's page | `LIVE.md` gains a list and a choice; the service's one `--archive` becomes a directory | The service is "one archive and one camera" (`occupancy-service/GLOSSARY.md`). |
| D. Archives as documents in `control`'s store | Loads them as railroads are loaded | The service reads from the store | Ties the service to `control`; `.github#60` says the service code names no controller. |
| E. Do the work on the box's page | Makes and edits the archive on the box's page from the start | None | The box's page is the same build as the cloud page at a pinned commit (`occupancy-service/compose.yaml:57`); a phone's camera needs the box's certificate, which a box with no certificate does not have. |

### Changing the archive on the box

Already possible: the box's page saves back into the folder with `If-Match`, and a saved manifest reloads the classifier with no restart (`LIVE.md`, "After a save"). Freeze adds the current frame to the archive (`occupancy/README.md`). A download is Save As. Not covered: a backup. `control`'s store is backed up by git (control ADR-0053), and the archive folder is not in it unless the person puts it under `TC49_STORE`.

### Versions

Under org ADR-0022 rule 5 an older reader refuses an archive with keys it does not know. The cloud page is newest; the box's service is as new as the box's last update. A release should move the service's `r49` pin with the page's, and the refusal should reach the person as a sentence on the box's page.

## 8. Issue #62

#62 makes one Dockerfile and one `compose.yaml` for every box: the Intel GPU runtime only on amd64, the image building for arm64, and `--engine`/`--device` chosen at start, with the GPU taken only when it is listed and the model loads.

| Strategy | Effect on #62 | Change to #62 |
| --- | --- | --- |
| Build on the box (today) | Each box builds for its own architecture, so `TARGETARCH` alone is enough. | None. |
| Published images | One tag must hold amd64 and arm64 [S10][S8]. QEMU emulation is "much slower" than native builds [S8]; GitHub's `ubuntu-24.04-arm` runner is free on public repositories [S9]. This answers #62's open question 2. | Add: CI builds each architecture on a native runner and publishes one multi-architecture image to GHCR, named by commit, with the revision label. Acceptance: the published manifest lists both. |
| Docker Desktop (macOS, Windows) | No Intel GPU: Docker Desktop's GPU support is NVIDIA on WSL2 only [S1]. OpenVINO documents `/dev/dxg` for plain Docker inside WSL2, not Docker Desktop [S38]. The camera is a USB device, and Docker Desktop has no direct USB passthrough [S2]. The service scores frames only from a network stream, which `capture.py` does not read today (section 4, "OS independence"). | None. The engine is onnxruntime on the CPU, as on any box with no GPU. |
| Prepared image or script | The script finds the `video` and `render` group ids that `compose.yaml` now requires (`occupancy-service/compose.yaml:17`). OpenVINO's own instructions take the group of `/dev/dri/render*` [S38], which is the same value. | Add: on a box with no `/dev/dri`, `compose.yaml` still starts. Today `RENDER_GID` is required with `:?`. |
| OS of our own, balenaOS | The image would carry the Intel runtime on x86 only. | None beyond the published-image row. |

Facts #62 relies on that hold:
- `intel-opencl-icd` in Ubuntu noble is amd64 only [S40]. Intel's compute-runtime README states GPU generations, not CPU architectures [S39].
- `openvino` 2026.4.1 publishes manylinux aarch64 wheels, which need glibc 2.35 or newer [S42]. Ubuntu 24.04 in the image has glibc 2.39 (unverified).
- OpenVINO supports inference on ARM CPUs; its GPU plugin is for Intel GPUs [S41]. `classifier/docs/research/hardware-v1.md:29` measured OpenVINO on a Raspberry Pi 4 CPU.

What #62 does not settle, and the install needs: which hardware is the tested list for a box. #62 lists only the Intel GPU path. Publishing arm64 means testing on an arm64 box. The `latest` field for engine and device that #62 adds is also a monitoring item (section 6).

A published service image with `DETECTOR_VERSION` set distributes `rails49-detector`, which is AGPL (`occupancy-service/deploy/service.Dockerfile:4`). Whether to publish that image, and what the AGPL then asks of it: unverified, and a decision.

## 9. Recommendation

1. Support one kind of box: a 64-bit Debian-family Linux on x86-64, and on arm64 only if the hardware question below says so. Say plainly that macOS and Windows run the simulator, and that a box with hardware there is possible through section 4's ways but not built, tested or supported.
2. Publish images. Each stack's CI builds its images on native runners for the supported architectures and pushes them to GHCR, named by commit, with the revision label (dccex ADR-0005 for every stack). `control` keeps its uid rule with a thin layer built on the box (5.4).
3. Release the installation as one unit. A manifest in `installation`, under a version tag, pins each stack's images by digest and names the tested Docker Engine versions. CI starts the release with the simulator before it is tagged. The box runs the stacks it declares from that release.
4. Install with one script. It installs Docker Engine from Docker's apt repository, starts the updater, and prints the address of its setup page. The page asks for the box name or none, and the stacks, writes `/etc/rails49`, and starts the release. The README stays the prose of what it does. A prepared image that runs the same script through cloud-init, and shows the address on the box's screen, comes after.
5. A box installs with or without a certificate (rails49/installation#53). With a box name, as today. With none, each UI is served over plain HTTP on its UI port. Every box serves the UI ports. The project runs no zone for others' boxes; that can be added later if people ask.
6. Add an updater to the installation. It checks for a new release once a day when online, shows status, versions and "update available" on a page under the door, updates and rolls back on a press, and keeps a record as dccex does. No automatic updates.
7. Configure log rotation and image pruning in the release, and show disk, certificate expiry and name resolution on the status page.
8. Add one route to the live contract that puts an uploaded `.r49` on the service, so a cloud-made archive reaches the box through the box's page.
9. Leave Watchtower, Podman auto-update, balenaOS and an OS of our own aside. Revisit A/B images only if boxes are shipped as devices.

#62 needs no change to its decisions. It gains: a native multi-architecture build published to GHCR under the release, `compose.yaml` that starts with no GPU group on the box, a stated tested-hardware list, and a decision on the AGPL detector in a published image.

## 10. Open questions for the user

1. Which hardware is a supported box: Intel x86-64 with an iGPU only, or also arm64 (Raspberry Pi 5)? This decides whether arm64 images are published and tested.
2. What is supported on macOS and Windows: nothing, the simulator under Docker Desktop, or a box with hardware through one of section 4's ways (`mirror` on the host is the cheapest for the station)?
3. Settled in rails49/installation#53: a box name in the operator's own zone, or a box with no certificate. A label under a zone the project runs is left out for now.
4. Move from building on the box to published images? This amends control ADR-0067 and the installation's "publishes no image". Which uid approach: a thin layer on the box, `nss_wrapper`, or one fixed uid?
5. One installation release, or per-stack versions?
6. Who may press update and rollback: anyone on the LAN (as control ADR-0042 and installation ADR-0005 have it), or only someone at the box? May an update run while track power is on?
7. Update only on a press, or also automatically, for example at night?
8. Where does the box check: GitHub Releases or a file on rails49.org? Is revealing the box's public address on each check acceptable?
9. Where does the status page live: under `/box` on every name, or as a label of its own?
10. The setup page is plain HTTP on the LAN, and with a domain the DNS token crosses it once. Is that acceptable, or must setup with a domain run at `localhost` on the box? Is a finder page on rails49.org wanted?
11. Archives: a single upload route (B), several archives per service (C), or archives in `control`'s store (D)? Should the archive be backed up with the store?
12. Publish a service image with the AGPL detector, one without, or both?

## Sources

- [S1] Docker Desktop, GPU support. https://docs.docker.com/desktop/features/gpu/
- [S2] Docker Desktop FAQ: "Docker Desktop does not support direct USB device passthrough." https://docs.docker.com/desktop/troubleshoot-and-support/faqs/general/
- [S3] Microsoft, Connect USB devices to WSL (usbipd-win). https://learn.microsoft.com/en-us/windows/wsl/connect-usb
- [S4] Docker Desktop licence. https://docs.docker.com/subscription/desktop-license/
- [S5] Docker Desktop on Linux runs a VM. https://docs.docker.com/desktop/setup/install/linux/
- [S6] Install Docker Engine on Debian; convenience script warning. https://docs.docker.com/engine/install/debian/
- [S7] Docker Engine supported platforms. https://docs.docker.com/engine/install/
- [S8] Docker multi-platform builds. https://docs.docker.com/build/building/multi-platform/
- [S9] GitHub-hosted runners, `ubuntu-24.04-arm`. https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job
- [S10] GitHub Container Registry: anonymous pulls of public images, multi-architecture manifests. https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- [S11] Compose file, `image` with a digest. https://docs.docker.com/reference/compose-file/services/
- [S12] Compose `include`. https://docs.docker.com/compose/how-tos/multiple-compose-files/include/
- [S13] Compose applications as OCI artifacts. https://docs.docker.com/compose/how-tos/oci-artifact/
- [S14] Dockerfile `HEALTHCHECK`: a failing check marks the container unhealthy; no restart is described. https://docs.docker.com/reference/dockerfile/
- [S15] Docker logging: json-file performs no rotation by default; `local` rotates. https://docs.docker.com/engine/logging/configure/
- [S16] Docker Engine security: the daemon runs as root; only trusted users should control it. https://docs.docker.com/engine/security/
- [S17] containrrr/watchtower, archived 2025-12-17. https://github.com/containrrr/watchtower
- [S18] `podman auto-update`. https://docs.podman.io/en/latest/markdown/podman-auto-update.1.html
- [S19] GitHub REST, get the latest release. https://docs.github.com/en/rest/releases/releases#get-the-latest-release
- [S20] GitHub REST rate limits: 60 unauthenticated requests per hour. https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- [S21] OCI image annotations, `org.opencontainers.image.revision`. https://github.com/opencontainers/image-spec/blob/main/annotations.md
- [S22] CasaOS install. https://github.com/IceWhaleTech/CasaOS
- [S23] umbrelOS. https://github.com/getumbrel/umbrel
- [S24] Home Assistant OS update system (RAUC, slots A and B). https://contributors.home-assistant.io/os/operating-system/update-system/
- [S25] Home Assistant Supervisor. https://contributors.home-assistant.io/os/supervisor/
- [S26] Supervisor source, `URL_HASSIO_VERSION`. https://github.com/home-assistant/supervisor/blob/main/supervisor/const.py
- [S27] Home Assistant, deprecating Core and Supervised installation methods (2025-05-22). https://www.home-assistant.io/blog/2025/05/22/deprecating-core-and-supervised-installation-methods-and-32-bit-systems/
- [S28] Home Assistant on generic x86-64. https://www.home-assistant.io/installation/generic-x86-64
- [S29] balenaOS overview, A-B updates. https://docs.balena.io/reference/OS/overview/
- [S30] balenaOS rollbacks. https://docs.balena.io/reference/OS/updates/rollbacks/
- [S31] balena pricing, openBalena. https://www.balena.io/pricing
- [S32] balena delta updates. https://docs.balena.io/learn/deploy/delta/
- [S33] Raspberry Pi getting started, OS customisation. https://www.raspberrypi.com/documentation/computers/getting-started.html
- [S34] rpi-imager, `--repo`. https://github.com/raspberrypi/rpi-imager
- [S35] Raspberry Pi, adding your own images to Imager (2025-12-11). https://www.raspberrypi.com/news/how-to-add-your-own-images-to-imager/
- [S36] Raspberry Pi, cloud-init on Raspberry Pi OS (2025-11-27). https://www.raspberrypi.com/news/cloud-init-on-raspberry-pi-os/
- [S37] cloud-init NoCloud datasource. https://docs.cloud-init.io/en/latest/reference/datasources/nocloud.html
- [S38] OpenVINO docker_ci, accelerators: `--device /dev/dri --group-add=$(stat -c %g /dev/dri/render*)`; WSL2 `--device=/dev/dxg`. https://github.com/openvinotoolkit/docker_ci/blob/master/docs/accelerators.md
- [S39] Intel compute-runtime. https://github.com/intel/compute-runtime
- [S40] Ubuntu noble, `intel-opencl-icd` (amd64). https://packages.ubuntu.com/noble/intel-opencl-icd
- [S41] OpenVINO: CPU (x86, ARM), GPU (Intel). https://github.com/openvinotoolkit/openvino
- [S42] PyPI `openvino` files, manylinux aarch64 wheels. https://pypi.org/project/openvino/#files
- [S43] Let's Encrypt, certificates for localhost. https://letsencrypt.org/docs/certificates-for-localhost/
- [S44] Let's Encrypt, challenge types (DNS-01). https://letsencrypt.org/docs/challenge-types/
- [S45] RFC 6762, Multicast DNS (`.local` is link-local). https://www.rfc-editor.org/rfc/rfc6762.html
- [S46] RAUC basics. https://rauc.readthedocs.io/en/latest/basic.html
- [S47] Mender introduction. https://docs.mender.io/overview/introduction
- [S48] Ubuntu Server automatic updates. https://ubuntu.com/server/docs/how-to/software/automatic-updates/
- [S49] `journald.conf`. https://www.freedesktop.org/software/systemd/man/latest/journald.conf.html
- [S50] Linux thermal sysfs. https://docs.kernel.org/driver-api/thermal/sysfs-api.html
- [S51] Raspberry Pi OS, `vcgencmd`. https://www.raspberrypi.com/documentation/computers/os.html
- [S52] systemd `60-persistent-v4l.rules`. https://github.com/systemd/systemd/blob/main/rules.d/60-persistent-v4l.rules
- [S53] systemd `60-serial.rules`. https://github.com/systemd/systemd/blob/main/rules.d/60-serial.rules
- [S54] acme-dns. https://github.com/joohoi/acme-dns
- [S55] lego DNS provider `acmedns`. https://go-acme.github.io/lego/dns/acmedns/
- [S56] Docker Hub tag API, architectures of each tag, read 2026-11-11: `https://hub.docker.com/v2/repositories/<name>/tags/<tag>`.
- [S57] Let's Encrypt rate limits: 50 certificates per registered domain every 7 days, by the Public Suffix List; renewals exempt. https://letsencrypt.org/docs/rate-limits/
- [S58] nip.io and sslip.io: names, HTTP-01, no wildcard, operators. https://nip.io/
- [S59] Filippo Valsorda, how Plex is doing HTTPS for all its users. https://words.filippo.io/how-plex-is-doing-https-for-all-its-users/
- [S60] Pi-hole forum, `plex.direct` and DNS rebinding. https://discourse.pi-hole.net/t/add-plex-direct-to-dns-rebinding/74780
- [S61] Plex forum, `plex.direct` and DNS rebinding protection. https://forums.plex.tv/t/adding-plex-direct-to-dns-rebinding-protection-whitelist/754355
- [S62] RFC 6125 §6.4.3, a wildcard matches one label. https://www.rfc-editor.org/rfc/rfc6125#section-6.4.3
- [S63] CA/Browser Forum Baseline Requirements §4.9.1.1, revocation within 24 hours on key compromise. https://cabforum.org/working-groups/server/baseline-requirements/requirements/
- [S64] nss-mdns README, names of more than two labels. https://github.com/avahi/nss-mdns
- [S65] `avahi.hosts(5)`. https://linux.die.net/man/5/avahi.hosts
- [S66] Docker Desktop, using USB/IP: a USB/IP server on the host, attached from a privileged container that must keep running; "Docker can't guarantee every possible USB device works". https://docs.docker.com/desktop/features/usbip/
- [S67] Docker Desktop 4.35 release, USB/IP support. https://www.docker.com/blog/docker-desktop-4-35/
- [S68] Golioth, USB with Docker on Windows and macOS: usbipd-win on Windows; no complete USB/IP server on macOS. https://blog.golioth.io/usb-docker-windows-macos/
- [S69] Podman Desktop, GPU container access on macOS (libkrun, Vulkan to Metal). https://podman-desktop.io/docs/podman/gpu
- [S70] onnxruntime, CoreML execution provider. https://onnxruntime.ai/docs/execution-providers/CoreML-ExecutionProvider.html
