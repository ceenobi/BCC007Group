import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  ErrorSchema,
  cancelSubscriptionSchema,
  initializePaymentSchema,
  paymentSchema,
  verifyPaymentSchema,
} from "~/lib/dataSchema";

const c = initContract();

export const paystackContract = c.router({
  paystack: {
    listBanks: {
      method: "GET",
      path: "/paystack/banks",
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.array(
            z.object({
              id: z.coerce.string(),
              name: z.string(),
              code: z.coerce.string(),
            }),
          ),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "List banks",
    },
    resolveAccount: {
      method: "GET",
      path: "/paystack/resolve-account",
      query: z.object({
        account_number: z.coerce.string(),
        bank_code: z.coerce.string(),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            account_number: z.coerce.string(),
            account_name: z.string(),
            bank_id: z.coerce.string(),
          }),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Resolve account number",
    },
    initializePayment: {
      method: "POST",
      path: "/paystack/initialize-payment",
      body: initializePaymentSchema,
      responses: {
        200: z.object({
          status: z.boolean(),
          message: z.string(),
          data: z.object({
            authorization_url: z.string(),
            reference: z.string(),
            access_code: z.string(),
          }),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Initialize a payment (One-time or Subscription)",
    },
    verifyPayment: {
      method: "POST",
      path: "/paystack/verify-payment",
      body: verifyPaymentSchema,
      responses: {
        200: z.object({
          status: z.boolean(),
          message: z.string(),
          data: paymentSchema,
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Verify a payment",
    },
    cancelSubscription: {
      method: "POST",
      path: "/paystack/subscription-cancel",
      body: cancelSubscriptionSchema,
      responses: {
        200: z.object({
          status: z.boolean(),
          message: z.string(),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Cancel a recurring subscription",
    },
    webhook: {
      method: "POST",
      path: "/paystack/webhook",
      body: z.any(),
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
      },
      summary: "Paystack webhook handler",
    },
  },
});

export type PaystackContract = typeof paystackContract;
