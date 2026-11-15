#!/usr/bin/env bash
#
# The releases GitHub no longer needs to keep (#120).
#
#     gh release list --json tagName,isPrerelease,isDraft --limit 1000 |
#       scripts/old-releases.sh
#
# Reads the list on stdin and prints one release number per line: every
# release but the latest 5 full releases and the pre-releases newer than the
# latest full one, latest by number. A box needs none of them; it keeps the
# files of the release it runs and of the one to go back to on its own disk.
# Drafts and tags that are not release numbers are never printed.
set -euo pipefail

jq -r '
  def number: .tagName | split(".") | map(tonumber);
  [.[] | select(.isDraft | not) | select(.tagName | test("^[0-9]{4}\\.[0-9]{1,2}\\.[0-9]+$"))]
  | sort_by(number) | reverse
  | ([.[] | select(.isPrerelease | not)]) as $full
  | ($full[0:5] | map(.tagName)) as $kept
  | (if $full == [] then null else ($full[0] | number) end) as $latest
  | .[]
  | select(if .isPrerelease then $latest != null and number <= $latest
           else (.tagName | IN($kept[]) | not) end)
  | .tagName
'
