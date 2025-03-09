import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("x-api-secret", process.env.VITE_API_SECRET);
            proxyReq.setHeader("x-api-key", process.env.VITE_API_KEY);
          });
        },
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
