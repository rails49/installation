#!/usr/bin/env bash
#
# The gate: everything that has to be green before work lands. One exit code,
# so a verdict never rests on remembering which commands to run.
#
#   shell scripts  checked with shellcheck
#   compose files  parsed with `docker compose config`
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

# Against the example declaration, which is what a box writes to
# `/etc/rails49/box.env`: the files below say `${BOX_DOMAIN:?...}` so that a
# stack started without it stops rather than coming up half named, and that
# makes the example part of what is being parsed.
compose_files=$(git ls-files '*compose*.yml' '*compose*.yaml')
for f in $compose_files; do
  run "compose $f" docker compose --env-file box.env.example -f "$f" config -q
done

if [ -f package.json ]; then
  [ -d node_modules ] || pnpm install
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
