import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: "0.0.0.0",
    port: 4500,
    open: true,
    proxy: {
      "/api/v1": {
        target: "http://localhost:4600",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      "localhost",
      "salmon-daring-partially.ngrok-free.app",
      "127.0.0.1",
      "0.0.0.0",
      "::1",
    ],
  },
  build: {
    target: "esnext",
    ssr: true,
    outDir: "build",
    assetsDir: "assets",
    sourcemap: true,
  },
  esbuild: {
    target: "esnext",
  },
});
