import { defineConfig } from "vitest/config";

// The components, mounted in happy-dom. happy-dom does no layout: no test
// asserts a width, a wrap or a height.
export default defineConfig({
  define: {
    __INSTALLATION_COMMIT__: JSON.stringify(""),
  },
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.ts"],
    setupFiles: ["test/mounted.ts"],
    // A device's `sl-select` in box-setup cancels the animation of its list
    // where it is shut or removed while the list opens, and happy-dom
    // rejects the cancelled animation's promise where a browser marks it
    // handled. That rejection, and no other, is not a failure.
    onUnhandledError: (error) =>
      error.name === "AbortError" && error.message === "The animation was canceled." ? false : undefined,
  },
});
