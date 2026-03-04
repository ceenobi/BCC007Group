import { Resend } from "resend";
import { env } from "./keys";

if (!env.resendApiKey) {
  throw new Error("RESEND_API_KEY is not defined in environment variables");
}

export const resend = new Resend(env.resendApiKey);
