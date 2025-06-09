import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
    host: true, // Allows access from network, important for containers
  },
  preview: {
    port: Number(process.env.PORT) || 8080,
    host: true, // Allows access from network, important for containers
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
