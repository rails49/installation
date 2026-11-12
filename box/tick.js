/// <reference lib="dom" />
// On the status page, ticking dccex or occupancy ticks control, whose broker
// each of them dials (#69 decision 10). jmri does not (#89 decision 2). `box`
// ticks it again when the form is applied, for a browser that runs no script.

const form = document.querySelector("form.setup");
form?.addEventListener("change", () => {
  /** @type {NodeListOf<HTMLInputElement>} */
  const ticked = form.querySelectorAll('input[name="ui"]:checked');
  /** @type {HTMLInputElement | null} */
  const control = form.querySelector('input[name="ui"][value="control"]');
  if (control && [...ticked].some((input) => ["dccex", "occupancy"].includes(input.value))) control.checked = true;
});
