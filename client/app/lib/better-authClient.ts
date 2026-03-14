import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
  const url = import.meta.env.VITE_BASE_URL || "http://localhost:4600";
  return typeof document === "undefined" ? url : "";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});
