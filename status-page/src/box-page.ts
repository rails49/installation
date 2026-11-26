// The page: look's shell and band, and the status `GET /box/status` answered.
// It holds the status and whether `box` answers, and passes both down to the
// groups it draws as `.status` and `.answering`.

import "@rails49/look";
import { css, html, LitElement, type TemplateResult } from "lit";

import { COMMIT } from "./commit.js";
import type { Status } from "./status.js";

const TITLE = "Server (box) status & updates";

export class BoxPage extends LitElement {
  static override readonly styles = css`
    :host {
      display: block;
    }

    main {
      margin: 0 auto;
      max-width: 48rem;
      padding: 2rem 1.5rem;
    }
  `;

  static override readonly properties = {
    status: { state: true },
    answering: { state: true },
  };

  /** What `box` last answered, or null before it has. */
  status: Status | null = null;

  /** Whether `box` answered the last fetch. False until it has. */
  answering = false;

  /** The installation commit the page was built from, empty where the build
   *  named none. */
  readonly commit = COMMIT;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#fetch();
  }

  async #fetch(): Promise<void> {
    try {
      const answer = await fetch("/box/status");
      if (!answer.ok) throw new Error(`GET /box/status answered ${answer.status}`);
      this.status = (await answer.json()) as Status;
      this.answering = true;
    } catch {
      this.answering = false;
    }
  }

  override updated(): void {
    document.title = this.status ? `${TITLE}: ${this.status.name}` : TITLE;
  }

  override render(): TemplateResult {
    return html`
      <look-shell>
        <look-band ui="status" help="https://github.com/rails49/installation#the-status-page">
          <look-about name=${this.status?.name ?? ""}></look-about>
        </look-band>
        <main></main>
      </look-shell>
    `;
  }
}

customElements.define("box-page", BoxPage);

declare global {
  interface HTMLElementTagNameMap {
    "box-page": BoxPage;
  }
}
