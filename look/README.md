# look

`look.bundle.js` beside this file is the single-file build of
`rails49/look@v0.12.0`, committed because the box may have no internet. The page loads it from `/look/`, and it
draws the page's band. `look.css` is look's stylesheet at the same tag, which
the page links in its head so that it is drawn styled the first time (#95).

A release of look opens a pull request here that replaces both files and moves
every `rails49/look@v…` and `rails49/look#v…` to the new tag, this line and the
gate's `look-check` among them. It merges itself when the gate is green.
