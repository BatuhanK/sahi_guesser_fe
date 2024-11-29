import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import ViteImagemin from 'vite-plugin-imagemin';


// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), 
    ViteImagemin({
    gifsicle: {
      optimizationLevel: 3, // 0 to 3
      interlaced: false,
    },
    optipng: {
      optimizationLevel: 3, // 0 to 7
    },
    mozjpeg: {
      quality: 75, // 0 to 100
    },
    pngquant: {
      quality: [0.6, 0.8], // min, max quality
      speed: 4,
    },
    svgo: {
      plugins: [
        {
          removeViewBox: false,
        },
      ],
    },
    webp: {
      quality: 75, // 0 to 100
    },
  })],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
