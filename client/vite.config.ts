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
      "/api": {
        target: "http://localhost:4600",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      "localhost",
      "salmon-daring-partially.ngrok-free.app",
      "bcc007pay-server.vercel.app",
      "bcc007pay-staging.vercel.app",
      "127.0.0.1",
      "0.0.0.0",
      "::1",
    ],
  },
  build: {
    ssr: true,
    sourcemap: true,
    target: "esnext",
    minify: "esbuild",
    reportCompressedSize: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {},
    },
    outDir: "build",
    assetsDir: "assets",
  },
  esbuild: {
    target: "esnext",
  },
});
