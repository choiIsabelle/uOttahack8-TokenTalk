import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Set `base` so built assets use the correct root when hosted under
  // https://<username>.github.io/<repo>/  (GitHub Pages).
  base: "/uOttahack8/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
