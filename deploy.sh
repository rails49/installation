#!/usr/bin/env bash
#
# Push this checkout to a box and bring the installation back up. A
# maintainer's convenience for the routine case, not the install path, which
# is `install.sh`.
#
# On the box it pulls, refuses a clone that is not clean, and builds the page
# and the box there under the commit it pulled. Nothing is pulled from GHCR.
#
#     ./deploy.sh ttmetro@gleis49.org
#     RAILS49_BOX=ttmetro@gleis49.org ./deploy.sh
#
# The box is an argument or an environment variable and has no default: a
# repository other operators install must not name the box this project happens
# to run. `~/.ssh/config` can name it too — `./deploy.sh rails49` works — but
# nothing here depends on that file, which is personal, is in no repository,
# and has taken a deploy down by losing a stanza (control#488, control#496).
#
# Last, scripts/probe.sh asks every way into every UI on the box whether it
# admits the UI's own page and refuses a foreign one, from this machine, which
# has to be on the box's LAN. It prints what it found. The exit code is the
# deploy's, not the probe's.
#
# JMRI is not deployed here. It is an optional extra with a compose project of
# its own (ADR-0002), and a box that wants it says so once by hand.
set -euo pipefail

box=${1:-${RAILS49_BOX:-}}
if [ -z "$box" ]; then
  echo "usage: ./deploy.sh [user@host]   (or set RAILS49_BOX)" >&2
  exit 2
fi

# An ssh command on a line of its own opens a session, and what came after it
# would run on this machine instead, so the whole sequence is fed to a shell
# there. A login shell, so the box's PATH is the one a person logs in to.
ssh "$box" bash -l -s <<'REMOTE'
set -euo pipefail
# The heredoc is this shell's stdin, so a prompt for a git credential would
# read the rest of the script as the answer. Fail instead.
export GIT_TERMINAL_PROMPT=0
cd ~/installation
# The page and the box are named by the commit they are built from. A clone
# with changes in it is refused before the pull and left as it was.
dirty=$(git status --porcelain)
if [ -n "$dirty" ]; then
  echo "~/installation is not clean, and its images would be named after a" >&2
  echo "commit that is not what was built:" >&2
  echo "$dirty" >&2
  exit 1
fi
git pull
commit=$(git rev-parse HEAD)
# The box's own declaration, at the path every stack reads. Not a copy in this
# clone: a value that lives in one clone makes that clone a prerequisite of
# every other stack.
#
# `--build` builds the page and the box here, under the commit. `up -d` then
# recreates each whose image changed. `--remove-orphans` because this stack
# holds 443: a service renamed between two versions of the file leaves a
# container bound to that port, and the one replacing it cannot start.
INSTALLATION_COMMIT=$commit \
  docker compose --env-file /etc/rails49/box.env up -d --build --remove-orphans
REMOTE

"$(dirname "$0")/scripts/probe.sh" "$box" || echo "probe: some answers were not the ones wanted, above" >&2
