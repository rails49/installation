#!/usr/bin/env bash
#
# Asks a running box, from a machine on its LAN, whether every way into every
# UI admits the UI's own page and refuses a page on another origin.
#
#     scripts/probe.sh rails49
#     scripts/probe.sh <address> <hostname> <box name> <label>...
#
# With one argument it reads the box name and the labels from
# /etc/rails49/box.env over ssh, with the box's hostname and address. With
# more, they are the arguments; the box name is '' for a box with no
# certificate.
#
# For each label with a UI port, each way in is `https://<label>.<box name>`,
# `http://<box name>:<port>` and `http://<label>.<box name>:<port>` on a box
# with a box name, and `http://<hostname>.local:<port>` and
# `http://<address>:<port>` on every box. On each, `/box` and each websocket
# path of the UI are asked twice: with the way in as `Origin`, which wants 200
# or 101, and with a foreign `Origin`, which wants 403. Port 80 is asked
# whether it redirects the box name and serves the page at the address and
# the `.local` name.
#
# Exits 1 when any answer is not the one wanted, and prints every answer.
set -euo pipefail

if [ $# -eq 1 ]; then
  facts=$(ssh "$1" '. /etc/rails49/box.env && printf "%s\n%s\n" "$BOX_DOMAIN" "$BOX_UIS" &&
    hostname && ip -4 route get 1.1.1.1 | sed -n "s/.* src \([0-9.]*\).*/\1/p"')
  { read -r domain; read -r uis; read -r host; read -r address; } <<<"$facts"
elif [ $# -ge 3 ]; then
  address=$1 host=$2 domain=$3
  shift 3
  uis="$*"
else
  echo "usage: scripts/probe.sh user@host | <address> <hostname> <box name> <label>..." >&2
  exit 2
fi

# README's table of UI ports. test/compose.test.ts checks it against the table.
ui_port() {
  case $1 in
    control) echo 8081 ;;
    dccex) echo 8082 ;;
    jmri) echo 8083 ;;
    occupancy) echo 8084 ;;
  esac
}

# Each UI's websocket paths, as `<path>:<subprotocol>`. These are the UIs'
# own and change with them; this list is what the probe asks.
ws_paths() {
  case $1 in
    control) echo "/mqtt:mqtt" ;;
    dccex) echo "/mqtt:mqtt /dccex-usb/stream:" ;;
    jmri) echo "/websockify:binary" ;;
  esac
}

FOREIGN=http://foreign.invalid
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT

# The status code of one request. A websocket that opens stays open, so the
# request is cut off after two seconds and the 101 it already printed stands.
status() {
  curl -sk -o /dev/null -m 2 -w '%{http_code}' "$@" || true
}

# `check <want> <url> <origin> [<subprotocol>]`: one request, in the
# background, with `-` for no `Origin`. With a fourth argument, empty or not,
# it is a websocket handshake. Each writes its line to a file of its own, so
# the lines print in the order asked.
checks=0
check() {
  local want=$1 url=$2 origin=$3 args=(--url "$2")
  checks=$((checks + 1))
  [ "$origin" = - ] || args+=(-H "Origin: $origin")
  if [ $# -ge 4 ]; then
    args+=(--http1.1 -H "Connection: Upgrade" -H "Upgrade: websocket"
      -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==")
    [ -z "$4" ] || args+=(-H "Sec-WebSocket-Protocol: $4")
  fi
  {
    local got mark=FAIL
    got=$(status "${args[@]}")
    [ "$got" != "$want" ] || mark=ok
    printf '%-4s %s want %s  %s  Origin: %s\n' "$mark" "$got" "$want" "$url" "$origin"
  } >"$scratch/$(printf '%04d' "$checks")" &
}

# The door and `box` may have just been recreated by a deploy.
for _ in $(seq 30); do
  [ "$(status "http://$address/box")" = 200 ] && break
  sleep 1
done

# A way in: its origin, and the websocket paths asked on it.
way_in() {
  local base=$1 entry
  check 200 "$base/box" "$base"
  check 403 "$base/box" "$FOREIGN"
  for entry in $2; do
    check 101 "$base${entry%%:*}" "$base" "${entry#*:}"
    check 403 "$base${entry%%:*}" "$FOREIGN" "${entry#*:}"
  done
}

if [ -n "$domain" ]; then
  check 301 "http://$domain/" -
  check 301 "http://$domain/box" -
  way_in "https://$domain" ""
fi
check 200 "http://$address/" -
check 200 "http://$host.local/" -
way_in "http://$address" ""
way_in "http://$host.local" ""

for label in $uis; do
  port=$(ui_port "$label")
  [ -n "$port" ] || continue
  paths=$(ws_paths "$label")
  if [ -n "$domain" ]; then
    way_in "https://$label.$domain" "$paths"
    way_in "http://$domain:$port" "$paths"
    way_in "http://$label.$domain:$port" "$paths"
  fi
  way_in "http://$host.local:$port" "$paths"
  way_in "http://$address:$port" "$paths"
done

wait
cat "$scratch"/*
! grep -q '^FAIL' "$scratch"/*
