/// <reference lib="dom" />
// On the status page, ticking dccex, jmri or occupancy ticks control, which
// each of them needs (#69 decision 10). The box ticks it again when the form
// is applied, for a browser that runs no script.

const form = document.querySelector("form.setup");
form?.addEventListener("change", () => {
  /** @type {NodeListOf<HTMLInputElement>} */
  const ticked = form.querySelectorAll('input[name="ui"]:checked');
  /** @type {HTMLInputElement | null} */
  const control = form.querySelector('input[name="ui"][value="control"]');
  if (control && [...ticked].some((input) => input.value !== "control")) control.checked = true;
});
