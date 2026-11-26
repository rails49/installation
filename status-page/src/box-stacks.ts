// The Stacks group: the installation and each stack the box runs, by the
// name the page gives it and in the page's order, with a dot for its state,
// its memory, its disk and its commit.

import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { repeat } from "lit/directives/repeat.js";

import { mb, NAMES, ORDER } from "./format.js";
import { GROUP } from "./group.js";
import type { Stack, Status } from "./status.js";

const DOTS = { running: "ok", restarting: "bad", stopped: "off" } as const;

export class BoxStacks extends LitElement {
  static override readonly styles = [
    GROUP,
    css`
      :host {
        display: block;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      th,
      td {
        border-bottom: 1px solid var(--sl-color-neutral-200);
        padding: 0.5rem 0;
        text-align: left;
      }

      th + th,
      td + td {
        padding-left: 1rem;
      }

      .number {
        text-align: right;
        white-space: nowrap;
      }
    `,
  ];

  static override readonly properties = {
    status: { attribute: false },
  };

  status: Status | null = null;

  override render(): TemplateResult | typeof nothing {
    if (!this.status) return nothing;
    const stacks = [...this.status.stacks].sort((a, b) => ORDER.indexOf(a.stack) - ORDER.indexOf(b.stack));
    return html`
      <fieldset class="group">
        <legend>Stacks</legend>
        <table>
          <thead>
            <tr>
              <th>Stack</th>
              <th>State</th>
              <th class="number">Memory</th>
              <th class="number">Disk</th>
              <th>Commit</th>
            </tr>
          </thead>
          <tbody>
            ${repeat(stacks, ({ stack }) => stack, row)}
          </tbody>
        </table>
      </fieldset>
    `;
  }
}

function row({ stack, state, commit, memory, disk }: Stack): TemplateResult {
  return html`
    <tr>
      <td><span class="dot ${DOTS[state]}"></span>${NAMES.get(stack) ?? stack}</td>
      <td>${state}</td>
      <td class="number">${memory === null ? "" : mb(memory)}</td>
      <td class="number">${disk === null ? "" : mb(disk)}</td>
      <td>${commit ? commit.slice(0, 7) : "n/a"}</td>
    </tr>
  `;
}

customElements.define("box-stacks", BoxStacks);

declare global {
  interface HTMLElementTagNameMap {
    "box-stacks": BoxStacks;
  }
}
