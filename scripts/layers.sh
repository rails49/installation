#!/usr/bin/env bash
#
# Writes the manifest's `layers` to stdout: for each image the release pins,
# by its digest, the layers of its linux/amd64 and linux/arm64 variants, each
# by digest and compressed size (#118).
#
#     scripts/layers.sh manifest.json > layers.json
#
#   {"sha256:<image>": {"linux/amd64": [{"digest": "sha256:...", "size": 123}, ...],
#                       "linux/arm64": [...]}}
#
# A box sums them before it pulls, so the bar counts the run's bytes. The
# images are the manifest's `stacks.<stack>.images`, as
# `ghcr.io/rails49/<image>`, and its `stock`, each read from the registry with
# `docker buildx imagetools inspect --raw`. A variant of another platform, or
# an image that is no index, lists nothing.
set -euo pipefail

manifest=${1:?usage: scripts/layers.sh <manifest.json>}

{
  jq -r '.stacks[].images | to_entries[] | "ghcr.io/rails49/\(.key) \(.value)"' "$manifest"
  jq -r '.stock | to_entries[] | "\(.key) \(.value)"' "$manifest"
} | sort -u | while read -r ref digest; do
  docker buildx imagetools inspect --raw "$ref@$digest" |
    jq -r '.manifests[]?
      | select(.platform.os == "linux" and (.platform.architecture == "amd64" or .platform.architecture == "arm64"))
      | "\(.platform.os)/\(.platform.architecture) \(.digest)"' |
    while read -r platform variant; do
      docker buildx imagetools inspect --raw "$ref@$variant" |
        jq -c --arg platform "$platform" '{($platform): [.layers[] | {digest, size}]}'
    done | jq -s -c --arg digest "$digest" '{($digest): (add // {})}'
done | jq -s 'add // {}'
