import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  base: "/focused-life-hq/",        // 👈 important - must match your GitHub Pages repo path
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    // Ensure 404.html is copied to dist
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});
