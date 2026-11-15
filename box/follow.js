/// <reference lib="dom" />
// On the status page while an update, a go-back, an apply or a download runs,
// the page follows it in place (#117). Every 2 seconds it fetches `GET /box/`
// and swaps only the parts of `main` that changed, so the band stays and the
// current step's spinner keeps turning. `box` stays the only renderer: what
// is swapped in is its page, never HTML built here from `GET /box/status`.
//
// The setup form is on the page while a release downloads. The page never
// replaces a form the fetched page also has, or anything inside it, so what
// someone has typed there stays (#130).
//
// The door and `box` are recreated on the way. While `box` does not answer,
// the page keeps what it showed, says so, and keeps trying. Once a page comes
// back without this script, what it followed has ended. After a run the page
// reloads in full once, so a new release's page code is loaded; after a
// download it swaps in the fetched page's `main` and stops. A browser that
// runs no script reloads every 5 seconds from the page's `<noscript>`.

const EVERY = 2000;
const QUIET = 3 * 60_000;
const SCRIPT = 'script[src="/box/follow.js"]';

/** When `box` first did not answer, since it last did. */
let since = /** @type {number | null} */ (null);

/** What the page follows, as the last page with this script said: "run" or "download". */
let follows = document.querySelector(SCRIPT)?.getAttribute("data-follows") ?? "run";

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
  const script = next.querySelector(SCRIPT);
  if (!main || !fresh || (!script && follows !== "download")) {
    location.reload();
    return;
  }
  main.querySelector("p.restarting")?.remove();
  swap(main, fresh);
  if (!script) return;
  follows = script.getAttribute("data-follows") ?? "run";
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
 * differs is replaced by `fresh`'s. Children that differ in number are
 * replaced all together, except those holding a form.
 *
 * A form `fresh` also has is never replaced or gone into: it stays as typed,
 * moved to where `fresh` has it if it has to be.
 *
 * @param {Node} shown
 * @param {Node} fresh
 */
function swap(shown, fresh) {
  const before = [...shown.childNodes];
  const after = [...fresh.childNodes];
  if (before.length === after.length) {
    before.forEach((node, i) => {
      const other = /** @type {ChildNode} */ (after[i]);
      if (node.isEqualNode(other)) return;
      if (isForm(node) && isForm(other) && action(node) === action(other)) return;
      if (alike(node, other)) swap(node, other);
      else node.replaceWith(graft(other, pairs(node, other)));
    });
    return;
  }
  const paired = pairs(shown, fresh);
  const used = new Set();
  const kept = after.map((other) => {
    const own = forms(other).flatMap((form) => paired.get(form) ?? []);
    if (!own.length) return other;
    const home = before.find((node) => !used.has(node) && alike(node, other) && own.every((form) => node.contains(form)));
    if (!home) return graft(other, paired);
    used.add(home);
    swap(home, other);
    return home;
  });
  kept.forEach((node, i) => {
    if (shown.childNodes[i] !== node) shown.insertBefore(node, shown.childNodes[i] ?? null);
  });
  while (shown.childNodes.length > kept.length) /** @type {ChildNode} */ (shown.lastChild).remove();
}

/** Whether `node` is an element, not a form, with `other`'s tag and attributes.
 *  @param {Node} node @param {Node} other */
function alike(node, other) {
  return node.nodeType === 1 && !isForm(node) && node.cloneNode(false).isEqualNode(other.cloneNode(false));
}

/** @param {Node} node */
function isForm(node) {
  return node.nodeName === "FORM";
}

/** @param {Node} form */
function action(form) {
  return /** @type {Element} */ (form).getAttribute("action");
}

/** The forms `node` is or holds, in order.
 *  @param {Node} node
 *  @returns {Node[]} */
function forms(node) {
  if (isForm(node)) return [node];
  return node.nodeType === 1 ? [.../** @type {Element} */ (node).querySelectorAll("form")] : [];
}

/**
 * Each form of `fresh` with the form of `shown` it stands for: the next one
 * with the same action.
 *
 * @param {Node} shown
 * @param {Node} fresh
 * @returns {Map<Node, Node>}
 */
function pairs(shown, fresh) {
  const left = forms(shown);
  const paired = new Map();
  for (const form of forms(fresh)) {
    const i = left.findIndex((other) => action(other) === action(form));
    if (i >= 0) paired.set(form, left.splice(i, 1)[0]);
  }
  return paired;
}

/**
 * `fresh`, with each of its forms that is paired put back as shown.
 *
 * @param {ChildNode} fresh
 * @param {Map<Node, Node>} paired
 * @returns {ChildNode}
 */
function graft(fresh, paired) {
  const own = paired.get(fresh);
  if (own) return /** @type {ChildNode} */ (own);
  for (const form of forms(fresh)) {
    const shown = paired.get(form);
    if (shown) /** @type {ChildNode} */ (form).replaceWith(shown);
  }
  return fresh;
}
