# installation

The base a box installs before any railroad. It holds the door in front of
everything a browser reaches on the box, the page listing what the box serves,
the box's declaration of itself, and the install instructions.

## What an installation is

The door, the page, the service that turns the box off and shows its status,
and how the box is reached: at a box name with a certificate for it, or with no
certificate over plain HTTP on the UI ports. None of them is about a railroad,
a camera or a command station. A box with a command station and no layout
installs this and then `dccex` — no broker, no store, no trains, and a page
listing what it has. The railroad, the detector and JMRI are what an operator
adds on top.

The bus and the store are `control`'s. Every UI brings the container that
serves it and declares its own routes as labels on its own containers, so this
repository knows names and nothing about their builds. It builds and publishes
two images of its own, `installation-page` and `installation-box`, and builds
JMRI, which no repository of this project owns, on the box.

[ADR-0024](https://github.com/rails49/.github/blob/main/docs/adr/0024-each-ui-has-an-origin-of-its-own-at-a-label-or-a-ui-port.md)
says how a box and its UIs are reached.
[ADR-0009](https://github.com/rails49/.github/blob/main/docs/adr/0009-the-door-and-the-page-are-the-installations-in-a-repository-of-their-own.md)
moved the door and the page here.

## Repositories

Every repository in the [rails49 organisation](https://github.com/rails49):

| Repository | What it holds |
| --- | --- |
| [installation](https://github.com/rails49/installation) | This repository: the base a box installs before any railroad. |
| [control](https://github.com/rails49/control) | Scheduling, dispatching and driving trains, with the bus and the store. |
| [dccex](https://github.com/rails49/dccex) | The dcc-ex UI for the command station, and the two processes that talk to it. |
| [jmri](https://github.com/rails49/jmri) | The translator between `control`'s bus and any command station JMRI drives. |
| [occupancy](https://github.com/rails49/occupancy) | The browser UI for camera-based track occupancy: labeling, viewing and diagnosis. |
| [occupancy-service](https://github.com/rails49/occupancy-service) | The process that runs occupancy models on a server's camera and publishes the results, and the live contract. |
| [detector](https://github.com/rails49/detector) | The detector: training-data export, training, the model, and its browser and Python runtimes. |
| [classifier](https://github.com/rails49/classifier) | The per-sensor occupancy classifier: patch export, training, and its Python and browser packages. |
| [r49](https://github.com/rails49/r49) | The `.r49` layout archive format: spec, TypeScript and Python readers, validator and community corpus. |
| [look](https://github.com/rails49/look) | Shared chrome for the UIs: band, rail, dialogs and widget styling. |
| [CommandStation-EX](https://github.com/rails49/CommandStation-EX) | Our fork of the DCC-EX firmware for the EX-CSB1 command station. |
| [dcc-led](https://github.com/rails49/dcc-led) | A DCC-controlled 8-channel LED driver for signals: the hardware design. Private. |
| [rails49.org](https://github.com/rails49/rails49.org) | The landing page and documentation served at rails49.org. |
| [.github](https://github.com/rails49/.github) | The organisation's profile, shared glossary and decisions that span repositories. |

## The box declaration

A box says what it is called and what it serves in one file at a fixed path,
`/etc/rails49/box.env`: `BOX_DOMAIN`, the box name, or empty for a box with no
certificate, `BOX_UIS`, the labels it serves, and `BOX_ACME_PROVIDER`, the DNS
provider that issues its certificates, needed only with a box name. Every stack
is started against that file, and refuses to start if `BOX_DOMAIN` is unset. A
container joins the external docker network this repository creates if the door
reaches it, if it dials a service in another stack, or if a container in
another stack dials it
([ADR-0004](docs/adr/0004-the-shared-network-carries-the-doors-traffic-and-traffic-between-stacks.md)).

The path is fixed rather than living in this repository's clone, because a
value that lives in one clone makes that clone a prerequisite of every other
stack.

`acme.env` beside it holds the ACME credential and the account address, and the
door is the only thing that reads it. A secret in the declaration is a secret
handed to every stack on the box for no reason — and keeping it out
leaves the declaration something you can paste into an issue while debugging a
headless box.

`box.env.example` and `acme.env.example` in this repository are what the two
look like. Neither real file is in any clone. A box with no certificate has no
`acme.env`.

## Two kinds of box

**A box with a box name** is reached at `https://<label>.$BOX_DOMAIN`, with a
certificate from Let's Encrypt through a DNS-01 challenge. Port 80 redirects
the box name and every name under it to 443, and serves the page over plain
HTTP at any other host: the box's address or `<hostname>.local`.

**A box with no certificate** (`BOX_DOMAIN=`) serves each UI over plain HTTP on
its UI port, at `http://<hostname>.local:<port>` and at
`http://<address>:<port>`. The page is on 80. There is no certificate, no DNS
record, and nothing outside the house. The browser gives such a page no secure
context, which costs `control` its screen wake lock and one copy button.

Every box serves the UI ports, so a box with a box name stays reachable when DNS
or the certificate fails, at its address or `<hostname>.local`.

The door sends no `Strict-Transport-Security` header. A browser that had one
with `includeSubDomains` for the box name would turn every
`http://<label>.$BOX_DOMAIN:<port>` into HTTPS, which the UI ports do not
speak.

The UI ports. The installation owns this table, and a new UI takes the next
free number. Stacks in other repositories name the entry points.

| Label | Entry point | Port |
| --- | --- | --- |
| (the page) | `web` | 80 |
| `control` | `control` | 8081 |
| `dccex` | `dccex` | 8082 |
| `jmri` | `jmri` | 8083 |
| `occupancy` | `occupancy` | 8084 |

The door opens every one of them on every box. Each stack declares a router on
its UI port beside its `Host()` router. On a box with no certificate the
`websecure` routers name an entry point that does not exist: the door logs an
error for each and serves the rest.

## The page

One item per label in `BOX_UIS`, rendered once when its container starts. The
text is the label. Opened over HTTPS, the address is
`https://<label>.$BOX_DOMAIN`. Opened over plain HTTP, it is the label's UI port
at the host the page was reached at. On a box with no certificate a label with
no UI port is listed with no link; on a box with a box name it keeps its HTTPS
address. The page holds two facts about a UI, its label and its UI port. A new UI takes the next free number in the table above; the door's flags
and ports, `box`'s plain-HTTP router, `page/render.sh` and `scripts/probe.sh`
name the same ports, and a test checks that they agree.

The band across the top carries the box name, or on a box with no certificate
the box's hostname, which is the thing you want to know on landing there. A
footer links to the [status page](#the-status-page) as "Box status", always,
and to [rails49.org](https://rails49.org/). The band is
[look](https://github.com/rails49/look)'s, from a copy in
[`look/`](look/README.md).

## Turning the box off

The `box` service answers two requests on every name and every UI port the door
serves. `GET /box` says whether this box can be turned off from here, as
`{"can_turn_off": true}` or `false`. `POST /box/off` answers `202` and turns it
off, or answers `409` where it cannot. A UI makes the requests — `control` has
the button; the page has none. A request from a page on another origin is refused
([ADR-0005](docs/adr/0005-the-installation-turns-the-box-off.md)).

On a Mac with Docker Desktop the answer is no: PID 1 there is Docker's virtual
machine, not the Mac. Coming back takes a person at the box.

## The status page

`box` serves the status page at `/box/`, on every name and every UI port the
door serves
([#65](https://github.com/rails49/installation/issues/65)). It uses look's
band, from the same copy as the page, and says each failure in a sentence at
the top. It shows:

- Each stack's state (running, restarting or stopped) and commit. The stacks
  are the installation and one per label in `BOX_UIS`: `control`, `dccex`,
  `jmri` (this repository's JMRI project) and `occupancy`
  (occupancy-service). The commit is the `org.opencontainers.image.revision`
  of the stack's images. A stack whose commit is not the release's runs a
  local build, and a sentence says so; on a box never updated every stack
  does. JMRI is built on the box and is in no release.
- The release. It is the one the last line of
  `/var/lib/rails49/deploys/installation` that passed moved the box to, and
  its manifest is `/var/lib/rails49/releases/<release>/manifest.json`. A line
  reads `<time>  <from>  ->  <to>  passed` or `failed`. A box never updated has
  none.
- Whether a newer release is out, and when the box last checked. The box asks
  GitHub for `rails49/installation`'s latest release, which is never a
  pre-release, once a day, and on "Check now". Offline it says it could not
  check, and when the last check succeeded. What it found is kept in
  `/var/lib/rails49/check.json`.
- Disk free, on the file system Docker keeps its images on.
- The box's address on its LAN, and that it should be reserved for the box
  in the router, so it does not change.
- Docker Engine's version, against the versions the release was tested on,
  and the daemon's log driver, with a sentence when it is not `local`. Set it
  in `/etc/docker/daemon.json`, `{"log-driver": "local"}`, and restart
  Docker.
- On a box with a box name, when the certificate expires, read from a TLS
  connection to the door and never from `acme.json`, and whether the box name
  resolves to this box's address.

`GET /box/status` answers the same as JSON. `POST /box/check` checks now.
`GET /box/bundle` downloads the log bundle, one `.tar.gz` of the records, the
current manifest, `docker version` and `docker info`, `box.env` and every
`<stack>.env`, `docker compose ps -a` for each stack, and the last 1000 lines
of each container's log. It holds neither `acme.env` nor `acme.json`.

For this, `box` has the Docker socket, `/etc/rails49` to write,
`/var/lib/rails49`, the box's `/dev` read-only at `/host/dev`, and the Docker
CLI with compose. With the socket it can do anything on the box that root can.

### Setup

The status page also chooses the stacks the box runs and their devices
([#69](https://github.com/rails49/installation/issues/69)):

- A checkbox for each of `control`, `dccex`, `jmri` and `occupancy`, ticked as
  `BOX_UIS` in `box.env` declares them. Ticking any of the last three ticks
  `control`: dccex and occupancy dial its broker, and JMRI reads `TC49_STORE`
  from `control.env`. `box` ticks it again when the form is applied, for a
  browser that runs no script.
- The command station, from `/dev/serial/by-id/`, and the camera, from
  `/dev/v4l/by-id/`, or none. With none plugged in, a sentence says so. A
  device the stack's file names that is not plugged in stays offered. None is
  written as `/dev/serial/by-id/none` and `/dev/v4l/by-id/none`, a path that
  names no device, with which the stack runs and reports the device missing.
  Occupancy needs no archive to be ticked.

"Apply" (`POST /box/setup`) writes `BOX_UIS` into `box.env`,
`DCCEX_STATION_DEVICE` into `dccex.env` and `OCCUPANCY_CAMERA` into
`occupancy.env`, in place, so each file keeps its owner and mode. Every other
line stays as it is, and a file that is not there is made. It then starts `rails49-update` at the release the
box runs and the box name `box.env` declares, as below, which first stops and removes the containers of each
stack no longer ticked, keeping its data. The page says first that applying
stops the railroad for about a minute. It answers 409 with a sentence while
an update, going back or applying runs, on a box that runs no release yet, and
for a stack or device the page did not offer, and then writes nothing. A page
on another origin is refused. Applying adds no line to the record and removes
nothing, so going back is offered as before.

### Updating the box and going back

When a newer release is out, the status page offers "Update to <release>".
Once the record names a release the box ran before the last update, it offers
"Go back to <release>", and after going back it offers nothing to go back to. Above both it says that updating or going back stops
the railroad for about a minute. Anyone on the LAN may press either, as anyone
may turn the box off, and a page on another origin is refused. Nothing is
installed without a press, and a failed update is not gone back from by
itself.

`POST /box/update` updates to the latest release the last check found, and
`POST /box/back` goes back. Each answers 409 with a sentence while one of
them or applying the setup runs,
when there is no newer release, or when there is nothing to go back to. Each
starts the container `rails49-update` from the target release's
`installation-box` image, with the Docker socket, `/etc/rails49` read-only and
`/var/lib/rails49`, in no compose project. That container:

1. Downloads the release's `manifest.json` and `box-files.tar.gz` from GitHub
   into `/var/lib/rails49/releases/<release>/`, unless they are there already.
2. Pulls every image of every declared stack, and builds JMRI. A failure here
   changes nothing on the box.
3. Brings the declared stacks up in order: the installation, control, dccex,
   JMRI, occupancy. Each is started with `--env-file /etc/rails49/box.env` and
   its own `--env-file /etc/rails49/<stack>.env`: `control.env` for control
   and JMRI, `dccex.env`, `occupancy.env`. The installation has none.
4. Waits 60 seconds. The update passes when every container of the declared
   stacks is still running, none has restarted, and `scripts/probe.sh` passes
   from the container.
5. Appends one line to `/var/lib/rails49/deploys/installation`.
6. After an update passes, removes every `ghcr.io/rails49` image and pinned stock image
   that neither the release it runs nor the one it left uses, except the
   images the stacks ran just before, which are one step back. Only those two
   releases' files are kept under `/var/lib/rails49/releases`.

What it is doing is in `/var/lib/rails49/update.json`, which the status page
shows and reloads every 5 seconds while it runs. A failure is said in a
sentence that names the stack, and "Go back to <release>" is offered. The
container stays until the next press, so its log is in the log bundle.

The update container runs as root and has no shell's environment, so each
`<stack>.env` holds what that stack's `deploy.sh` would otherwise add.
`control.env` names control's profiles, `COMPOSE_PROFILES=layout,steel` on a
box wired to a command station and `COMPOSE_PROFILES=layout,sim` on one with
nothing attached, and `TC49_STORE`, `TC49_UID` and `TC49_GID` where they are
not control's defaults.

## A page on another origin

A request is checked against the origin it arrived at. It is admitted if it
carries no `Origin`, or if the host and port of its `Origin` equal its `Host`,
and refused with `403` otherwise. The scheme is not compared, because TLS ends
at the door. The rule is the same over HTTPS, on a UI port, at a `.local` name,
at an address, and on a box with no certificate
([rails49/.github#69](https://github.com/rails49/.github/issues/69)).

`box` applies it to everything under `/box`. For everything else the door asks
`box`: the `same-origin` middleware, which `compose.yaml` declares on the door,
sends each request's headers to `GET /origin` and passes the request on only
when that answers 2xx. Every websocket and write path of every UI names it as
`same-origin@docker`, on its HTTPS router and on its UI port router. A path
that checks `Origin` itself may do that instead. So the door dials `box` by its
service name across the shared network, and `box` is a name no other stack may
use
([ADR-0004](docs/adr/0004-the-shared-network-carries-the-doors-traffic-and-traffic-between-stacks.md)).
While `box` is down, every path behind the middleware is refused.

## Install

On a computer with a 64-bit Debian-family Linux, amd64 or arm64, such as
Ubuntu Server or Raspberry Pi OS, on the network the box will serve:

```bash
curl -fsSL https://rails49.org/install | sudo sh
```

That installs the latest release. Another, a pre-release included, is named:

```bash
curl -fsSL https://rails49.org/install | sudo sh -s -- --release 2026.11.4
```

`https://rails49.org/install` redirects to the `install.sh` of the latest
release on GitHub. In order, the script:

1. Stops unless it runs as root on a computer with apt. On a box already
   installed, one with `/etc/rails49/box.env`, it stops and prints the status
   page's addresses: updates are made there.
2. Installs Docker Engine from Docker's apt repository, unless `docker` is
   there.
3. Installs `avahi-daemon`, which answers `<hostname>.local`, unless it is
   there.
4. Writes `/etc/docker/daemon.json` as `{"log-driver": "local"}` and restarts
   Docker. A `daemon.json` that is there already is left as it is, and the
   status page says which log driver Docker uses.
5. Makes the system user and group `rails49`.
6. Downloads the release's `manifest.json` and `box-files.tar.gz` from GitHub
   into `/var/lib/rails49/releases/<release>/`, unless they are there.
7. Makes the store, `/var/lib/rails49/tc49`, with `occupancy/` for
   occupancy's archives and `jmri/` for JMRI's profile, all owned by
   `rails49`. Writes `/etc/rails49/control.env` with `rails49`'s
   `TC49_UID` and `TC49_GID`, `TC49_STORE` and
   `COMPOSE_PROFILES=layout,sim`, and `occupancy.env` with the same ids and
   store, `VIDEO_GID` and `RENDER_GID` from the box's groups, and
   `OCCUPANCY_ARCHIVES`. Last it writes `box.env` with `BOX_DOMAIN=` and
   `BOX_UIS=`: a box with no certificate that serves nothing yet.
8. Starts `rails49-update` from the release's `installation-box` image, as an
   [update](#updating-the-box-and-going-back) from no release: it brings up
   the door, the page and `box`, waits 60 seconds and runs the probe. This
   takes a few minutes. When that fails, the script says why, removes
   `box.env`, and can be run again.
9. Prints the status page's addresses, `http://<hostname>.local/box/` and
   `http://<address>/box/`.

It leaves the hostname as the OS installer set it.

Open one of the two addresses from a phone or a computer on the same network,
or `http://localhost/box/` on the box itself. On the status page, tick the
stacks the box runs, choose its command station and camera, and apply
([Setup](#setup)). Reserve the box's address in your router, so the addresses
people save keep working.

`COMPOSE_PROFILES=layout,sim` runs control's simulated railroad. On a box wired
to a command station, set `COMPOSE_PROFILES=layout,steel` in
`/etc/rails49/control.env` and apply the setup again.

## A box name

A box with a box name is reached at `https://<label>.<box name>`, with a
certificate. The status page does not set one up. Install the box as above,
then do these steps by hand.

You need a name of your own in a zone you control, and an API token for that
zone's DNS provider. No port is forwarded — the certificate is proved by
writing a TXT record — and nothing inbound from the internet is needed.

**1. Point the name at the box.** An `A` record for the apex and one per label,
each holding the box's address on your LAN. A public record holding a private
address is the design rather than a trick: anyone may resolve the name, and it
only works on the LAN.

**2. Name the box in its declaration.** Set `BOX_DOMAIN` to the box name and
add `BOX_ACME_PROVIDER`, as in [`box.env.example`](box.env.example). Leave
`BOX_UIS` as the status page wrote it.

```bash
sudo editor /etc/rails49/box.env
```

**3. Write the door's file.** Same directory, tighter mode, and the door alone
reads it. Its lines are those of [`acme.env.example`](acme.env.example):

```bash
sudo install -m 640 -o root -g docker /dev/null /etc/rails49/acme.env
sudo editor /etc/rails49/acme.env
```

How that file is populated is not this repository's business. A machine with
1Password can write it from a reference file; a headless box keeps a root-owned
file, because `op` unlocks through a desktop app that a headless box does not
have and the certificate has to renew months from now with nobody present.

**4. Apply the setup on the status page.** It starts every stack again at the
box name `box.env` now declares. Port 80 now redirects the box name to 443, and the first
request for the name is what makes the door ask for a certificate. Give it a
few seconds and open `https://<box name>`. Renewal is the door's, at about a
third of the certificate's remaining life, and needs only outbound HTTPS.

A label with nothing serving it yet answers 404. That is the point: the name
works, the certificate is real, and no railroad was installed to get there.

## Development

A development machine is reached at `localhost`, or it runs the installation.
Two shapes and no third
([ADR-0011](https://github.com/rails49/.github/blob/main/docs/adr/0011-a-development-machine-runs-the-installation-or-is-reached-at-localhost.md)).
The first is what you work in: vite and the servers beside it on ports, with no
name, no certificate and no door, because `localhost` is a secure context and a
browser asks for nothing more. The second is this one, and it is for seeing
what an operator actually receives.

Running it is a clone of each stack instead of the install script. Write the
declaration by hand, as root, because every stack reads it:

```bash
sudo install -d -m 755 /etc/rails49
sudo install -m 644 box.env.example /etc/rails49/box.env
sudo editor /etc/rails49/box.env
```

For a box with no certificate, set `BOX_DOMAIN=` and leave `BOX_ACME_PROVIDER`
out. With a box name, write the door's file and the records as in
[A box name](#a-box-name). Then start the installation from this clone:

```bash
docker compose --env-file /etc/rails49/box.env up -d --build
```

`--build` builds the page and the box from this clone. Each other stack is its
own repository with its own compose, started against the same declaration,
joining the network this one created. A stack started before the installation
says so:

    network rails49 declared as external, but could not be found

What is different from a box is below.

**Stop the development servers first.** The two shapes publish some of the same
ports, and they are alternatives rather than neighbours.

**The name may be a label.** `BOX_DOMAIN` holds the name the box is reached at.
On one of our boxes that is a domain bought for it; on the other it is a label
in a zone we already run. Both shapes are supported,
and both are exercised here rather than only described.

**The records hold `127.0.0.1`.** A development machine moves between networks,
so a LAN address in public DNS is a record somebody edits every time it does.
The cost is that only this machine reaches the name — a phone on the same wifi
does not, and a UI tested from a phone is tested at a LAN address instead. The
certificate is unaffected: it is proved by writing a TXT record and never by
reaching the box.

**The ACME credential can come from 1Password.** `op` unlocks through a desktop
app, which a development machine has and a headless box does not. Write
`/etc/rails49/acme.env` once from a reference file, outside every clone.
Rendering it again before each start buys nothing: the door reads it at
renewal, months later, and not at `up -d`.

**That file's owner is not the box's.** [A box name](#a-box-name)'s step 3
gives it to `root:docker`, which is the boundary on a machine where the
daemon's socket belongs to a group. macOS has no `docker` group and Docker Desktop's socket belongs to
whoever is logged in, so compose reads the file as you — and a root-owned
`640` file is one your own `up -d` cannot open. Own it yourself, mode `600`.
The declaration beside it stays root's: every stack reads that one and only the
status page's setup rewrites it.

**A box with no steel runs the simulator.** A development machine has no
command station on USB, so the stack that serves the UI comes up with its
simulated railroad where the hardware binding would be.

**A label serves a build, not your working tree.** The container behind a label
serves whatever that UI's last build wrote. An operator's box does the same, so
this is the shape rather than a defect — but the label goes stale as you edit
and says nothing about it. Vite at `localhost` is the copy that follows your
edits.

**The door runs the branch this clone has checked out.** `docker compose up -d
--build` starts the compose file in front of you and builds the page and the
box from it, half-finished work included. Without `--build` they stay the
last build. That is
what makes the machine useful for changing the door at all, and it is worth
knowing before you wonder why 443 is behaving strangely.

### Deploying

`./deploy.sh` is a maintainer's convenience for pushing this checkout to a box
from a dev machine. Over ssh it runs `git pull`, then `up -d --build`, which
builds the page and the box on the box under the commit it pulled
(`installation-page:<commit>`, `installation-box:<commit>`). It refuses a clone
on the box that is not clean, since its images would be named after a commit
that is not what was built. It is not the install path. The box is the
argument, else `RAILS49_BOX`, else the ssh alias `rails49`, which each
developer maps to their own box in `~/.ssh/config`:

```bash
./deploy.sh
./deploy.sh user@host
RAILS49_BOX=user@host ./deploy.sh
```

Last, it runs the probe from the machine it was started on, which has to be
on the box's LAN:

```bash
scripts/probe.sh rails49
scripts/probe.sh 192.0.2.20 box example.org control dccex
```

For each label in `BOX_UIS` with a UI port, on every way in —
`https://<label>.$BOX_DOMAIN`, `http://$BOX_DOMAIN:<port>`,
`http://<label>.$BOX_DOMAIN:<port>`, `http://<hostname>.local:<port>` and
`http://<address>:<port>` — it asks `/box` and each of the UI's websocket paths
once with that way in as `Origin`, which wants 200 or 101, and once with a
foreign `Origin`, which wants 403. It asks port 80 whether it redirects the box
name and serves the page at the address and the `.local` name. It prints every
answer and exits 1 on any it did not want. The deploy prints that and keeps its
own exit code, which says whether the installation came up. With
one argument it reads the declaration, the hostname and the address over ssh;
the second form takes them as arguments. The UIs' websocket paths are listed
in the script, and a UI that adds or moves one changes the list there.

Every other stack deploys itself. A repository that knows nothing about
railroads does not build a railroad's UI.

## JMRI

JMRI's compose rides here as an optional extra. It is not part of the
installation — it is the one UI no repository of this project owns — so it is a
compose project of its own rather than a profile
([ADR-0002](docs/adr/0002-jmri-is-a-compose-project-of-its-own.md)), started
and stopped without touching the door or the page. On a box, tick `jmri` on
the status page. From a clone:

```bash
(. /etc/rails49/control.env && mkdir -p "$TC49_STORE/jmri")
TC49_UID=$(id -u) TC49_GID=$(id -g) docker compose \
  --env-file /etc/rails49/box.env --env-file /etc/rails49/control.env \
  -f jmri/compose.yaml up -d --build
```

JMRI's profile — the connection to the command station, the roster and every
loco's CV file — lives in `control`'s store, at `jmri/` under the `TC49_STORE`
that `control` writes to `/etc/rails49/control.env`, and is backed up, restored
and moved to a new box with it
([rails49/.github ADR-0013](https://github.com/rails49/.github/blob/main/docs/adr/0013-jmris-profile-lives-in-the-store.md)).
The image is the stock one with its user renumbered to yours, so the files it
writes there are yours. The directory has to exist first: compose refuses to
start rather than let docker make it owned by root. The install script makes
it, and from a clone the first line above does. On a new box, take the store
over from its repository before opening DecoderPro, or the profile it writes
makes the store not empty. Quit DecoderPro before a restore and open it again
after; it reads the profile once, at launch. The stock image is pinned by
digest in `jmri/Dockerfile`, and a newer one is a change to that line.

JMRI reaches the command station as a client of the mirror's 2560, like any
hand-held throttle: a DCC++ over TCP connection whose host is the box, not a
compose service name. Set it in DecoderPro once and save; it is part of the
profile.

It publishes no port. noVNC answers at `https://jmri.$BOX_DOMAIN` and on its UI
port, 8083, and ticking `jmri` puts it in `BOX_UIS`, so the page lists it.
Over plain HTTP noVNC shows a banner saying HTTPS is recommended, and works. JMRI's own
web server and raw VNC are not reachable: the first is a browser's and is
behind the door or nowhere, and the second is not a browser's at all.

## Making a release

A release is one installation release
([rails49/.github GLOSSARY.md](https://github.com/rails49/.github/blob/main/GLOSSARY.md)):
a commit of each stack, the digest of each of its images, and the box files
that run them. Its number is the year, the month and a count of releases in
that month: `2026.11.0`, then `2026.11.1`.

**1. Run the workflow.** Actions → release → Run workflow, or:

```bash
gh workflow run release.yml --repo rails49/installation
gh workflow run release.yml --repo rails49/installation -f control=<commit> -f release=2026.11.3
```

Each stack's commit defaults to the head of its `main`, and the number to the
next one this month. The workflow calls each stack's `images.yml` from the
head of that stack's `main`, handed the commit, and each pushes its images or
finds them already pushed. It writes `manifest.json`: the release number;
each stack's commit and the digest of each of its images; and the digest of
every stock image a compose file starts or a Dockerfile builds on. It writes
`box-files.tar.gz`: one directory per stack holding its box files, with every
`image:` pinned to its digest in the manifest. A box needs no clone and no git
to run them.

Then it checks the release on an amd64 and an arm64 runner. Each upgrades
its Docker Engine from Docker's apt repository, with the packages the install
script installs, so that it runs the version a fresh box gets today and that
is the version the manifest records. Each then puts the manifest and the box
files where an update leaves them, runs `install.sh --release <number>`,
which downloads nothing and finds Docker Engine installed, and applies the
setup on the status page: `control` with the simulator, `dccex` with no
station, occupancy with no camera and no archive. The update that applying starts has to pass. After
another 60 seconds every container has to be running with no restart, and
`scripts/probe.sh` has to pass. A failure stops the workflow before any tag
is made.

Last, it tags the installation's commit with the release number and publishes
a GitHub pre-release with `manifest.json`, which now also has each runner's
Docker Engine version, `box-files.tar.gz` and `install.sh`. It does both as the
`rails49-release` GitHub App, installed on this repository only with Contents
and Workflows write. Its client ID is the Actions variable
`RELEASE_APP_CLIENT_ID`; its private key is the Actions secret
`RELEASE_APP_PRIVATE_KEY`, copied from the `rails49-release` item in
1Password:

```bash
op read "op://rails49/rails49-release/credential" |
  gh secret set RELEASE_APP_PRIVATE_KEY --repo rails49/installation
```

**2. Check it by hand.** Install the pre-release on a 2018 Mac mini with
Ubuntu 26.04 and a Raspberry Pi 4 and run trains on it for as long as it takes
([rails49/.github#70](https://github.com/rails49/.github/issues/70) decision
8). Install it as well on a fresh Ubuntu Server on amd64 and a fresh
Raspberry Pi OS 64-bit, following only [Install](#install) from a phone with
`--release <number>`. Each has to reach `/box/` at both printed addresses,
have every stack ticked and applied, and pass `scripts/probe.sh`
([#69](https://github.com/rails49/installation/issues/69) decision 18).

**3. Mark it as a full release.** Edit the release on GitHub and clear "Set as
a pre-release". A box asking GitHub for the latest release is never offered a
pre-release, so this step is what offers it to every other box. A pre-release
that fails the hand check is never marked.

## Working on this

    scripts/check.sh

The gate, and what `main` moves by. It runs shellcheck over every shell script,
actionlint over every workflow, `docker compose config` over every compose file
with `BOX_DOMAIN` set, empty and unset, the page's render in the stock image the
page is built on for both kinds of box, and the tests: one over the page the
render script produces, one over the box's requests and the origin check, one
each over the status, the check for a new release, the log bundle and the
status page `box` renders, one over the compose files as data and the door's
script, one over what a deploy builds and refuses, one over what the install
script does to a box, in the stock image `box` is built on, one over the images
workflow as data, and one over the release's number and its pinned box
files. Nothing in it needs a box or a secret, and it builds no image.

`.github/workflows/images.yml` builds `installation-page` and
`installation-box` at one commit, for amd64 and arm64, and pushes them to
`ghcr.io/rails49/installation-<page|box>:<commit>`. An image already pushed for
that commit is reused. Only `release.yml` runs it
([rails49/.github#71](https://github.com/rails49/.github/issues/71)).
