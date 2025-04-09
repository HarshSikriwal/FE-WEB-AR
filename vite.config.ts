import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  server: {
    host: true, // This allows access from local network
    port: 5173, // Default Vite port
  },
});
