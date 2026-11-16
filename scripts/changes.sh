#!/usr/bin/env bash
#
# The pull requests merged between two releases, for the notes of a release
# that is marked as a full release.
#
#     scripts/changes.sh 2026.11.11 2026.11.12
#
# Reads each release's manifest.json and prints, for every stack whose commit
# moved, a "== <stack>" line and then one "rails49/<stack>#<number> <title>"
# line per pull request that merged a commit in between.
set -euo pipefail

from=$1
to=$2
manifest() {
  gh release download "$1" --repo rails49/installation --pattern manifest.json --output -
}
old=$(manifest "$from")

manifest "$to" | jq -r --argjson old "$old" '
  .stacks | to_entries[]
  | ($old.stacks[.key].commit) as $was
  | select(.value.commit != $was)
  | "\(.key) \($was) \(.value.commit)"
' |
  while read -r stack was now; do
    echo "== $stack"
    gh api "repos/rails49/$stack/compare/$was...$now" --jq '.commits[].sha' |
      while read -r sha; do
        gh api "repos/rails49/$stack/commits/$sha/pulls" \
          --jq ".[] | \"rails49/$stack#\(.number) \(.title)\""
      done | awk '!seen[$0]++'
  done
