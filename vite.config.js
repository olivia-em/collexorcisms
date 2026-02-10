import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // No server/proxy needed for static build
  // Set base for GitHub Pages deployment (update 'collexorcisms' if repo name differs)
  base: "/collexorcisms/",
  // base: "",
});
