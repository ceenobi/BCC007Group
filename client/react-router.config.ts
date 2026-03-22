import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";
import { sentryOnBuildEnd } from "@sentry/react-router";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  prerender: ["/"],
  presets: [vercelPreset()],
  future: {
    v8_middleware: true,
  },
  buildEnd: sentryOnBuildEnd,
} satisfies Config;
