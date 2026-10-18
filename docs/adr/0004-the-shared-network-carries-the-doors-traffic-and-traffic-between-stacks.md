# The shared network carries the door's traffic and traffic between stacks

Resolves [#30](https://github.com/rails49/installation/issues/30) and
supersedes [ADR-0001](0001-only-what-the-door-reaches-joins-the-shared-network.md)
in full.

[ADR-0001](0001-only-what-the-door-reaches-joins-the-shared-network.md) let
only the containers the door reaches join the shared network, and kept
translators on their own project's network. `dccex`'s `translator` has since
joined it and dials `broker:1883` and `store:8765`, which are `control`'s
service names; control#586 built the store's script routes for callers there,
and jmri#7 plans a second translator alongside it. The rule no longer said
what the boxes do. Under rails49/.github ADR-0017 an accepted ADR is not
edited, so this one restates every rule, and not only the one that changed.

## Decision

**The network is named `rails49`.** This repository's `compose.yaml` creates
it under that fixed name; every other stack declares it `external: true`. Not
a name derived from a compose project — `control`'s project is `tc49` and its
own network is `tc49_default` — because the point of this one is that it
belongs to no single project. The name is a contract in every repository that
runs a stack on a box, and is the expensive half of this decision.

**A container joins it if the door reaches it, if it dials a service in
another stack, or if a container in another stack dials it.** No other
container joins. For `control` that is `web`, `store` and `broker`; for
`dccex` it is `translator`. `scheduler`, `dispatcher`, `driver` and the rest
stay on their own project's default network, because neither a browser nor
another stack has any business with them.

**A container the door reaches carries `traefik.docker.network=rails49`.** It
is on two networks, and the docker provider picks a container IP; without the
label it picks whichever network it finds first, which is a route that works
until it does not. A container that joins only to talk to another stack is not
routed by the door and does not need the label.

**A service name that another stack dials must be unique on the box.** Compose
gives a service a network alias of its own name on every network it joins, so
a dialled name is resolved across every stack on the shared network. Today
those names are `broker`, `store` and `jmri`. The stack that owns such a name
documents it in its own repository. A name nobody dials across stacks may
repeat: `web` and `translator` repeat today, and routing survives it because
the docker provider resolves to a container IP rather than by name.

## Consequences

The shared network is a namespace, and the dialled names are the part of it
that is reserved. A stack that adds a container another stack dials adds a
name to that reservation and says so in its own repository; nothing in this
repository lists them.

Traffic between stacks stays off the host's ports. The store is reachable by
another stack's container and by the door, and not from the LAN.

Each stack keeps its default network and its internal traffic is unchanged.
`broker` sits on both: its apps reach it on the default network, browsers
through the door, and other stacks' translators on the shared network.

## Considered

**Callers use the host's published ports.** No shared names to keep unique,
but the store would have to be published, which puts it on the LAN.

**A second network for traffic between stacks.** It keeps the door's network
to the door's containers, at the price of a second fixed name that every
repository would hardcode.

**Every container of every stack joins.** It puts every container of `control`
on a network shared with other projects so that none of them can be reached
from it, and crowds the namespace above for nothing.

**The network named for the box name.** It would be unique per box and could
never collide. It would also be a name that changes when the box is renamed,
which no repository that runs a stack on a box can hardcode — and
hardcoding it is the entire point.

**Each stack creating the network if absent.** No ordering requirement, no
"declared as external, but could not be found". Also no single owner of its
options, and the first stack to start silently decides them.
