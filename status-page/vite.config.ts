import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// The status page, built into `dist/` under the base `/box/`, which is where
// `box` serves it (`box/server.mjs`). The box image's node stage runs this
// (`box/Dockerfile`).
//
// `INSTALLATION_COMMIT` is the commit the box image is built from. The build
// bakes it into the page (`src/commit.ts`); it is empty where none was named.
//
// The proxy is the development server's: `BOX=<url of a box> pnpm dev` sends
// the status, the presses and the log bundle to that box. The request keeps
// the development server's Host, and the page's Origin is the same host, so
// `box`'s same-origin rule lets it through.
const BOX_ROUTES = [
  "/box/status",
  "/box/check",
  "/box/prereleases",
  "/box/download",
  "/box/update",
  "/box/back",
  "/box/setup",
  "/box/bundle",
];
const box = process.env["BOX"];

export default defineConfig({
  base: "/box/",
  define: {
    __INSTALLATION_COMMIT__: JSON.stringify(process.env["INSTALLATION_COMMIT"] ?? ""),
  },
  // Shoelace's assets, served from the page's own origin at `/box/shoelace`
  // (`src/main.ts`).
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@shoelace-style/shoelace/dist/assets",
          dest: "shoelace",
          rename: { stripBase: 4 },
        },
      ],
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: box
      ? Object.fromEntries(BOX_ROUTES.map((route) => [route, { target: box, changeOrigin: false }]))
      : {},
  },
});
