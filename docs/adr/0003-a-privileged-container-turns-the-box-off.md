# A privileged container turns the box off

Resolves [#25](https://github.com/rails49/installation/issues/25).

[rails49/.github ADR-0015](https://github.com/rails49/.github/blob/main/docs/adr/0015-a-ui-may-ask-the-installation-to-turn-the-box-off.md)
makes turning the box off the installation's, asked for with `GET /box` and
`POST /box/off` on every label's origin. Turning a box off takes root on the
box. The door routes only to containers it reads labels from, so whatever
answers the two requests is a container, and it has to reach the box's own
init.

## Decision

**A service `box` in this repository's `compose.yaml`, privileged and sharing
the box's process namespace (`pid: host`).** On `POST /box/off` it enters the
namespaces of the box's PID 1 and runs `systemctl poweroff`. systemd then
stops every container on the box, on every stack, as it would for a
`poweroff` typed in a shell.

**It answers yes only where the box's PID 1 is systemd.** On a Mac running
Docker Desktop, PID 1 in the shared namespace belongs to Docker's virtual
machine, and powering that off stops Docker and leaves the Mac running. It
answers no there, and on any box whose init it does not know.

**It joins the `rails49` network and declares one router** matching
`PathPrefix(/box)` on every label and on the box name, at a priority above
any label's own routers ([ADR-0001](0001-only-what-the-door-reaches-joins-the-shared-network.md)).

**No authentication.** The LAN is the trust boundary
(`control` [ADR-0042](https://github.com/rails49/control/blob/main/docs/adr/0042-the-edge-terminates-tls-and-the-lan-is-the-trust-boundary.md)),
and anyone on it can already drive a train, which can do more harm than
turning the box off. A request whose `Origin` is not the host it was sent to
is refused (`.github` ADR-0015, decision 4).

## Consequences

- The most privileged container on the box is the one any LAN client can
  reach. What it does is fixed to one command; it takes no argument that
  reaches a shell.
- No image is built: stock `node:22-slim`, whose `util-linux` carries
  `nsenter`, runs a script mounted as a directory, as the page does. JMRI's
  stays the one image this repository builds (ADR-0002).
- Nothing is installed on the box outside compose, so installing stays the
  README's steps and nothing more.
- `/box` is reserved on every label. A UI that later wants that path for
  itself is shadowed by this router.

## Considered

- **A systemd unit on the box, with the container passing the request to
  it.** It adds an install step a person has to remember, and anyone on the
  LAN can still turn the box off.
- **The Docker socket the door already mounts.** It can stop containers but
  not the box.
