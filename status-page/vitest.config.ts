import { defineConfig } from "vitest/config";

// The components, mounted in happy-dom, apart from `vite.config.ts` so that
// what the image builds is not changed by what the tests need. happy-dom does
// no layout: no test asserts a width, a wrap or a height.
export default defineConfig({
  define: {
    __INSTALLATION_COMMIT__: JSON.stringify(""),
  },
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.ts"],
    setupFiles: ["test/mounted.ts"],
    // A Shoelace dialog shut while it opens cancels its animation, and
    // happy-dom rejects the cancelled animation's promise where a browser
    // marks it handled. That rejection, and no other, is not a failure.
    onUnhandledError: (error) =>
      error.name === "AbortError" && error.message === "The animation was canceled." ? false : undefined,
  },
});
