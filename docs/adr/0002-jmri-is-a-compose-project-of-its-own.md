# JMRI is a compose project of its own

[ADR-0009](https://github.com/rails49/.github/blob/main/docs/adr/0009-the-door-and-the-page-are-the-installations-in-a-repository-of-their-own.md)
moved JMRI's compose here and said it "rides here as an optional extra, and is
not part of the installation", with the README carrying that line. `control`
ships it today as a service under the `hardware` profile, alongside `dccex` and
`dccex-usb`.

## Decision

**JMRI lives in `jmri/compose.yaml`, a compose project of its own,** started
with its own `-f` and stopped without touching the door or the page. Not a
profile on this repository's `compose.yaml`: a profile makes JMRI a service of
the installation's own stack, which is exactly what the README next to it
denies. The separation is in the mechanism rather than only in the prose.

**It joins the `rails49` network and declares one router,**
`jmri.${BOX_DOMAIN}` onto `jmri:6901`, JMRI's noVNC.

**No port is published.** `6901` goes behind the door, which is ADR-0004's one
door per box applied to the last thing on this box still contradicting it.
`12080` is JMRI's own web server and a browser reaches it, so it is behind the
door or it is nowhere; it is nowhere until someone wants it, at which point it
gets a label of its own. `5901` is raw VNC, which is not a browser's, and
anyone who wants it has ssh. JMRI ends up reachable at exactly one address.

**JMRI stays exempt from the band and the look rules.** `LOOK.md` binds it to
nothing and a name and a certificate begin nothing else.

## Consequences

The volume moves. `control` holds JMRI's state in `tc49_jmri` — the operator's
roster and panels — and a new compose project names its volume differently.
Carrying it across is a step of the cutover, not a line in the install
instructions, where it would confuse every operator who does not already have
one.

`control`'s `--profile hardware` stops carrying `jmri` and keeps `dccex` and
`dccex-usb`.

An operator who wants JMRI runs a second compose command. That is the price of
it being an extra, and it is the same price the word "optional" was already
promising.

## Considered

**A profile on this repository's `compose.yaml`.** One file, `--profile jmri`,
and the shape `control` already uses. It also makes the README's line false.

**Leaving it in `control`.** ADR-0009 rejected this: JMRI drives a command
station, and a command-station box with no railroad is the case that decision
exists for.

**Riding with `dccex`.** It makes that project responsible for a tool it does
not build, and JMRI is used against the layout too.
