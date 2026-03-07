import axios from "axios";
import { env } from "@/config/keys.js";

export const PAYSTACK_SECRET_KEY = env.paystackSecretKey;
export const PAYSTACK_BASE_URL = "https://api.paystack.co";

let paystackInstance: any = null;

export const getPaystack = () => {
  if (!paystackInstance) {
    const secret = env.paystackSecretKey;
    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY is not defined. Please add it to your .env file");
    }
    // Log a masked version of the key for debugging (only first 8 chars)
    console.log("Paystack key configured:", secret.substring(0, 8) + "...");
    paystackInstance = axios.create({
      baseURL: PAYSTACK_BASE_URL,
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
    });
  }
  return paystackInstance;
};