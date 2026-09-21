# Installation

The base a box installs before any railroad: the name it is reached at, the
certificate for that name, the door, and the page. This file is the glossary
for those words and nothing else — what each term means, and which of the
words people reach for instead are wrong here.

## Language

**Box**:
A machine that runs an installation, plus whatever that machine is for. The
unit an operator owns and names.
_Avoid_: host, server, node, machine

**Box name**:
The name a box is reached at, held in `BOX_DOMAIN`. It may be a domain bought
for the box, as `gleis49.org` is, or a label in a zone somebody already runs,
as `dev.rails49.org` is; both are supported and neither is the normal case.
The variable's name says domain and is wrong about it.
_Avoid_: box domain, domain, hostname, FQDN

**Label**:
One name under a box name, serving exactly one UI, listed in `BOX_UIS`. The
UI's own container declares the router for it; the installation knows the
label and nothing else about the UI.
_Avoid_: subdomain, route, service, app name

**Declaration**:
The box's statement of what it is called and what it serves, at the fixed path
`/etc/rails49/box.env`. Every stack on the box is started against it, so two
stacks cannot come to different answers about the box's name. It holds no
secret.
_Avoid_: config, env file, settings, environment

**Installation**:
The four things every box has — the box name, its certificate, the door and
the page — and the compose project in this repository that provides them. The
act of putting one on a box is *installing*, which is a different word on
purpose.
_Avoid_: base, platform, infrastructure, the stack

**Door**:
The one thing in front of everything a browser reaches on a box. There is one
per box, it belongs to the installation rather than to any railroad, and it
reads its routers off container labels.
_Avoid_: proxy, reverse proxy, ingress, gateway, edge, Traefik

**Page**:
What a box name serves: one link per label in the declaration, and the box's
name across the top. It holds no other fact about any UI.
_Avoid_: index, landing page, home page, dashboard, portal

**Development machine**:
A machine somebody works on. It is reached at `localhost`, or it runs the
installation and is a box like any other — two shapes and no third. Say which
machine you mean rather than *the dev box*, which has meant this project's own
one, any machine of this kind, and a name in the zone.
_Avoid_: dev box, dev server, local, laptop
