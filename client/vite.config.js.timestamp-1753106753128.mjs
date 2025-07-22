// vite.config.js
import { defineConfig } from "file:///C:/Users/konst/Projects/Web/taskflow/client/node_modules/vite/dist/node/index.js";
import svgrPlugin from "file:///C:/Users/konst/Projects/Web/taskflow/client/node_modules/vite-plugin-svgr/dist/index.mjs";
import react from "file:///C:/Users/konst/Projects/Web/taskflow/client/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import { visualizer } from "file:///C:/Users/konst/Projects/Web/taskflow/client/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { VitePWA } from "file:///C:/Users/konst/Projects/Web/taskflow/client/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\konst\\Projects\\Web\\taskflow\\client";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  plugins: [
    svgrPlugin({
      svgrOptions: {
        icon: true
      }
    }),
    react(),
    visualizer(),
    VitePWA({
      filename: "sw.js",
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module"
      },
      srcDir: "src/service-worker",
      swDest: "dist/service-worker.js",
      strategies: "injectManifest",
      injectManifest: {
        injectionPoint: void 0
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxrb25zdFxcXFxQcm9qZWN0c1xcXFxXZWJcXFxcdGFza2Zsb3dcXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxrb25zdFxcXFxQcm9qZWN0c1xcXFxXZWJcXFxcdGFza2Zsb3dcXFxcY2xpZW50XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9rb25zdC9Qcm9qZWN0cy9XZWIvdGFza2Zsb3cvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHN2Z3JQbHVnaW4gZnJvbSBcInZpdGUtcGx1Z2luLXN2Z3JcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSBcInZpdGUtcGx1Z2luLXB3YVwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICBzdmdyUGx1Z2luKHtcclxuICAgICAgc3Znck9wdGlvbnM6IHtcclxuICAgICAgICBpY29uOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgICByZWFjdCgpLFxyXG4gICAgdmlzdWFsaXplcigpLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIGZpbGVuYW1lOiBcInN3LmpzXCIsXHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXHJcbiAgICAgIGRldk9wdGlvbnM6IHtcclxuICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgIHR5cGU6IFwibW9kdWxlXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIHNyY0RpcjogXCJzcmMvc2VydmljZS13b3JrZXJcIixcclxuICAgICAgc3dEZXN0OiBcImRpc3Qvc2VydmljZS13b3JrZXIuanNcIixcclxuICAgICAgc3RyYXRlZ2llczogXCJpbmplY3RNYW5pZmVzdFwiLFxyXG4gICAgICBpbmplY3RNYW5pZmVzdDoge1xyXG4gICAgICAgIGluamVjdGlvblBvaW50OiB1bmRlZmluZWQsXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICBdLFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpVSxTQUFTLG9CQUFvQjtBQUM5VixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsZUFBZTtBQUx4QixJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxXQUFXO0FBQUEsTUFDVCxhQUFhO0FBQUEsUUFDWCxNQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLE1BQ04sVUFBVTtBQUFBLE1BQ1YsY0FBYztBQUFBLE1BQ2QsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBLFFBQ1QsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLFlBQVk7QUFBQSxNQUNaLGdCQUFnQjtBQUFBLFFBQ2QsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
