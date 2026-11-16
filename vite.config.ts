/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    // Three.js (módulos 3D) e math.js (Laboratório) são pedaços grandes, mas só carregam quando
    // a página que usa cada um é aberta; a página inicial fica em torno de 75 kB gzip.
    chunkSizeWarningLimit: 1100,
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
