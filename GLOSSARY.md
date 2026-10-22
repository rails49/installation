# Installation

The base a box installs before any railroad: the name it is reached at, the
certificate for that name, the door, and the page. This file is the glossary
for those words and nothing else — what each term means, and which of the
words people reach for instead are wrong here.

## Language

**Box**:
A machine that runs an installation, plus whatever that machine is for. The
unit an operator owns and names; see [ADR-0007](https://github.com/rails49/.github/blob/main/docs/adr/0007-an-installation-is-a-name-and-every-ui-is-a-label-under-it.md).
_Avoid_: host, server, node, machine

**Box name**:
The name a box is reached at, held in `BOX_DOMAIN`. It may be a domain bought
for the box, as `gleis49.org` is, or a label in a zone somebody already runs,
as `dev.rails49.org` is; both are supported and neither is the normal case.
The variable's name says domain and is wrong about it; see [ADR-0007](https://github.com/rails49/.github/blob/main/docs/adr/0007-an-installation-is-a-name-and-every-ui-is-a-label-under-it.md).
_Avoid_: box domain, domain, hostname, FQDN

**Label**:
One name under a box name, serving exactly one UI, listed in `BOX_UIS`. The
UI's own container declares the router for it; the installation knows the
label and nothing else about the UI; see [ADR-0007](https://github.com/rails49/.github/blob/main/docs/adr/0007-an-installation-is-a-name-and-every-ui-is-a-label-under-it.md).
_Avoid_: subdomain, route, service, app name

**Declaration**:
The box's statement of what it is called and what it serves, at the fixed path
`/etc/rails49/box.env`. Every stack on the box is started against it, so two
stacks cannot come to different answers about the box's name. It holds no
secret; see [the box declaration](README.md#the-box-declaration).
_Avoid_: config, env file, settings, environment

**Installation**:
As in [`.github`'s glossary](https://github.com/rails49/.github/blob/main/GLOSSARY.md); here also the compose project that provides it.

**Door**:
As in [`.github`'s glossary](https://github.com/rails49/.github/blob/main/GLOSSARY.md).

**Shared network**:
The one docker network every stack on a box joins, created by the installation
and named `rails49`. A container joins it if the door reaches it or if it talks
to another stack; see [ADR-0004](docs/adr/0004-the-shared-network-carries-the-doors-traffic-and-traffic-between-stacks.md).
_Avoid_: bus network (in `control`, the bus is the MQTT broker), the
installation's network, `rails49` as a word for the network in prose

**Page**:
As in [`.github`'s glossary](https://github.com/rails49/.github/blob/main/GLOSSARY.md).

**Turning the box off**:
The box stopping every stack on it and powering down, so its plug can be
pulled. Asked for by a UI and carried out by the installation, only on a box
whose init it knows. Coming back takes a person at the box; see
[ADR-0005](docs/adr/0005-the-installation-turns-the-box-off.md).
_Avoid_: shutdown, halt, power off (the track supply, in `control`), reboot

**Development machine**:
A machine somebody works on. It is reached at `localhost`, or it runs the
installation and is a box like any other — two shapes and no third. Say which
machine you mean rather than *the dev box*, which has meant this project's own
one, any machine of this kind, and a name in the zone; see
[ADR-0011](https://github.com/rails49/.github/blob/main/docs/adr/0011-a-development-machine-runs-the-installation-or-is-reached-at-localhost.md).
_Avoid_: dev box, dev server, local, laptop
