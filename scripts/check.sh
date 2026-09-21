#!/usr/bin/env bash
#
# The gate: everything that has to be green before work lands. One exit code,
# so a verdict never rests on remembering which commands to run.
#
#   shellcheck     every shell script in the tree
#   compose        every compose file parses
#
# The repository holds neither yet, and the gate is green when it finds
# nothing to check. Each check grows a section here as the thing it checks
# arrives.
#
# Every check runs even after one has failed, and the failures are named again
# at the end. Stopping at the first red would report one broken thing per
# invocation — the wrong shape for anyone, agent or human, handed the output
# and asked to fix what they broke.

set -uo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"

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

compose_files=$(git ls-files '*compose*.yml' '*compose*.yaml')
for f in $compose_files; do
  run "compose $f" docker compose -f "$f" config -q
done

if [ -z "$failed" ]; then
  printf '\ngreen\n'
  exit 0
fi

printf '\nred:%s\n' "$failed"
exit 1
