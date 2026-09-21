#!/bin/sh
#
# The installation page, rendered to stdout from the template beside this
# script and the box's declaration in the environment.
#
#     BOX_DOMAIN=gleis49.org BOX_UIS="control jmri" ./page/render.sh
#
# One link per declared label, in the order the operator declared them: the
# text is the label, the address is that label under the box's name. The apex
# is not a label and is never listed — the page is what lives there.
#
# The installation holds no other fact about any UI, so a UI that did not exist
# when this was written needs no change here.
#
# `sh` rather than bash: the container this runs in is stock nginx, which has
# none. Word splitting is what reads `BOX_UIS`, so it is left on deliberately.
set -eu

here=$(dirname "$0")

: "${BOX_DOMAIN:?the name this box is reached at, from /etc/rails49/box.env}"
# A box that serves nothing is an ordinary box: the door is up, the page is
# there, and it lists nothing yet.
BOX_UIS=${BOX_UIS:-}

LINKS=""
for label in $BOX_UIS; do
  [ -z "$LINKS" ] || LINKS="$LINKS
"
  LINKS="$LINKS$(printf '<li><a href="https://%s.%s">%s</a></li>' \
    "$label" "$BOX_DOMAIN" "$label")"
done
export LINKS

# awk rather than sed: what goes in is whole lines of HTML, holding slashes and
# ampersands that a sed replacement would read as its own. Through the
# environment rather than `-v`, which reads escape sequences and refuses a
# value with a newline in it.
awk '
  { gsub(/{{BOX_DOMAIN}}/, ENVIRON["BOX_DOMAIN"]); gsub(/{{LINKS}}/, ENVIRON["LINKS"]); print }
' "$here/index.template.html"
