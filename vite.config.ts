import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '18' }]]
      }
    }),
    viteStaticCopy({
      targets: [
        { src: "src/public", dest: "assets" },
        {
          src: "src/public/root/*",
          dest: path.resolve(__dirname, "./dist"),
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          "framer-motion": ["framer-motion"],
          livekit: ["livekit-client"],
          "emoji-mart": ["@emoji-mart/data", "@emoji-mart/react"],
        },
      },
    },
  },
});
