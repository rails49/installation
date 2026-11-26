// What the page runs: look's stylesheet, where Shoelace's assets are served
// from, and the page. Shoelace's assets are on the page's own origin at
// `/box/shoelace` (`vite.config.ts`).

import "@rails49/look/look.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";

import "./box-page.js";

setBasePath("/box/shoelace");
