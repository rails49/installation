# installation

The base a box installs before any railroad. It holds the door in front of
everything a browser reaches on the box, the page listing what the box serves,
the box's declaration of itself, and the install instructions.

## What an installation is

Four things, and they are the same four on every box: the name it is reached
at, the certificate for that name, the door, and the page. None of them is
about a railroad, a camera or a command station. A box with a command station
and no layout installs this and then `dccex` — no broker, no store, no trains,
and a page listing what it has. The railroad, the detector and JMRI are what an
operator adds on top.

The bus and the store are `control`'s. Every UI brings the container that
serves it and declares its own routes as labels on its own containers, so this
repository knows names and nothing about builds.

[ADR-0007](https://github.com/rails49/.github/blob/main/docs/adr/0007-an-installation-is-a-name-and-every-ui-is-a-label-under-it.md)
named the installation.
[ADR-0009](https://github.com/rails49/.github/blob/main/docs/adr/0009-the-door-and-the-page-are-the-installations-in-a-repository-of-their-own.md)
moved the door and the page here.

## The box declaration

A box says what it is called and what it serves in one file at a fixed path,
`/etc/rails49/box.env`: `BOX_DOMAIN`, the name the box is reached at, `BOX_UIS`,
the labels it serves, and `BOX_ACME_PROVIDER`, the DNS provider that issues its
certificates. Every stack is started against that file, and every stack that
serves a UI joins the external docker network this repository creates.

The path is fixed rather than living in this repository's clone, because a
value that lives in one clone makes that clone a prerequisite of every other
stack.

`acme.env` beside it holds the ACME credential and the account address, and the
door is the only thing that reads it. A secret in the declaration is a secret
handed to `control`, `dccex` and `occupancy` for no reason — and keeping it out
leaves the declaration something you can paste into an issue while debugging a
headless box.

`box.env.example` and `acme.env.example` in this repository are what the two
look like. Neither real file is in any clone.

## The page

One link per label in `BOX_UIS`, rendered once when its container starts. The
text is the label, the address is `https://<label>.$BOX_DOMAIN`. The
installation holds no other fact about any UI, so a UI that did not exist when
this was written needs no change here.

The band across the top carries the box's name, which is the one fact the
installation holds and the thing you want to know on landing there. What the
page draws with is [`look/`](look/README.md).

## Installing

Installing is prose, not a program: this is what is about to happen to your
box, and you can read it before it does.

You need docker, a name of your own in a zone you control, and an API token for
that zone's DNS provider. No port is forwarded — the certificate is proved by
writing a TXT record — and nothing inbound from the internet is needed.

**1. Point the name at the box.** An `A` record for the apex and one per label,
each holding the box's address on your LAN. A public record holding a private
address is the design rather than a trick: anyone may resolve the name, and it
only works on the LAN.

**2. Write the box's declaration.** As root, because every stack reads it and
none of them should be able to rewrite it:

```bash
sudo install -d -m 755 /etc/rails49
sudo install -m 644 box.env.example /etc/rails49/box.env
sudo editor /etc/rails49/box.env
```

**3. Write the door's file.** Same directory, tighter mode, and the door alone
reads it:

```bash
sudo install -m 640 -o root -g docker acme.env.example /etc/rails49/acme.env
sudo editor /etc/rails49/acme.env
```

How that file is populated is not this repository's business. A machine with
1Password can write it from a reference file; a headless box keeps a root-owned
file, because `op` unlocks through a desktop app that a headless box does not
have and the certificate has to renew months from now with nobody present.

**4. Start the installation.**

```bash
docker compose --env-file /etc/rails49/box.env up -d
```

The door comes up, 80 redirects to 443, and the first request for the name is
what makes it ask for a certificate. Give it a few seconds and open
`https://$BOX_DOMAIN`. Renewal is the door's, at about a third of the
certificate's remaining life, and needs only outbound HTTPS.

A label with nothing serving it yet answers 404. That is the point: the name
works, the certificate is real, and no railroad was installed to get there.

**5. Install what the box is for.** `control`, `dccex`, whatever this box has.
Each is its own repository with its own compose, started against the same
declaration, joining the network this one created. A stack started before the
installation says so:

    network rails49 declared as external, but could not be found

## Working on a development machine

A development machine is reached at `localhost`, or it runs the installation.
Two shapes and no third
([ADR-0011](https://github.com/rails49/.github/blob/main/docs/adr/0011-a-development-machine-runs-the-installation-or-is-reached-at-localhost.md)).
The first is what you work in: vite and the servers beside it on ports, with no
name, no certificate and no door, because `localhost` is a secure context and a
browser asks for nothing more. The second is this one, and it is for seeing
what an operator actually receives.

Running it is the five steps above. What is different is below.

**Stop the development servers first.** The two shapes publish some of the same
ports, and they are alternatives rather than neighbours.

**The name may be a label.** `BOX_DOMAIN` holds the name the box is reached at.
On one of our boxes that is a domain bought for it; on the other it is
`dev.rails49.org`, a label in a zone we already run. Both shapes are supported,
and both are exercised here rather than only described.

**The records hold `127.0.0.1`.** A development machine moves between networks,
so a LAN address in public DNS is a record somebody edits every time it does.
The cost is that only this machine reaches the name — a phone on the same wifi
does not, and a UI tested from a phone is tested at a LAN address instead. The
certificate is unaffected: it is proved by writing a TXT record and never by
reaching the box.

**The ACME credential can come from 1Password.** `op` unlocks through a desktop
app, which a development machine has and a headless box does not. Write
`/etc/rails49/acme.env` once from a reference file, root-owned, mode `640`,
outside every clone. Rendering it again before each start buys nothing: the
door reads it at renewal, months later, and not at `up -d`.

**A box with no steel runs the simulator.** A development machine has no
command station on USB, so the stack that serves the UI comes up with its
simulated railroad where the hardware binding would be.

**A label serves a build, not your working tree.** The container behind a label
serves whatever that UI's last build wrote. An operator's box does the same, so
this is the shape rather than a defect — but the label goes stale as you edit
and says nothing about it. Vite at `localhost` is the copy that follows your
edits.

**The door runs the branch this clone has checked out.** `docker compose up -d`
starts the compose file in front of you, half-finished work included. That is
what makes the machine useful for changing the door at all, and it is worth
knowing before you wonder why 443 is behaving strangely.

## JMRI

JMRI's compose rides here as an optional extra. It is not part of the
installation — it is the one UI no repository of this project owns — so it is a
compose project of its own rather than a profile
([ADR-0002](docs/adr/0002-jmri-is-a-compose-project-of-its-own.md)), started
and stopped without touching the door or the page:

```bash
docker compose --env-file /etc/rails49/box.env -f jmri/compose.yaml up -d
```

It publishes no port. noVNC answers at `https://jmri.$BOX_DOMAIN`, so put
`jmri` in `BOX_UIS` to have the page list it. JMRI's own web server and raw VNC
are not reachable: the first is a browser's and is behind the door or nowhere,
and the second is not a browser's at all.

## Deploying

`./deploy.sh` is a maintainer's convenience for pushing this checkout to a box
from a dev machine — `git pull` and `up -d` over ssh. It is not the install
path, and it names no box:

```bash
./deploy.sh ttmetro@gleis49.org
RAILS49_BOX=ttmetro@gleis49.org ./deploy.sh
```

Every other stack deploys itself. A repository that knows nothing about
railroads does not build a railroad's UI.

## Working on this

    scripts/check.sh

The gate, and what `main` moves by. It runs shellcheck over every shell script,
`docker compose config` over every compose file, and the tests: one over the
page the render script produces, one over the compose files as data. Nothing in
it needs a box, a container or a secret.
