// The release group while an update, going back or applying the setup runs:
// what the run does and its steps, those done ticked and the current one with
// a spinner. While it pulls, a bar of the run's bytes, or of the images done
// where the manifest lists no layers. While it watches, the seconds left,
// counted down every second from the step's `since`. A run that lists no
// steps says the step in a sentence.

import "@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import { css, html, LitElement, type TemplateResult } from "lit";
import { repeat } from "lit/directives/repeat.js";

import type { Pull, Run, Status, Step } from "./status.js";

/** What the step list calls each step of a run. */
const STEPS: Record<Step, string> = {
  download: "Download release",
  pull: "Pull images",
  stop: "Stop stacks no longer chosen",
  start: "Start stacks",
  watch: "Watch for 60 seconds",
  probe: "Probe",
  prune: "Remove unused images",
};

export class BoxProgress extends LitElement {
  static override readonly styles = css`
    :host {
      display: block;
    }

    .group {
      background: var(--sl-color-neutral-50);
      border: 1px solid var(--sl-color-neutral-200);
      border-radius: var(--sl-border-radius-medium);
      display: grid;
      gap: 0.5rem;
      margin: 0 0 1rem;
      min-width: 0;
      padding: 0.5rem 1rem 0.75rem;
    }

    legend {
      background: var(--sl-color-neutral-0);
      border-radius: var(--sl-border-radius-medium);
      font-weight: var(--sl-font-weight-bold);
      padding: 0 0.375rem;
    }

    p,
    ol {
      margin: 0;
    }

    .steps {
      list-style: none;
      padding: 0;
    }

    .steps li {
      color: var(--sl-color-neutral-500);
      padding-left: 1.5rem;
      text-indent: -1.5rem;
    }

    .steps .done,
    .steps .current {
      color: inherit;
    }

    .steps .done::before {
      color: var(--sl-color-success-600);
      content: "✓";
      display: inline-block;
      margin-right: 0.5rem;
      text-align: center;
      text-indent: 0;
      width: 1rem;
    }

    sl-spinner {
      font-size: 1rem;
      margin-right: 0.5rem;
      text-indent: 0;
      vertical-align: -0.125rem;
    }
  `;

  static override readonly properties = {
    status: { attribute: false },
  };

  /** The status `box` answered, with a run that goes. */
  status: Status | null = null;

  override render(): TemplateResult {
    const run = this.status?.updating;
    return html`
      <fieldset class="group">
        <legend>Release</legend>
        ${run ? this.#run(run) : ""}
      </fieldset>
    `;
  }

  /** Redraws every second, for the countdown. */
  #tick: ReturnType<typeof setInterval> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#tick = setInterval(() => this.requestUpdate(), 1000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.#tick);
  }

  #run(run: Run): TemplateResult {
    const steps = run.steps ?? [];
    if (!steps.length) return html`<p class="updating">${doing(run)}: ${said(run)}</p>`;
    const current = run.at ? steps.indexOf(run.at) : steps.length;
    return html`
      <p>${doing(run)}</p>
      <ol class="steps">
        ${repeat(
          steps,
          (step) => step,
          (step, i) =>
            html`<li class=${i < current ? "done" : i === current ? "current" : ""}>
              ${i === current ? html`<sl-spinner></sl-spinner>${this.#current(run, step)}` : STEPS[step]}
            </li>`,
        )}
      </ol>
    `;
  }

  /** What the step the run is at says: while it watches, the seconds left;
   *  while JMRI is built, that it is; while it pulls, a bar and the image
   *  with its bytes. */
  #current({ since, pull, building }: Run, step: Step): TemplateResult | string {
    if (step === "watch" && since) {
      const left = Math.max(0, Math.ceil(60 - (Date.now() - Date.parse(since)) / 1000));
      return `Watching for 60 seconds: ${left} left`;
    }
    if (step === "pull" && building) return "Building JMRI";
    if (step === "pull" && pull) {
      const image = repository(pull.image).replace(/^.*\//, "");
      if (pull.run?.total) {
        const { current, total } = pull.run;
        const said = `${size(current)} of ${size(total)}`;
        return html`${STEPS[step]} ${bar(current, total, said)} ${image}; ${said}`;
      }
      const done = pull.index - 1;
      return html`${STEPS[step]} ${bar(done, pull.count, `${done} of ${pull.count}`)} ${image}${bytes(pull)}`;
    }
    return STEPS[step];
  }
}

/** A bar of `current` of `total`, labelled with what it says. */
function bar(current: number, total: number, said: string): TemplateResult {
  return html`<sl-progress-bar value=${(current / total) * 100} label=${said}></sl-progress-bar>`;
}

/** The step, and while an image is pulled, which, of how many, and its
 *  bytes as far as they are known. */
function said({ step, pull }: Run): string {
  if (!pull) return step;
  return `${step.replace(/\.$/, "")}: ${repository(pull.image)}, image ${pull.index} of ${pull.count}${bytes(pull)}.`;
}

/** The image pulled, without its tag and digest. */
function repository(image: string): string {
  return image.replace(/@.*$/, "").replace(/:[^/:]*$/, "");
}

/** The bytes pulled of the image's total, once the stream has said any. */
function bytes({ current, total }: Pull): string {
  return total ? `, ${size(current)} of ${size(total)}` : "";
}

/** Bytes as the page says them while an image is pulled: in gigabytes from
 *  one, and in megabytes under it. */
function size(bytes: number): string {
  return bytes >= 1e9 ? `${(bytes / 1e9).toFixed(1)} GB` : `${Math.round(bytes / 1e6)} MB`;
}

/** What the run does. */
function doing({ action, to }: Run): string {
  return action === "apply" ? "Applying the setup" : `${action === "update" ? "Updating" : "Going back"} to ${to}`;
}

customElements.define("box-progress", BoxProgress);

declare global {
  interface HTMLElementTagNameMap {
    "box-progress": BoxProgress;
  }
}
