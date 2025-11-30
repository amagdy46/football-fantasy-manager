import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/modules": path.resolve(__dirname, "./src/modules"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/test": path.resolve(__dirname, "./src/test"),
    },
  },
});
