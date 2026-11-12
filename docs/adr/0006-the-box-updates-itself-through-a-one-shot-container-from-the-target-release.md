# The box updates itself through a one-shot container from the target release

*Amends [ADR-0005](0005-the-installation-turns-the-box-off.md): `box` has the
Docker socket.*

Resolves [#65](https://github.com/rails49/installation/issues/65) decision 22.
First run on `gleis49` and `pi49` in
[#67](https://github.com/rails49/installation/issues/67)'s acceptance, on
2026-11-12.

A box moves to another release on a press on its status page: every stack it
declares, the installation included. Whatever does that recreates `box`,
which serves the press.

## Decision

**`box` starts a container that does the work, and does none of it itself.**
On "Update to" or "Go back to", `box` starts `rails49-update` with the Docker
socket, in no compose project, and answers. The container brings every
declared stack up from the release, checks them, writes the result and exits.
Recreating the installation recreates `box` and the door, and the container is
in neither, so it carries on.

**The container is the target release's `installation-box` image.** An update
runs the new release's code for updating, and going back runs the old
release's. A release whose way of bringing up its stacks has changed brings
that change with it, and an update never depends on code the box has not
pulled yet.

**`box` has the Docker socket.** It reads the stacks for the status page and
starts the container through it. With the socket it can do anything on the box
that root can, as it already could by being privileged.

## Consequences

Two releases' `installation-box` images must agree on how one is started: the
action, the two releases, and the environment `box` hands it. `box` of one
release starts the container of another.

What the container is doing reaches the page only through a file under
`/var/lib/rails49`, since `box` may be recreated while it runs.

## Considered

**`box` runs compose itself.** Recreating the installation stops `box`
partway, with the other stacks not yet brought up and nothing left to record
the result.

**A systemd unit or a script on the box.** It needs an install step outside
compose, and the code that updates would not move with the release.

**Watchtower.** It is archived, and it follows moving tags per container,
where a release pins every image by digest (dccex ADR-0005).
