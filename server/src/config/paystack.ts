import axios from "axios";
import { env } from "./keys";

export const PAYSTACK_SECRET_KEY = env.paystackSecretKey;
export const PAYSTACK_BASE_URL = "https://api.paystack.co";

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not defined. Please add it to your .env file");
}

// Log a masked version of the key for debugging (only first 8 chars)
console.log("Paystack key configured:", PAYSTACK_SECRET_KEY.substring(0, 8) + "...");

export const paystack = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});