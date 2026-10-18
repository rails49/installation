# The installation turns the box off

[rails49/.github#32](https://github.com/rails49/.github/issues/32) made turning
the box off the installation's: a UI may ask for it, and whether this box can
be turned off is the installation's answer. It fixed the two requests and the
`Origin` rule, and left this repository to say what serves them.

## Decision

**A service `box` serves `GET /box` and `POST /box/off`.** It is stock
`node:22-slim` running one script from `box/`, mounted as a directory for the
page's reason (control#353). Node's standard library only, so nothing is
installed and no image is built.

**It is privileged and in the box's PID namespace.** Turning off is
`nsenter -t 1 -m -u -i -n -p -- systemctl poweroff`, run in PID 1's namespaces.
The command takes nothing from the request.

**Whether the box can be turned off is whether PID 1 is `systemd`.** It is on
a box. On a Mac with Docker Desktop, PID 1 belongs to Docker's virtual machine,
and turning that off is not turning off the Mac, so the answer there is no and
`POST /box/off` answers `409`.

**`202` goes out first, then the command runs.** After the command starts
there is nobody left to answer, so a failure goes to the container's log.

**One router, on every name the door serves.** `PathPrefix(`/box`)` with no
`Host`, so the two paths are on the box name and on every label's name — every
origin a UI is served from. Priority `100`, above every label's own router,
which would otherwise take `/box` under its name. `tls=true` with no resolver:
each name's own router already has its certificate.

**A page on another origin is refused.** An `Origin` that is present and whose
host and port differ from `Host` answers `403`, by the rule the store and the
broker apply (control ADR-0055, ADR-0057). No `Origin` goes through. control's
rule also admits a loopback origin whatever the `Host`; this one does not,
because nothing answers `/box` at `localhost` (rails49/.github ADR-0011).

**No authentication.** The LAN is the trust boundary (control ADR-0042).

## Consequences

Any page served on the LAN under one of the box's names can turn the box off.
That is every UI on the box, and it is the point.

The service can do anything on the box that root can. Its script is what
limits it, and the script runs one command with no argument from the request.

Coming back takes a person at the box.

## Considered

**A systemd unit on the box, listening on a socket the door reaches.** It
needs no privileged container. It also needs an install step outside compose,
and a box would no longer be the five steps in the README.

**The Docker socket instead of `nsenter`.** The socket starts and stops
containers; it does not turn off the machine. A container that does still has
to be privileged.

**One router per label, `Host` and `PathPrefix`.** The labels are in
`BOX_UIS`, which compose labels cannot iterate. A rule with no `Host` covers
every name, including a label added later.
