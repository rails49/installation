// The look of a group on the page, which each component draws in its own
// shadow root: a bordered box with a light tint and a bold title, and the dot
// that says ok, bad or off.

import { css } from "lit";

export const GROUP = css`
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

  .group p,
  .group ul,
  .group ol,
  .group dl,
  .group table {
    margin: 0;
  }

  .group ul {
    padding-left: 1.25rem;
  }

  legend {
    background: var(--sl-color-neutral-0);
    border-radius: var(--sl-border-radius-medium);
    font-weight: var(--sl-font-weight-bold);
    padding: 0 0.375rem;
  }

  .dot {
    border-radius: 50%;
    display: inline-block;
    height: 0.625rem;
    margin-right: 0.5rem;
    width: 0.625rem;
  }

  .dot.ok {
    background: var(--sl-color-success-600);
  }

  .dot.bad {
    background: var(--sl-color-danger-600);
  }

  .dot.off {
    background: var(--sl-color-neutral-400);
  }
`;
