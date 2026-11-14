import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(import.meta.dirname, "tests/helpers/server-only.ts"),
      "@": path.resolve(import.meta.dirname),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    fileParallelism: false,
    restoreMocks: true,
    clearMocks: true,
  },
});
