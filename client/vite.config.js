import { defineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
    react(),
    visualizer(),
    VitePWA({
      filename: "sw.js",
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
      },
      srcDir: "src/service-worker",
      swDest: "dist/service-worker.js",
      strategies: "injectManifest",
    }),
  ],
});
