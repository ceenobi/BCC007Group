import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
  Link,
} from "react-router";
import { Toaster } from "sonner";
import {
  QueryClientProvider,
  HydrationBoundary,
  type DehydratedState,
} from "@tanstack/react-query";
import { getQueryClient } from "./lib/queryClient";
import { ProgressBar } from "./components/progressBar";
import { ThemeProvider } from "./context/themeProvider";
import { Button } from "./components/ui/button";

import type { Route } from "./+types/root";
import "./app.css";
import "easymde/dist/easymde.min.css";
import "react-phone-number-input/style.css";
import { TooltipProvider } from "./components/ui/tooltip";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fontsource.org" },
  { rel: "preconnect", href: "https://res.cloudinary.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "dns-prefetch",
    href: "https://res.cloudinary.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "icon",
    href: "/bcc007.png",
    sizes: "any",
  },
  {
    rel: "icon",
    href: "/bcc007.png",
    type: "image/x-icon",
    sizes: "192x192",
  },
  {
    rel: "icon",
    href: "/bcc007.png",
    type: "image/x-icon",
    sizes: "512x512",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <Meta />
        <Links />
      </head>
      <body>
        <ProgressBar />
        <Toaster position="bottom-center" richColors />
        <ThemeProvider defaultTheme="system" storageKey="bcc007pay-theme">
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const queryClient = getQueryClient();
  const matches = useMatches();
  const dehydratedState = matches.reduce(
    (acc, match) => {
      const state = (match.data as any)?.dehydratedState as DehydratedState;
      if (state) {
        return {
          ...acc,
          queries: [...(acc?.queries || []), ...(state.queries || [])],
          mutations: [...(acc?.mutations || []), ...(state.mutations || [])],
        };
      }
      return acc;
    },
    { queries: [], mutations: [] } as DehydratedState,
  );

  if (import.meta.env.DEV && dehydratedState.queries.length > 0) {
    console.log(
      "Global Hydration State merged for queries:",
      dehydratedState.queries.map((q) => q.queryKey),
    );
  }
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <Outlet />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  if (isRouteErrorResponse(error)) {
    message =
      error.status === 404
        ? "404"
        : error.status === 401
          ? "401"
          : error.status === 403
            ? "403"
            : error.status === 500
              ? "500"
              : "Operation Failed";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.status === 401
          ? "You are not authorized to access this page."
          : error.status === 403
            ? "You are not authorized to access this page."
            : error.status === 500
              ? error.data.message
              : error.data.message || error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="p-4 container mx-auto min-h-screen flex flex-col justify-center items-center">
      <div className="flex flex-col items-center h-[400px] w-full max-w-[800px] mx-auto">
        <div className="space-y-4 flex flex-col items-center justify-center h-full px-4">
          {message === "404" ? (
            <img
              src="/notFound.svg"
              alt="404 error with a tired person by storyset"
              className="max-w-[400px] mx-auto h-[250px]"
            />
          ) : message === "500" ? (
            <img
              src="/500error.svg"
              alt="500 server error by storyset"
              className="max-w-[400px] mx-auto h-[250px]"
            />
          ) : (
            <img
              src="/offline.svg"
              alt="offline server by storyset"
              className="max-w-[400px] mx-auto h-[250px]"
            />
          )}
          <div className="text-center">
            <h1 className="text-xl font-bold text-red-500">
              Something went wrong
            </h1>
            <p className="text-sm">
              {details === "fetch failed"
                ? "Server is currently unavailable to process your request. Please try again later."
                : details}
            </p>
            {details !== "fetch failed" && (
              <div className="mt-4 inline-flex gap-4">
                <Button variant="outline" size="lg" asChild className="rounded-sm shadow-lg w-[200px] bg-lightBlue hover:bg-coolBlue text-white h-12 font-bold transition-all duration-300">
                  <Link to="/">Go Home</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
