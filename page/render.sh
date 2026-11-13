#!/bin/sh
#
# The installation page, rendered to stdout from the template beside this
# script and the box's declaration in the environment.
#
#     BOX_DOMAIN=example.org BOX_UIS="control jmri" ./page/render.sh
#
# One item per declared label: an icon, the label and a line of text. The
# labels this script knows come first, in its order; any other declared label
# follows in the order the operator declared it, with the default icon and no
# text. The apex is not a label and is never listed — the page is what lives
# there. After them, always: the status page and rails49.org.
#
# On a box with a box name each label links to that label under the box name.
# On a box with no certificate (`BOX_DOMAIN` empty) each label links to its UI
# port at `<hostname>.local`, and a label with no UI port is listed with no
# link. A link to a label with a UI port carries that port as `data-ui-port`:
# opened over plain HTTP, the page's script moves the link to that port at the
# host the page was reached at. The page's title and band carry the box name,
# or the box's hostname, read from `HOSTNAME_FILE`.
#
# The page holds four facts about a UI: its label, its UI port, its icon and
# its line of text.
#
# `sh` rather than bash: the container this runs in is stock nginx, which has
# none. Word splitting is what reads `BOX_UIS`, so it is left on deliberately.
set -eu

here=$(dirname "$0")

: "${BOX_DOMAIN?the name this box is reached at, empty for a box with no certificate, from /etc/rails49/box.env}"
# A box that serves nothing is an ordinary box: the door is up, the page is
# there, and it lists nothing yet.
BOX_UIS=${BOX_UIS:-}

# The UI ports: README's table, and the door's flags open the same ones.
ui_port() {
  case $1 in
    control) echo 8081 ;;
    dccex) echo 8082 ;;
    jmri) echo 8083 ;;
    occupancy) echo 8084 ;;
  esac
}

# The UIs the page knows, in the order it lists them, and each one's icon (a
# file in `icons/`) and line of text.
KNOWN="control occupancy jmri dccex"

ui_icon() {
  case $1 in
    control) echo train-front ;;
    occupancy) echo cctv ;;
    jmri) echo cpu ;;
    dccex) echo circuit-board ;;
    *) echo app-window ;;
  esac
}

ui_text() {
  case $1 in
    control) echo "Schedule, dispatch and drive trains." ;;
    occupancy) echo "See which track is occupied, from a camera." ;;
    jmri) echo "JMRI, with DecoderPro for programming locos." ;;
    dccex) echo "The DCC-EX command station: firmware, serial monitor and script." ;;
  esac
}

# An item's content: its icon, its name and, when it has one, its line of text.
content() {
  printf '%s<span class="name">%s</span>' "$(cat "$here/icons/$1.svg")" "$2"
  [ -z "$3" ] || printf '<span class="text">%s</span>' "$3"
}

if [ -n "$BOX_DOMAIN" ]; then
  NAME=$BOX_DOMAIN
else
  NAME=$(cat "${HOSTNAME_FILE:-/host/hostname}")
fi
export NAME

declared() {
  for label in $BOX_UIS; do
    [ "$label" != "$1" ] || return 0
  done
  return 1
}

LISTED=""
for label in $KNOWN; do
  ! declared "$label" || LISTED="$LISTED $label"
done
for label in $BOX_UIS; do
  case " $KNOWN " in
    *" $label "*) ;;
    *) LISTED="$LISTED $label" ;;
  esac
done

LINKS=""
for label in $LISTED; do
  [ -z "$LINKS" ] || LINKS="$LINKS
"
  port=$(ui_port "$label")
  body=$(content "$(ui_icon "$label")" "$label" "$(ui_text "$label")")
  if [ -n "$BOX_DOMAIN" ] && [ -n "$port" ]; then
    item=$(printf '<li><a class="item" href="https://%s.%s" data-ui-port="%s">%s</a></li>' \
      "$label" "$BOX_DOMAIN" "$port" "$body")
  elif [ -n "$BOX_DOMAIN" ]; then
    item=$(printf '<li><a class="item" href="https://%s.%s">%s</a></li>' \
      "$label" "$BOX_DOMAIN" "$body")
  elif [ -n "$port" ]; then
    item=$(printf '<li><a class="item" href="http://%s.local:%s" data-ui-port="%s">%s</a></li>' \
      "$NAME" "$port" "$port" "$body")
  else
    item=$(printf '<li><span class="item">%s</span></li>' "$body")
  fi
  LINKS="$LINKS$item"
done
export LINKS

# Relative, so the status page stays on the host and port this page was
# reached at.
ALWAYS=$(printf '<li><a class="item" href="/box/">%s</a></li>\n<li><a class="item" href="https://rails49.org/">%s</a></li>' \
  "$(content activity "Server (box) status &amp; updates" "Software version and errors.")" \
  "$(content globe rails49.org "The project's site and documentation.")")
export ALWAYS

# awk rather than sed: what goes in is whole lines of HTML, holding slashes and
# ampersands that a sed replacement would read as its own. Through the
# environment rather than `-v`, which reads escape sequences and refuses a
# value with a newline in it.
#
# index() and substr() rather than gsub(): a gsub replacement reads `&` as the
# text it matched, so "&amp;" came out as "{{ALWAYS}}amp;". And this runs under
# the awk in the stock nginx image, which is busybox's, where a brace in a
# regex opens a repetition: an unescaped `{{` exits 1 before writing a byte,
# the container restarts forever, and every name the box serves answers 404.
awk '
  function put(s, key, val,   out, i) {
    out = ""
    while ((i = index(s, key)) > 0) {
      out = out substr(s, 1, i - 1) val
      s = substr(s, i + length(key))
    }
    return out s
  }
  { $0 = put($0, "{{NAME}}", ENVIRON["NAME"]); $0 = put($0, "{{LINKS}}", ENVIRON["LINKS"]); $0 = put($0, "{{ALWAYS}}", ENVIRON["ALWAYS"]); print }
' "$here/index.template.html"
