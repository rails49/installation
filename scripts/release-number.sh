#!/usr/bin/env bash
#
# The next release number in a month, from the tags already made.
#
#     git ls-remote --tags --refs origin | sed 's|.*refs/tags/||' |
#       scripts/release-number.sh 2026.11
#
# Reads one tag per line on stdin and prints `<month>.<n>`, where n is one more
# than the highest `<month>.<n>` among them, or 0 when there is none. Other
# tags are ignored.
set -euo pipefail

month=${1:?usage: scripts/release-number.sh <year>.<month> < tags}
pattern="^${month//./\\.}\\.[0-9]+$"

last=$(grep -E "$pattern" | sed 's/.*\.//' | sort -n | tail -1 || true)
echo "$month.$((${last:--1} + 1))"
