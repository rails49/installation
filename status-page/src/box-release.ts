// The release group while nothing runs: the release the box runs; what the
// last check found, with how far downloading it has got or why it is not
// downloaded, and the update to it once it is; going back; that the
// railroad stops while its stacks restart; when the box last checked; and
// the check with its two switches. Each button sits on its sentence's row,
// and the switches on the row under the check.
//
// A press asks `box-page` to post it (`press.ts`). A switch posts as it is
// flipped. Every button and switch is disabled while `box` does not answer.

import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js";
import "@shoelace-style/shoelace/dist/components/switch/switch.js";
import type SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.js";
import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { live } from "lit/directives/live.js";

import { bar, gb, size, when } from "./format.js";
import { GROUP, ROW } from "./group.js";
import { press } from "./press.js";
import type { Download, Status, Update } from "./status.js";

export class BoxRelease extends LitElement {
  static override readonly styles = [
    GROUP,
    ROW,
    css`
      :host {
        display: block;
      }

      /* A sentence on the left and its buttons at the right edge. */
      .row {
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .row p {
        flex: 1 1 12rem;
      }

      /* The download's bar, under its sentence. */
      .row sl-progress-bar {
        flex-basis: 100%;
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

  override render(): TemplateResult | typeof nothing {
    if (!this.status) return nothing;
    const { release, update, back, download, stacks } = this.status;
    // The installation runs whenever the page is served, and is no railroad.
    const railroad = stacks.some(({ stack, state }) => stack !== "installation" && state !== "stopped");
    const latest = update.available ? available(update, download) : found(update);
    const offer = update.available && update.downloaded;
    return html`
      <fieldset class="group">
        <legend>Release</legend>
        ${row(release ? `This box runs release ${release}.` : "This box runs no release yet.")}
        ${latest
          ? row(latest, [
              offer
                ? this.#button("/box/update", `Update to ${update.prerelease ? "pre-release " : ""}${update.latest}`)
                : nothing,
              downloading(update, download),
            ])
          : nothing}
        ${back ? row("", [this.#button("/box/back", `Revert to ${back}`)]) : nothing}
        ${railroad && (offer || back) ? html`<p>The railroad stops while its stacks restart.</p>` : nothing}
        ${row(checked(update), [this.#button("/box/check", "Check for update")])}
        ${row("", [
          this.#switch("prereleases", "Pre-releases", update.prereleases),
          this.#switch("download", "Download automatically", update.download),
        ])}
      </fieldset>
    `;
  }

  #button(route: string, label: string): TemplateResult {
    return html`<sl-button
      variant="primary"
      size="small"
      ?disabled=${!this.answering}
      @click=${() => this.dispatchEvent(press(route))}
      >${label}</sl-button
    >`;
  }

  /** A switch that posts `/box/<name>` with `<name>=yes` or `no` as it is
   *  flipped. */
  #switch(name: string, label: string, on: boolean): TemplateResult {
    const flipped = (event: Event) => {
      const body = new URLSearchParams({ [name]: (event.target as SlSwitch).checked ? "yes" : "no" });
      this.dispatchEvent(press(`/box/${name}`, body));
    };
    return html`<sl-switch .checked=${live(on)} ?disabled=${!this.answering} @sl-change=${flipped}
      >${label}</sl-switch
    >`;
  }
}

/** A row: its sentence, where it has one, and its buttons and switches. */
function row(said: string, controls: unknown[] = []): TemplateResult {
  return html`<div class="row">${said ? html`<p>${said}</p>` : nothing}${controls}</div>`;
}

/** What the last check found where no newer release is out, or "" before
 *  one has succeeded. */
function found(update: Update): string {
  if (update.checked === null || update.could_not_check) return "";
  if (update.newer) return `It is newer than the latest release, ${update.latest ?? ""}.`;
  return update.latest ? "It is the latest release." : "No release is out yet.";
}

/** When the box last checked, or that it could not. */
function checked(update: Update): string {
  if (update.could_not_check) {
    return `Could not check. ${update.succeeded ? `The last check that succeeded was at ${when(update.succeeded)}.` : "No check has succeeded yet."}`;
  }
  return update.checked === null ? "Not checked yet." : `Checked at ${when(update.checked)}.`;
}

/** What the page says of a newer release that is out: that it is available,
 *  and how far downloading it has got, or why it is not downloaded: refused
 *  for want of room before it pulls, or stopped for it between pulls. */
function available(update: Update, download: Download | null): string {
  const latest = update.latest ?? "";
  const is = `New ${update.prerelease ? "pre-release" : "release"} ${latest} is available.`;
  const again = update.download ? "The box tries again at its next check." : "Check for update tries again.";
  const ours = ofLatest(update, download);
  if (!ours) return update.download ? is : `${is} Check for update downloads it.`;
  if (ours.downloaded) return is;
  if (ours.running) {
    return ours.bytes?.total
      ? `${is} Downloaded ${size(ours.bytes.current)} of ${size(ours.bytes.total)}.`
      : `${is} Downloading it.`;
  }
  if (ours.finished === null) {
    return `Could not download ${latest}: it stopped before it finished. Its log is in the log bundle. ${again}`;
  }
  if (ours.disk && "keeps" in ours.disk) {
    return `Stopped downloading ${latest}: ${gb(ours.disk.free)} is free, and the box keeps ${ours.disk.keeps / 1e9} GB free. ${again}`;
  }
  if (ours.disk) {
    const room = `Not enough free disk to download ${latest}: it needs ${gb(ours.disk.needs)}, ${gb(ours.disk.free)} is free.`;
    return update.download ? room : `${room} ${again}`;
  }
  return `Could not download ${latest}: ${ours.failure ?? "it stopped."} ${again}`;
}

/** The download, where it is of the latest release, or null. */
function ofLatest(update: Update, download: Download | null): Download | null {
  return download?.release === update.latest ? download : null;
}

/** While a newer release downloads, a bar of its bytes downloaded of their
 *  total, under what the page says of it. */
function downloading(update: Update, download: Download | null): TemplateResult | typeof nothing {
  const ours = ofLatest(update, download);
  if (!update.available || !ours || ours.downloaded || !ours.running || !ours.bytes?.total) return nothing;
  const { current, total } = ours.bytes;
  return bar(current, total, `${size(current)} of ${size(total)}`);
}

customElements.define("box-release", BoxRelease);

declare global {
  interface HTMLElementTagNameMap {
    "box-release": BoxRelease;
  }
}
