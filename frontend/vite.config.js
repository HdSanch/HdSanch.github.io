import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://apis-merchant.qa.deunalab.com",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("x-api-secret", "70aa3a0caa6341f88b67ebb167ef7a50");
            proxyReq.setHeader("x-api-key", "9fd4ac9c11b6455fa7270dba42a135ff");
          });
        },
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
