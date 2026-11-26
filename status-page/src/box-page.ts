// The page: look's shell and band, and the status `GET /box/status` answered.
// It holds the status and whether `box` answers, and passes both down to the
// groups it draws as `.status` and `.answering`.
//
// It fetches the status every 2 seconds while a run or a download goes or
// while `box` does not answer, and every 30 seconds otherwise. While `box`
// does not answer it keeps the status it last showed and says so above it.
// It reloads once when the box runs an installation commit other than the
// one the page was built from; an empty commit on either side never reloads.

import "@rails49/look";
import { css, html, LitElement, nothing, type TemplateResult } from "lit";

import { COMMIT } from "./commit.js";
import type { Status } from "./status.js";

const TITLE = "Server (box) status & updates";

/** How long `box` may not answer before the page says so. */
const QUIET = 3 * 60_000;

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

    .restarting {
      font-weight: var(--sl-font-weight-semibold);
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
  commit = COMMIT;

  /** Loads the page again, from `box`. */
  reload: () => void = () => location.reload();

  /** When the fetches that are failing began failing, or null while `box`
   *  answers. */
  #silent: number | null = null;

  #timer: ReturnType<typeof setTimeout> | undefined;

  #reloaded = false;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.refresh();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.#timer);
  }

  /** Fetches the status now, as after a press, and the next one after the
   *  usual wait. */
  async refresh(): Promise<void> {
    try {
      const answer = await fetch("/box/status");
      if (!answer.ok) throw new Error(`GET /box/status answered ${answer.status}`);
      this.status = (await answer.json()) as Status;
      const runs = this.status.stacks.find((stack) => stack.stack === "installation")?.commit;
      if (runs && this.commit && runs !== this.commit && !this.#reloaded) {
        this.#reloaded = true;
        this.reload();
      }
      this.answering = true;
      this.#silent = null;
    } catch {
      this.answering = false;
      this.#silent ??= Date.now();
      // The sentence changes with the time alone.
      this.requestUpdate();
    }
    const often = !this.answering || this.status?.updating?.running || this.status?.download?.running;
    clearTimeout(this.#timer);
    if (this.isConnected) this.#timer = setTimeout(() => void this.refresh(), often ? 2_000 : 30_000);
  }

  override updated(): void {
    document.title = this.status ? `${TITLE}: ${this.status.name}` : TITLE;
  }

  /** What the page says while `box` does not answer. */
  #restarting(): TemplateResult | typeof nothing {
    if (this.#silent === null) return nothing;
    const said =
      Date.now() - this.#silent >= QUIET ? "The box has not answered for 3 minutes." : "The box is restarting.";
    return html`<p class="restarting">${said}</p>`;
  }

  override render(): TemplateResult {
    return html`
      <look-shell>
        <look-band ui="status" help="https://github.com/rails49/installation#the-status-page">
          <look-about name=${this.status?.name ?? ""}></look-about>
        </look-band>
        <main>
          ${this.#restarting()}
        </main>
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
