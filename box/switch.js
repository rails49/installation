/// <reference lib="dom" />
// On the status page, changing a switch under "Check for update" posts the
// form it is in, as a press of the button in its place does in a browser that
// runs no script (#142). The form's hidden input says what the change turns
// it to.

document.addEventListener("sl-change", (event) => {
  const target = /** @type {Element} */ (event.target);
  if (target.matches("sl-switch")) target.closest("form")?.submit();
});
