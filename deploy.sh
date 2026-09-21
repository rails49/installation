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
# Which repository this box pulls from is state outside the checkout: a line in
# `.git/config` on this one machine that the deploy depends on and cannot see.
# A box whose remote had an ssh URL GitHub no longer had a key for stopped
# control's deploy before it did anything (control#541), so this sets it rather
# than trusting it. HTTPS, because the repository is public: nothing to
# register, no key to rotate, no credential on the box.
ORIGIN=https://github.com/rails49/installation.git
was=$(git remote get-url origin)
if [ "$was" != "$ORIGIN" ]; then
  # Only when it changed one: a box that drifted leaves the old URL in the
  # deploy log, and a box that was right says nothing.
  echo "origin was $was; pulling from $ORIGIN" >&2
  git remote set-url origin "$ORIGIN"
fi
git pull
# The box's own declaration, at the path every stack reads. Not a copy in this
# clone: a value that lives in one clone makes that clone a prerequisite of
# every other stack.
docker compose --env-file /etc/rails49/box.env up -d --remove-orphans
REMOTE
