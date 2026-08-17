import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL("./github-src", import.meta.url)),
  base: "./",
  plugins: [react()],
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL("./docs", import.meta.url)),
    emptyOutDir: true,
  },
  resolve: { alias: { "@": projectRoot } },
});
