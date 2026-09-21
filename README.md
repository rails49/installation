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
`/etc/rails49/box.env`: `BOX_DOMAIN`, the name the box is reached at, and
`BOX_UIS`, the labels it serves. Every stack is started against that file, and
every stack that serves a UI joins the external docker network this repository
creates.

## The page

One link per label in `BOX_UIS`, rendered once when its container starts. The
text is the label, the address is `https://<label>.$BOX_DOMAIN`. The
installation holds no other fact about any UI, so a UI that did not exist when
this was written needs no change here.

## JMRI

JMRI's compose rides here as an optional extra. It is not part of the
installation — it is the one UI no repository of this project owns.

## Status

Nothing is built yet. The door and the page still live in `control`; moving
them out and cutting the names over is the work this repository exists for.
