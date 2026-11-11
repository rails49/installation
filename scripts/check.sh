#!/usr/bin/env bash
#
# The gate: everything that has to be green before work lands. One exit code,
# so a verdict never rests on remembering which commands to run.
#
#   shell scripts  checked with shellcheck
#   compose files  parsed with `docker compose config`
#   the box        its script asked once in the image that runs it
#   the page       look-check over it
#   the tests      tsc over them, then vitest
#
# The gate is green when it finds nothing to check. Each check grows a section
# here as the thing it checks arrives.
#
# Every check runs even after one has failed, and the failures are named again
# at the end. Stopping at the first red would report one broken thing per
# invocation — the wrong shape for anyone, agent or human, handed the output
# and asked to fix what they broke.

set -uo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT" || exit 1

# Accumulated as a string rather than an array: macOS ships bash 3.2, where an
# empty array under `set -u` is itself an error.
failed=""

run() {
  local what=$1
  shift
  printf '\n=== %s ===\n' "$what"
  "$@" || failed="$failed $what"
}

shell_files=$(git ls-files '*.sh')
if [ -n "$shell_files" ]; then
  if command -v shellcheck >/dev/null; then
    # shellcheck disable=SC2086  # the list is one path per line, no spaces
    run shellcheck shellcheck $shell_files
  else
    printf '\n=== shellcheck ===\nnot installed: brew install shellcheck\n'
    failed="$failed shellcheck"
  fi
fi

# Each compose file three ways. Against the example declaration, which is what
# a box with a box name writes to `/etc/rails49/box.env`. With `BOX_DOMAIN`
# empty and no provider, which is a box with no certificate. And with
# `BOX_DOMAIN` unset, which every file refuses (`${BOX_DOMAIN?...}`) so that a
# stack started without the declaration stops rather than coming up half
# named.
# shellcheck disable=SC2329  # called through `run`
refuses_unset_domain() {
  local out
  if out=$(env -u BOX_DOMAIN docker compose -f "$1" config -q 2>&1); then
    echo "accepted with BOX_DOMAIN unset"
    return 1
  fi
  grep -q BOX_DOMAIN <<<"$out" || { printf '%s\n' "$out"; return 1; }
}

compose_files=$(git ls-files '*compose*.yml' '*compose*.yaml')
for f in $compose_files; do
  run "compose $f with a box name" \
    docker compose --env-file box.env.example -f "$f" config -q
  run "compose $f with no certificate" \
    env -u BOX_ACME_PROVIDER BOX_DOMAIN= BOX_UIS="control jmri" \
    docker compose -f "$f" config -q
  run "compose $f refuses no declaration" refuses_unset_domain "$f"
done

# The page rendered by the awk that will render it. Everything above reads the
# files; this one runs the script in the image the box runs it in, because the
# difference between that awk and a development machine's is exactly what the
# reading missed: a regex GNU awk accepts and busybox rejects took the page
# down on the first box it reached, and nothing here saw it.
if [ -f page/render.sh ]; then
  # With a box name the page itself goes to /dev/null: what is being checked
  # is that the script completes, and a failure prints what awk said on
  # stderr. With no certificate it also reads the hostname the way compose
  # mounts it, and the page has to hold a link on a UI port and a label with
  # no UI port listed as text.
  run "page renders in nginx:alpine with a box name" sh -c \
    "docker run --rm -e BOX_DOMAIN=example.org -e BOX_UIS='control jmri' \
      -v '$ROOT/page:/page:ro' nginx:alpine /page/render.sh >/dev/null"

  # shellcheck disable=SC2329  # called through `run`
  page_with_no_certificate() {
    local out
    out=$(docker run --rm -e BOX_DOMAIN= -e BOX_UIS='control turntable' \
      -v "$ROOT/page:/page:ro" -v /etc/hostname:/host/hostname:ro \
      nginx:alpine /page/render.sh) || return 1
    if ! grep -q '\.local:8081" data-same-host>control</a>' <<<"$out" ||
      ! grep -q '<li>turntable</li>' <<<"$out"; then
      printf '%s\n' "$out"
      return 1
    fi
  }
  run "page renders in nginx:alpine with no certificate" page_with_no_certificate

  # Fails when the page styles look's band. At the tag of the committed
  # `look/look.bundle.js`, which a release of look moves with it.
  run look-check pnpm --package=github:rails49/look#v0.10.0 dlx look-check page
fi

# The box's script in the image that runs it, whose node is older than a
# development machine's, and the `nsenter` it turns the box off with. The tests
# cover what it answers; this asks it one question under that node, with an
# `Origin`, which is the path through the newest API it uses.
if [ -f box/server.mjs ]; then
  run "box answers in node:22-slim" \
    docker run --rm -v "$ROOT/box:/box:ro" node:22-slim sh -c \
      'command -v nsenter >/dev/null && node --input-type=module -e "
        import { handle } from \"/box/server.mjs\";
        const request = { method: \"GET\", url: \"/box\", headers: { origin: \"null\" } };
        const box = { pid1: \"\", turnOff() {} };
        if (handle(request, box).status !== 403) process.exit(1);
      "'
fi

if [ -f package.json ]; then
  # Through `run` like everything else: an install that failed would otherwise
  # be reported as two broken checks with nothing saying why.
  [ -d node_modules ] || run pnpm pnpm install
  # The binaries directly. pnpm verifies node_modules against the lockfile
  # before running a script and, without a TTY, aborts rather than replace it —
  # which happens whenever this tree is mounted into a container while
  # node_modules holds the host's binaries.
  run tsc node_modules/.bin/tsc -p tsconfig.json --noEmit
  run vitest node_modules/.bin/vitest run
fi

if [ -z "$failed" ]; then
  printf '\ngreen\n'
  exit 0
fi

printf '\nred:%s\n' "$failed"
exit 1
