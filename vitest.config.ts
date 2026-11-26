import { defineConfig } from "vitest/config";

// The repository's own tests. `status-page/` has its own Vitest config and
// runs its tests itself.
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
});
