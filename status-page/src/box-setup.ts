// The setup form: a checkbox for each stack the box can run, ticked as the
// box declares, and a choice for each device a stack uses: none, each one
// plugged in, and one chosen but not plugged in. Apply sits in the devices
// group, the last of the form.
//
// A field the person has changed keeps their value until Apply, whatever a
// fetched status says; a field nobody touched follows the status. Ticking
// Occupancy or the DCC-EX translator ticks Control, whose broker they dial.

import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { live } from "lit/directives/live.js";
import { repeat } from "lit/directives/repeat.js";

import { NAMES, ORDER } from "./format.js";
import { GROUP, ROW } from "./group.js";
import { press } from "./press.js";
import type { Device, Status } from "./status.js";

/** The labels whose stacks dial Control's broker. */
const NEEDS_CONTROL = ["occupancy", "dccex"];

/** The last part of a device's path, which names it. */
const named = (path: string): string => path.slice(path.lastIndexOf("/") + 1);

export class BoxSetup extends LitElement {
  static override readonly styles = [
    GROUP,
    ROW,
    css`
      :host {
        display: grid;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem 1.5rem;
        margin: 0;
      }

      .group p,
      .group .row {
        flex-basis: 100%;
      }

      /* A device's name on the left and its choice at the right edge. */
      .row {
        justify-content: space-between;
      }

      .apply {
        justify-content: flex-end;
      }
    `,
  ];

  static override readonly properties = {
    status: { attribute: false },
    answering: { attribute: false },
  };

  status: Status | null = null;

  /** Whether `box` answered the last fetch. */
  answering = false;

  /** Each checkbox the person has ticked or unticked, by its label. */
  #ticked = new Map<string, boolean>();

  /** Each device the person has chosen, by its field. */
  #chosen = new Map<string, string>();

  #tick(label: string, on: boolean): void {
    this.#ticked.set(label, on);
    if (on && NEEDS_CONTROL.includes(label)) this.#ticked.set("control", true);
    this.requestUpdate();
  }

  /** Whether the checkbox that posts `label` is ticked. */
  #on(label: string): boolean {
    return this.#ticked.get(label) ?? this.status?.setup.uis.includes(label) ?? false;
  }

  /** The device chosen for `device`. */
  #choice({ field, none, current }: Device): string {
    return this.#chosen.get(field) ?? current ?? none;
  }

  /** The labels of the stacks the form offers, in the page's order, each
   *  with its stack's name. */
  #labels(): [string, string][] {
    const stacks = this.status?.setup.stacks ?? [];
    return ORDER.flatMap((name) => {
      const label = stacks.find(({ stack }) => stack === name)?.label;
      return label ? [[label, NAMES.get(name) ?? name] as [string, string]] : [];
    });
  }

  /** Asks for a press of `/box/setup` with the form, and lets every field
   *  follow the status again. */
  #apply(): void {
    const body = new URLSearchParams();
    for (const [label] of this.#labels()) if (this.#on(label)) body.append("ui", label);
    for (const device of this.status?.setup.devices ?? []) body.append(device.field, this.#choice(device));
    this.#ticked.clear();
    this.#chosen.clear();
    this.dispatchEvent(press("/box/setup", body));
  }

  /** The choice for `device`, and a line where none is plugged in. */
  #device(device: Device): TemplateResult {
    const { field, what, none, current, found } = device;
    const away = current !== null && current !== none && !found.includes(current) ? [current] : [];
    return html`
      <label class="row">
        <span>${what[0]?.toUpperCase()}${what.slice(1)}</span>
        <sl-select
          name=${field}
          size="small"
          .value=${live(this.#choice(device))}
          ?disabled=${!this.answering}
          @sl-change=${(event: Event) => {
            this.#chosen.set(field, (event.target as HTMLInputElement).value);
            this.requestUpdate();
          }}
        >
          <sl-option value=${none}>none</sl-option>
          ${found.map((path) => html`<sl-option value=${path}>${named(path)}</sl-option>`)}
          ${away.map((path) => html`<sl-option value=${path}>${named(path)}, not plugged in</sl-option>`)}
        </sl-select>
      </label>
      ${found.length ? nothing : html`<p>No ${what} is plugged in.</p>`}
    `;
  }

  override render(): TemplateResult | typeof nothing {
    if (!this.status) return nothing;
    const checkboxes = this.#labels().map(
      ([label, name]) =>
        html`<sl-checkbox
          value=${label}
          .checked=${live(this.#on(label))}
          ?disabled=${!this.answering}
          @sl-change=${(event: Event) => this.#tick(label, (event.target as HTMLInputElement).checked)}
          >${name}</sl-checkbox
        >`,
    );
    return html`
      <fieldset class="group">
        <legend>Stacks to run</legend>
        ${checkboxes}
        <p>Occupancy and DCC-EX translator use the broker installed with Control.</p>
      </fieldset>
      <fieldset class="group devices">
        <legend>Devices</legend>
        ${repeat(this.status.setup.devices, ({ field }) => field, (device) => this.#device(device))}
        <div class="row apply">
          <sl-button variant="primary" size="small" ?disabled=${!this.answering} @click=${() => this.#apply()}
            >Apply</sl-button
          >
        </div>
      </fieldset>
    `;
  }
}

customElements.define("box-setup", BoxSetup);

declare global {
  interface HTMLElementTagNameMap {
    "box-setup": BoxSetup;
  }
}
