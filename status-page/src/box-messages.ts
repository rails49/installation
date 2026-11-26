// The Errors and Notes groups, first on the page: each failure in a sentence
// in a red group, or "No errors."; each note, such as a stack on a local
// build, in a group after it. A refused press's sentence comes first among
// the errors.

import { css, html, LitElement, nothing, type TemplateResult } from "lit";

import { sentence } from "./format.js";
import { GROUP } from "./group.js";
import type { Status } from "./status.js";

export class BoxMessages extends LitElement {
  static override readonly styles = [
    GROUP,
    css`
      :host {
        display: block;
      }

      p {
        margin: 0 0 1rem;
      }

      .failures {
        background: var(--sl-color-danger-50);
        border-color: var(--sl-color-danger-600);
        color: var(--sl-color-danger-700);
      }
    `,
  ];

  static override readonly properties = {
    status: { attribute: false },
    refusal: { attribute: false },
  };

  status: Status | null = null;

  /** Why `box` refused the last press, in its sentence, or null. */
  refusal: string | null = null;

  override render(): TemplateResult | typeof nothing {
    if (!this.status) return nothing;
    const failures = [...(this.refusal ? [this.refusal] : []), ...this.status.failures];
    const { notes } = this.status;
    return html`
      ${failures.length
        ? html`
            <fieldset class="group failures">
              <legend>Errors</legend>
              <ul>
                ${failures.map((failure) => html`<li>${sentence(failure)}</li>`)}
              </ul>
            </fieldset>
          `
        : html`<p><span class="dot ok"></span>No errors.</p>`}
      ${notes.length
        ? html`
            <fieldset class="group">
              <legend>Notes</legend>
              <ul>
                ${notes.map((note) => html`<li>${sentence(note)}</li>`)}
              </ul>
            </fieldset>
          `
        : nothing}
    `;
  }
}

customElements.define("box-messages", BoxMessages);

declare global {
  interface HTMLElementTagNameMap {
    "box-messages": BoxMessages;
  }
}
