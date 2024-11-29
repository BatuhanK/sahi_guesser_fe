import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{ src: "src/public", dest: "assets" }],
    }),
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
