#!/usr/bin/env bash
#
# Push this checkout to a box and bring the installation back up. A
# maintainer's convenience for the routine case, not the install path —
# installing is prose, and README.md is where it is written.
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
git pull
# The box's own declaration, at the path every stack reads. Not a copy in this
# clone: a value that lives in one clone makes that clone a prerequisite of
# every other stack.
#
# `--remove-orphans` because this stack holds 443: a service renamed between
# two versions of the file leaves a container bound to that port, and the one
# replacing it cannot start.
docker compose --env-file /etc/rails49/box.env up -d --remove-orphans
REMOTE
