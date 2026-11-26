// The Box group (disk free, memory, IP address, and on a box with a box name
// the certificate and whether the box name resolves to this box) and the
// Docker group (the Engine against the release's tested ones, the log
// driver).

import { css, html, LitElement, nothing, type TemplateResult } from "lit";

import { gb, mb } from "./format.js";
import { GROUP } from "./group.js";
import type { Status } from "./status.js";

export class BoxFacts extends LitElement {
  static override readonly styles = [
    GROUP,
    css`
      :host {
        display: block;
      }

      dl {
        display: grid;
        gap: 0.5rem 1.5rem;
        grid-template-columns: max-content 1fr;
      }

      dt {
        font-weight: var(--sl-font-weight-semibold);
      }

      dd {
        margin: 0;
      }
    `,
  ];

  static override readonly properties = {
    status: { attribute: false },
  };

  status: Status | null = null;

  override render(): TemplateResult | typeof nothing {
    if (!this.status) return nothing;
    const { name, disk, memory, address, certificate, resolves, docker } = this.status;
    return html`
      <fieldset class="group">
        <legend>Box</legend>
        <dl>
          <dt>Disk free</dt>
          <dd>${gb(disk.free)} of ${gb(disk.total)}</dd>
          ${memory
            ? html`
                <dt>Memory</dt>
                <dd>${mb(memory.used)} used of ${mb(memory.total)}</dd>
              `
            : nothing}
          <dt>IP address</dt>
          <dd>${address ? `${address}. Reserve this address for the box in your router.` : "none"}</dd>
          ${resolves
            ? html`
                <dt>Certificate</dt>
                <dd>
                  ${certificate
                    ? `${certificate.valid ? "" : "not valid, "}expires ${certificate.expires.slice(0, 10)}`
                    : "could not be read"}
                </dd>
                <dt>Box name</dt>
                <dd>${name} resolves to ${resolves.to_this_box ? "this box" : resolves.addresses.join(", ") || "nothing"}</dd>
              `
            : nothing}
        </dl>
      </fieldset>
      <fieldset class="group">
        <legend>Docker</legend>
        <dl>
          <dt>Docker Engine</dt>
          <dd>${docker.version}${docker.tested.length ? `, release tested on ${docker.tested.join(" and ")}` : ""}</dd>
          <dt>Log driver</dt>
          <dd>${docker.log_driver}</dd>
        </dl>
      </fieldset>
    `;
  }
}

customElements.define("box-facts", BoxFacts);

declare global {
  interface HTMLElementTagNameMap {
    "box-facts": BoxFacts;
  }
}
