#!/usr/bin/env bash
#
# Pins every `image:` in a release's box files to the digest the manifest
# names for it, in place.
#
#     scripts/pin.sh manifest.json box/
#
# Each compose file under the directory is rewritten:
#
#   ghcr.io/rails49/<image>:${<VAR>:-dev}  ->  ghcr.io/rails49/<image>:<commit>@<digest>
#   <stock image>                          ->  <stock image>@<digest>
#
# from the manifest's `stacks.<stack>.commit` and `.images.<image>`, and its
# `stock.<stock image>`. An image already carrying a digest is left as it is,
# and so is an alias (`image: *image`). Exits 1, naming each, when any `image:`
# is left without a digest.
set -euo pipefail

manifest=${1:?usage: scripts/pin.sh <manifest.json> <dir>}
dir=${2:?usage: scripts/pin.sh <manifest.json> <dir>}

# A sed script with one substitution per image the manifest names.
script=$(
  jq -r '.stacks[] | .commit as $commit | .images | to_entries[] | "\(.key) \($commit) \(.value)"' \
    "$manifest" |
    while read -r image commit digest; do
      printf 's|ghcr\\.io/rails49/%s:\\${[A-Z_]*:-dev}$|ghcr.io/rails49/%s:%s@%s|\n' \
        "$image" "$image" "$commit" "$digest"
    done
  jq -r '.stock | to_entries[] | "\(.key) \(.value)"' "$manifest" |
    while read -r ref digest; do
      pattern=$(sed 's/[].[*^$\\]/\\&/g' <<<"$ref")
      printf 's|^\\([[:space:]]*image:[[:space:]]*\\)%s$|\\1%s@%s|\n' "$pattern" "$ref" "$digest"
    done
)

unpinned=0
while IFS= read -r file; do
  sed "$script" "$file" >"$file.pinned"
  mv "$file.pinned" "$file"
  # Each `image:` value, without an anchor, that is neither an alias nor pinned.
  while IFS= read -r value; do
    echo "${file#"$dir"/}: no digest for $value" >&2
    unpinned=1
  done < <(sed -n 's/^[[:space:]]*image:[[:space:]]*\(&[^[:space:]]* \)\{0,1\}//p' "$file" |
    grep -vE '^\*|@sha256:[0-9a-f]{64}$' || true)
done < <(find "$dir" -type f \( -name '*compose*.yaml' -o -name '*compose*.yml' \) | sort)

exit "$unpinned"
