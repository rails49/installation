// A press a group asks `box-page` to send: a `box-press` event, bubbling and
// composed, whose detail is the route to POST and its form-encoded body.

export interface Press {
  route: string;
  body: URLSearchParams;
}

/** The event that asks `box-page` to POST `body` to `route`. */
export function press(route: string, body = new URLSearchParams()): CustomEvent<Press> {
  return new CustomEvent("box-press", { detail: { route, body }, bubbles: true, composed: true });
}
