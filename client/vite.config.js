import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config. The dev server runs on port 5173 and proxies /api and /uploads
// to the Node server on port 5000, so the client code can use relative URLs.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
      "/socket.io": { target: "http://localhost:5000", ws: true },
    },
  },
});
