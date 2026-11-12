#!/bin/sh
#
# Installs a box: a plain Debian-family Linux becomes a box with no
# certificate that serves nothing yet, with the door and the status page
# running (#69 decisions 4 to 8 and 11). Setup is on the status page.
#
#     curl -fsSL https://rails49.org/install | sudo sh
#     curl -fsSL https://github.com/rails49/installation/releases/download/2026.11.5/install.sh | sudo sh -s -- --release 2026.11.5
#
# The latest full release, or the one `--release` names, a pre-release
# included. It refuses on a box that has `/etc/rails49/box.env`, and leaves
# the hostname alone. README's "Install" says what it does, step by step.
set -eu

REPO=https://github.com/rails49/installation
STORE=/var/lib/rails49/tc49

usage() {
  echo "usage: install.sh [--release <number>]" >&2
  exit 2
}

fail() {
  echo "$*" >&2
  exit 1
}

release=
while [ $# -gt 0 ]; do
  case $1 in
    --release)
      [ $# -ge 2 ] || usage
      release=$2
      shift 2
      ;;
    *) usage ;;
  esac
done

host=$(hostname)
address=$(ip -4 route get 1.1.1.1 2>/dev/null | sed -n 's/.* src \([0-9.]*\).*/\1/p')

# The status page's two addresses.
addresses() {
  echo "  http://$host.local/box/"
  if [ -n "$address" ]; then
    echo "  http://$address/box/"
  fi
}

# 1. Root, apt, and a box not installed yet.
[ "$(id -u)" -eq 0 ] || fail "Run this as root: curl -fsSL https://rails49.org/install | sudo sh"
command -v apt-get >/dev/null ||
  fail "This computer has no apt. The install script needs a Debian-family Linux, such as Ubuntu Server or Raspberry Pi OS."
if [ -e /etc/rails49/box.env ]; then
  echo "This box is installed already. Updates are made on its status page:"
  addresses
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

# 2. Docker Engine from Docker's apt repository.
if ! command -v docker >/dev/null; then
  echo "Installing Docker Engine from Docker's apt repository."
  # shellcheck disable=SC1091  # the box's, not this repository's
  os=$(. /etc/os-release && echo "$ID")
  # shellcheck disable=SC1091
  codename=$(. /etc/os-release && echo "$VERSION_CODENAME")
  case $os in
    ubuntu | debian) ;;
    *) fail "Docker's apt repository has no packages for $os. Install Docker Engine by hand, then run this again." ;;
  esac
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL -o /etc/apt/keyrings/docker.asc "https://download.docker.com/linux/$os/gpg"
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$os $codename stable" \
    >/etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# 3. The mDNS responder that answers `<hostname>.local`.
if ! dpkg-query -W -f '${Status}' avahi-daemon 2>/dev/null | grep -q 'ok installed'; then
  echo "Installing avahi-daemon, which answers $host.local."
  apt-get update -q
  apt-get install -y -q avahi-daemon
fi

# 4. Docker's log driver.
if [ -e /etc/docker/daemon.json ]; then
  echo "/etc/docker/daemon.json is there already and is left as it is. The status page says which log driver Docker uses."
else
  mkdir -p /etc/docker
  echo '{"log-driver": "local"}' >/etc/docker/daemon.json
  systemctl restart docker
fi

# 5. The user the stacks' files belong to.
getent passwd rails49 >/dev/null || useradd --system --user-group --shell /usr/sbin/nologin rails49

# 6. The release, unless its files are here already.
if [ -z "$release" ]; then
  latest=$(curl -fsSLI -o /dev/null -w '%{url_effective}' "$REPO/releases/latest") ||
    fail "Could not ask GitHub for the latest release."
  release=${latest##*/}
fi
case $release in
  [0-9][0-9][0-9][0-9].*) ;;
  *) fail "There is no release $release. Name one with --release <number>." ;;
esac
dir=/var/lib/rails49/releases/$release
if [ ! -e "$dir/manifest.json" ]; then
  echo "Downloading release $release."
  rm -rf "$dir.part"
  mkdir -p "$dir.part"
  for file in manifest.json box-files.tar.gz; do
    curl -fsSL -o "$dir.part/$file" "$REPO/releases/download/$release/$file" ||
      fail "Could not download release $release from GitHub."
  done
  tar -xzf "$dir.part/box-files.tar.gz" -C "$dir.part"
  rm "$dir.part/box-files.tar.gz"
  mv "$dir.part" "$dir"
fi

# 7. The store, control.env and occupancy.env, and last box.env, which
# declares a box with no certificate that serves nothing.
uid=$(id -u rails49)
gid=$(id -g rails49)
install -d -o rails49 -g rails49 "$STORE" "$STORE/occupancy" "$STORE/jmri"
install -d -m 755 /etc/rails49
cat >/etc/rails49/control.env <<EOF
TC49_UID=$uid
TC49_GID=$gid
TC49_STORE=$STORE
COMPOSE_PROFILES=layout,sim
EOF
cat >/etc/rails49/occupancy.env <<EOF
TC49_UID=$uid
TC49_GID=$gid
TC49_STORE=$STORE
VIDEO_GID=$(getent group video | cut -d: -f3)
RENDER_GID=$(getent group render | cut -d: -f3)
OCCUPANCY_ARCHIVES=$STORE/occupancy
EOF
printf 'BOX_DOMAIN=\nBOX_UIS=\n' >/etc/rails49/box.env

# 8. `rails49-update` from the release's `installation-box` image brings the
# installation up and checks it, as an update from no release. `start()` in
# `box/update.mjs` starts it the same way.
image=$(sed -n 's/^[[:space:]]*image:[[:space:]]*\(ghcr\.io\/rails49\/installation-box:.*\)$/\1/p' \
  "$dir/installation/compose.yaml")
echo "Starting release $release. This takes a few minutes."
# The probe asks for `<hostname>.local`, which nothing in a container resolves.
set --
if [ -n "$address" ]; then
  set -- --add-host "$host.local:$address"
fi
# A run that failed left its container and its progress.
docker rm -f rails49-update >/dev/null 2>&1 || true
rm -f /var/lib/rails49/update.json
if ! {
  docker run -d --name rails49-update \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /etc/rails49:/etc/rails49:ro \
    -v /var/lib/rails49:/var/lib/rails49 \
    -e BOX_DOMAIN= -e BOX_UIS= -e "BOX_HOSTNAME=$host" -e "BOX_ADDRESS=$address" \
    "$@" "$image" node /box/update.mjs update - "$release" >/dev/null &&
    docker wait rails49-update >/dev/null &&
    grep -q '"passed":true' /var/lib/rails49/update.json
}; then
  failure=$(sed -n 's/.*"failure":"\(.*\)"}$/\1/p' /var/lib/rails49/update.json 2>/dev/null || true)
  # So that the script runs again.
  rm /etc/rails49/box.env
  echo "Release $release did not come up${failure:+: $failure}" >&2
  echo "Run the install script again once that is fixed. The status page, if it answers, has the log bundle:" >&2
  addresses >&2
  exit 1
fi

# 9. Where to go next.
echo
echo "The box is installed. Open its status page from a phone or computer on the same network, and choose what it runs:"
addresses
if [ -n "$address" ]; then
  echo "Reserve $address for this box in your router, so the address does not change."
fi
