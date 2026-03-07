import { Resend } from "resend";
import { env } from "@/config/keys.js";

let resendInstance: Resend | null = null;

export const getResend = (): Resend => {
  if (!resendInstance) {
    if (!env.resendApiKey) {
      throw new Error("RESEND_API_KEY is not defined in environment variables");
    }
    resendInstance = new Resend(env.resendApiKey);
  }
  return resendInstance;
};
