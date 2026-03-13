import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  const url = import.meta.env.VITE_BASE_URL || "http://localhost:4600";
  if (url.startsWith("/")) {
    // Better Auth appends /api/auth to the baseURL. 
    // Since our Vercel rewrite maps /api/auth to the server, 
    // we use an empty string on the client for relative calls.
    return typeof document === "undefined"
      ? "https://bcc007pay-server.vercel.app"
      : ""; 
  }
  return url;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});
