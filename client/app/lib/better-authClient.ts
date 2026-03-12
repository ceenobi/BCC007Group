import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  const url = import.meta.env.VITE_BASE_URL || "http://localhost:4600";
  if (url.startsWith("/")) {
    return typeof document === "undefined"
      ? `https://bcc007pay-server.vercel.app${url}`
      : "";
  }
  return url;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});
