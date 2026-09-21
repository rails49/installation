# Only what the door reaches joins the shared network

[ADR-0009](https://github.com/rails49/.github/blob/main/docs/adr/0009-the-door-and-the-page-are-the-installations-in-a-repository-of-their-own.md)
in `rails49/.github` gave the installation one external docker network,
"created by the installation and joined by every stack that serves a UI", and
made joining it an obligation on `control`, `occupancy` and `dccex`. It left
the network's name, and it left *stack* doing more work than it can bear: a
compose project is a set of containers, and `control`'s is fourteen services
of which a browser reaches three.

## Decision

**The network is named `rails49`.** This repository's `compose.yaml` creates
it under that fixed name; every other stack declares it `external: true`. Not
a name derived from a compose project — `control`'s project is `tc49` and its
own network is `tc49_default` — because the point of this one is that it
belongs to no single project. The name is a contract in four repositories and
is the expensive half of this decision.

**Only the containers the door reaches join it.** For `control` that is `web`,
`store` and `broker`, and nothing else. `scheduler`, `dispatcher`, `driver`,
`layout`, `dccex`, `dccex-usb` and `simulator` stay on `control`'s own default
network. They talk to the bus, not to browsers, and the door has no route to
any of them.

**A container on the shared network carries `traefik.docker.network=rails49`.**
Each of the three is on two networks, and the docker provider picks a container
IP; without the label it picks whichever network it finds first, which is a
route that works until it does not.

## What this narrows in ADR-0009

ADR-0009's sentence is that every stack joins. The unit is the container, not
the stack, so a stack joins the shared network partly. What every stack owes is
unchanged — join, and declare your own routers as labels — but it is owed by
the containers a browser reaches rather than by all of them.

## Consequences

Compose gives a service a network alias of its own name on every network it
joins, so `control`'s `web`, `store` and `broker` are those names on the shared
network. A second stack with a container of the same name would collide there.
Routing survives it, because the docker provider resolves to a container IP
rather than by name, but anything that resolves a bare name across stacks does
not. `occupancy` and `dccex` should assume the shared network is a namespace
they are sharing.

`control` keeps its default network and its internal traffic is unchanged.
`broker` sits on both: its apps reach it on the default network, browsers reach
it through the door.

## Considered

**Every container of every stack joins.** ADR-0009 read literally. It puts
eleven of `control`'s containers on a network shared with two other projects so
that none of them can be reached from it, and makes the namespace above three
times more crowded for nothing.

**The network named for the installation's domain.** It would be unique per box
and could never collide. It would also be a name that changes when the box is
renamed, which is a name four repositories cannot hardcode — and hardcoding it
is the entire point.

**Each stack creating the network if absent.** No ordering requirement, no
"declared as external, but could not be found". Also no single owner of its
options, and the first stack to start silently decides them.
