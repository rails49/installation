# The look rules' values, copied

`tokens.css` beside this file is a **verbatim copy** of
[`docs/tokens.css`](https://github.com/rails49/.github/blob/main/docs/tokens.css)
in `rails49/.github`, taken at:

    c91e9bea6680808edab65675998ab49ea6309cd3

[ADR-0005](https://github.com/rails49/.github/blob/main/docs/adr/0005-the-look-rules-travel-as-a-copied-file-not-a-package.md)
decides that nothing is installed: every consumer copies the file, records the
commit it came from, and keeps a check asserting that the values it actually
draws with equal the copy's. The recorded commit is the pin a git dependency
would have given.

## What the installation page takes

Tokens and the band. No rail, since the page offers nothing to press — it is a
list of links and the first thing an operator sees on the box. That is the
landing page's row in
[LOOK.md](https://github.com/rails49/.github/blob/main/docs/LOOK.md), for the
same reason, and the installation page takes its own row there when this lands.

So `--band` and `--band-ink` are declared in `page/index.template.html`'s
`:root` and the band draws with them. The four rail values are **deliberately
absent**: there is no rail here for them to be the size or colour of, and a
value nothing draws with is a value that can drift unseen.

JMRI takes none of this and has no band. A name and a certificate begin nothing
else (ADR-0002).

## The copy is inert

Nothing links `tokens.css` and the page does not load it — `test/page.test.ts`
reads it. How this page expresses the values is its own business (ADR-0003):
they are two custom properties in the template's `<style>` block, which is all
a static page has.

## The check runs in the gate

It is the second half of the one test over the rendered page, so the values are
checked against what an operator actually receives rather than against the
template. It never reaches the network, so it cannot go red on someone else's
commit in `.github`; it goes red on an edit here, which is the one thing it is
for. A check that reads only files in the repository it runs in runs in that
repository's required gate
([ADR-0010](https://github.com/rails49/.github/blob/main/docs/adr/0010-the-values-check-runs-in-the-consumers-gate-because-it-fetches-nothing.md)),
so there it is red before the edit lands rather than after.

## Taking a change

`.github` announces a change by filing an issue here; nothing is scheduled and
nothing is automated. To take one: replace `tokens.css` with the new file
verbatim, write the new commit above, run `scripts/check.sh`, and change
whatever it reports. A token that arrives with no expression here fails the
first assertion rather than being quietly ignored.
