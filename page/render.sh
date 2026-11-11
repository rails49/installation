#!/bin/sh
#
# The installation page, rendered to stdout from the template beside this
# script and the box's declaration in the environment.
#
#     BOX_DOMAIN=gleis49.org BOX_UIS="control jmri" ./page/render.sh
#
# One item per declared label, in the order the operator declared them; the
# text is the label. The apex is not a label and is never listed — the page is
# what lives there.
#
# On a box with a box name each label links to that label under the box name.
# On a box with no certificate (`BOX_DOMAIN` empty) each label links to its UI
# port at `<hostname>.local`, and a label with no UI port is listed with no
# link. A link to a label with a UI port carries that port as `data-ui-port`:
# opened over plain HTTP, the page's script moves the link to that port at the
# host the page was reached at. The page's title and band carry the box name,
# or the box's hostname, read from `HOSTNAME_FILE`.
#
# The page holds two facts about a UI: its label and its UI port.
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

if [ -n "$BOX_DOMAIN" ]; then
  NAME=$BOX_DOMAIN
else
  NAME=$(cat "${HOSTNAME_FILE:-/host/hostname}")
fi
export NAME

LINKS=""
for label in $BOX_UIS; do
  [ -z "$LINKS" ] || LINKS="$LINKS
"
  port=$(ui_port "$label")
  if [ -n "$BOX_DOMAIN" ] && [ -n "$port" ]; then
    item=$(printf '<li><a href="https://%s.%s" data-ui-port="%s">%s</a></li>' \
      "$label" "$BOX_DOMAIN" "$port" "$label")
  elif [ -n "$BOX_DOMAIN" ]; then
    item=$(printf '<li><a href="https://%s.%s">%s</a></li>' \
      "$label" "$BOX_DOMAIN" "$label")
  elif [ -n "$port" ]; then
    item=$(printf '<li><a href="http://%s.local:%s" data-ui-port="%s">%s</a></li>' \
      "$NAME" "$port" "$port" "$label")
  else
    item="<li>$label</li>"
  fi
  LINKS="$LINKS$item"
done
export LINKS

# awk rather than sed: what goes in is whole lines of HTML, holding slashes and
# ampersands that a sed replacement would read as its own. Through the
# environment rather than `-v`, which reads escape sequences and refuses a
# value with a newline in it.
#
# The braces are escaped because this runs under the awk in the stock nginx
# image, which is busybox's. A brace opens a repetition there, so `{{` is a
# repetition with nothing in front of it and the script exits 1 before writing
# a byte — the container then restarts forever, the door files it under
# "non running container", and every name the box serves answers 404. The awk
# on a development machine is GNU's or mawk's, both of which read a brace with
# nothing to repeat as the literal it plainly is, so this ran green everywhere
# except the only place it runs for real.
awk '
  { gsub(/\{\{NAME\}\}/, ENVIRON["NAME"]); gsub(/\{\{LINKS\}\}/, ENVIRON["LINKS"]); print }
' "$here/index.template.html"
