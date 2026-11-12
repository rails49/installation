#!/usr/bin/env bash
#
# The gate: everything that has to be green before work lands. One exit code,
# so a verdict never rests on remembering which commands to run.
#
#   shell scripts  checked with shellcheck
#   compose files  parsed with `docker compose config`
#   workflows      checked with actionlint
#   the box        its script asked once in the stock image it is built on
#   the pages      look-check over the page and the status page
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

# The workflows, with the shellcheck actionlint's image carries over each
# `run:`.
if [ -n "$(git ls-files '.github/workflows/*.yml')" ]; then
  run actionlint docker run --rm -v "$ROOT:/repo:ro" -w /repo rhysd/actionlint:1.7.12
fi

# Each compose file three ways. Against the example declaration, which is what
# a box with a box name writes to `/etc/rails49/box.env`, with the
# `compose.https.yaml` beside it over it, as a box with a box name starts it.
# With `BOX_DOMAIN` empty and no provider, which is a box with no certificate,
# and without that file (#92). And with `BOX_DOMAIN` unset, which every file
# refuses (`${BOX_DOMAIN?...}`) so that a stack started without the
# declaration stops rather than coming up half named. A `compose.https.yaml`
# is labels over another file and is not read on its own.
# shellcheck disable=SC2329  # called through `run`
refuses_unset_domain() {
  local out
  if out=$(env -u BOX_DOMAIN docker compose "$@" config -q 2>&1); then
    echo "accepted with BOX_DOMAIN unset"
    return 1
  fi
  grep -q BOX_DOMAIN <<<"$out" || { printf '%s\n' "$out"; return 1; }
}

compose_files=$(git ls-files '*compose*.yml' '*compose*.yaml' | grep -Ev '(^|/)compose\.https\.yaml$')
for f in $compose_files; do
  named=(-f "$f")
  what=$f
  https=${f%"${f##*/}"}compose.https.yaml
  if [ -f "$https" ]; then
    named+=(-f "$https")
    what="$f + $https"
  fi
  run "compose $what with a box name" \
    docker compose --env-file box.env.example "${named[@]}" config -q
  run "compose $f with no certificate" \
    env -u BOX_ACME_PROVIDER BOX_DOMAIN= BOX_UIS="control jmri" \
    docker compose -f "$f" config -q
  run "compose $what refuses no declaration" refuses_unset_domain "${named[@]}"
done

# The page rendered by the awk that will render it. Everything above reads the
# files; this one runs the script in the stock image the page is built on,
# because the difference between that awk and a development machine's is
# what the reading missed: a regex GNU awk accepts and busybox rejects
# took the page down on the first box it reached, and nothing here saw it.
if [ -f page/render.sh ]; then
  # The page in both kinds of box. With no certificate it reads the hostname
  # the way compose mounts it. Each has to hold a link with its UI port and a
  # label with no UI port: with a box name, a link under the box name and one
  # with no port; with no certificate, a link on `.local` and a label listed
  # as text.
  page_base=$(sed -n "s/^FROM //p" page/Dockerfile)
  # shellcheck disable=SC2329  # called through `run`
  page_renders() {
    local domain=$1 out mounts=(-v "$ROOT/page:/page:ro")
    shift
    [ -n "$domain" ] || mounts+=(-v /etc/hostname:/host/hostname:ro)
    out=$(docker run --rm -e BOX_DOMAIN="$domain" -e BOX_UIS='control turntable' \
      "${mounts[@]}" "$page_base" /page/render.sh) || return 1
    for want in "$@"; do
      grep -qF "$want" <<<"$out" || { printf 'missing: %s\n%s\n' "$want" "$out"; return 1; }
    done
  }
  run "page renders in nginx:alpine with a box name" page_renders example.org \
    '<a href="https://control.example.org" data-ui-port="8081">control</a>' \
    '<a href="https://turntable.example.org">turntable</a>'
  run "page renders in nginx:alpine with no certificate" page_renders "" \
    '.local:8081" data-ui-port="8081">control</a>' \
    '<li>turntable</li>'

  # Fails when the page or the status page styles look's band. At the tag of
  # the committed `look/look.bundle.js`, which a release of look moves with it.
  run look-check pnpm --package=github:rails49/look#v0.11.0 dlx look-check page box
fi

# The box's script in the stock image it is built on, whose node is older than a
# development machine's, and the `nsenter` it turns the box off with. The tests
# cover what it answers; this asks it one question under that node, with an
# `Origin`, which is the path through the newest API it uses.
if [ -f box/server.mjs ]; then
  box_base=$(sed -n "s/^FROM //p" box/Dockerfile)
  run "box answers in node:22-slim" \
    docker run --rm -v "$ROOT/box:/box:ro" "$box_base" sh -c \
      'command -v nsenter >/dev/null && node --input-type=module -e "
        import { handle } from \"/box/server.mjs\";
        const request = { method: \"GET\", url: \"/box\", headers: { origin: \"null\" } };
        const box = { pid1: \"\", turnOff() {} };
        if ((await handle(request, box)).status !== 403) process.exit(1);
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
