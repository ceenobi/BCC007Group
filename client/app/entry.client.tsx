import * as Sentry from "@sentry/react-router";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Capture 100% in dev, 20% in production
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,
  // Session replay: 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Propagate traces to the API server
  tracePropagationTargets: [
    /^\//,
    /^https:\/\/bcc007pay-server\.vercel\.app/,
  ],
  enabled: !!import.meta.env.VITE_SENTRY_DSN,
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
