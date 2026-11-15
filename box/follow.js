/// <reference lib="dom" />
// On the status page while an update, a go-back or an apply runs, the page
// follows the run in place (#117). Every 2 seconds it fetches `GET /box/` and
// swaps only the parts of `main` that changed, so the band stays and the
// current step's spinner keeps turning. `box` stays the only renderer: what
// is swapped in is its page, never HTML built here from `GET /box/status`.
//
// The door and `box` are recreated on the way. While `box` does not answer,
// the page keeps what it showed, says so, and keeps trying. Once a page comes
// back without this script, the run has ended, and the page reloads in full
// once, so a new release's page code is loaded. A browser that runs no script
// reloads every 5 seconds from the page's `<noscript>`.

const EVERY = 2000;
const QUIET = 3 * 60_000;
const SCRIPT = 'script[src="/box/follow.js"]';

/** When `box` first did not answer, since it last did. */
let since = /** @type {number | null} */ (null);

setTimeout(follow, EVERY);

async function follow() {
  /** @type {Document} */
  let next;
  try {
    const answer = await fetch("/box/", { cache: "no-store", signal: AbortSignal.timeout?.(10_000) });
    if (!answer.ok) throw new Error(`${answer.status}`);
    next = new DOMParser().parseFromString(await answer.text(), "text/html");
  } catch {
    since ??= Date.now();
    say(Date.now() - since >= QUIET ? "The box has not answered for 3 minutes." : "The box is restarting.");
    setTimeout(follow, EVERY);
    return;
  }
  since = null;
  const main = document.querySelector("main");
  const fresh = next.querySelector("main");
  if (!next.querySelector(SCRIPT) || !main || !fresh) {
    location.reload();
    return;
  }
  main.querySelector("p.restarting")?.remove();
  swap(main, fresh);
  setTimeout(follow, EVERY);
}

/** Says why the page has not changed, in one line at the top of `main`.
 *  @param {string} said */
function say(said) {
  const main = document.querySelector("main");
  if (!main) return;
  let line = main.querySelector("p.restarting");
  if (!line) {
    line = document.createElement("p");
    line.className = "restarting";
    main.prepend(line);
  }
  line.textContent = said;
}

/**
 * Makes `shown`'s children `fresh`'s, keeping each node that is equal and
 * each element whose tag and attributes are, and going into it. A node that
 * differs is replaced by `fresh`'s; children that differ in number are
 * replaced all together.
 *
 * @param {Node} shown
 * @param {Node} fresh
 */
function swap(shown, fresh) {
  const before = [...shown.childNodes];
  const after = [...fresh.childNodes];
  if (before.length !== after.length) {
    /** @type {Element} */ (shown).replaceChildren(...after);
    return;
  }
  before.forEach((node, i) => {
    const other = /** @type {ChildNode} */ (after[i]);
    if (node.isEqualNode(other)) return;
    if (node.nodeType === 1 && node.cloneNode(false).isEqualNode(other.cloneNode(false))) swap(node, other);
    else node.replaceWith(other);
  });
}
