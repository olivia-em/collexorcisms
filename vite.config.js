import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // No server/proxy needed for static build
  // Use root base for custom domain deployment
  base: "/",
});
