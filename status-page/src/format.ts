// How the page says what `GET /box/status` holds: sizes, memory, times in
// UTC, each stack by its name in the page's order, a sentence with a commit
// in backticks set as code, and a progress bar.

import { html, type TemplateResult } from "lit";

/** A sentence, with each part in backticks set as code. */
export function sentence(text: string): (string | TemplateResult)[] {
  return text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? html`<code>${part}</code>` : part));
}

/** A bar of `current` of `total`, labelled with what it says. The component
 *  that draws it imports Shoelace's progress bar. */
export function bar(current: number, total: number, said: string): TemplateResult {
  return html`<sl-progress-bar value=${(current / total) * 100} label=${said}></sl-progress-bar>`;
}

/** Memory, and a stack's disk, in whole megabytes of 2^20 bytes. */
export function mb(bytes: number): string {
  return `${Math.round(bytes / 2 ** 20).toLocaleString("en-US")} MB`;
}

/** The box's disk, in gigabytes of 10^9 bytes to a tenth. */
export function gb(bytes: number): string {
  return `${(bytes / 1e9).toFixed(1)} GB`;
}

/** A download's or a pull's bytes: in gigabytes from one, and in megabytes
 *  under it. */
export function size(bytes: number): string {
  return bytes >= 1e9 ? gb(bytes) : `${Math.round(bytes / 1e6)} MB`;
}

/** A time from `GET /box/status`, to the minute, in UTC. */
export function when(iso: string): string {
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

/** Each stack by the name the page gives it, in the order the page lists
 *  them. */
export const NAMES = new Map([
  ["installation", "Installation"],
  ["control", "Control"],
  ["occupancy-service", "Occupancy"],
  ["jmri", "JMRI"],
  ["dccex", "DCC-EX translator"],
]);

export const ORDER = [...NAMES.keys()];
