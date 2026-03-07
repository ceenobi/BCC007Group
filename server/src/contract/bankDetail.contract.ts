import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  BankAccountSchema,
  createBankAccountSchema,
  ErrorSchema,
} from "@/lib/dataSchema.js";

const c = initContract();

const BankResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: BankAccountSchema,
});

export const bankDetailContract = c.router({
  bank: {
    createBankAccount: {
      method: "POST",
      path: "/api/v1/bank-account/create",
      summary: "Create bank detail",
      body: createBankAccountSchema,
      responses: {
        201: BankResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
    },
    getBankAccount: {
      method: "GET",
      path: "/api/v1/bank-account/get",
      summary: "Get bank detail",
      responses: {
        200: BankResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
    },
    updateBankAccount: {
      method: "PATCH",
      path: "/api/v1/bank-account/update",
      summary: "Update bank detail",
      body: createBankAccountSchema,
      responses: {
        200: BankResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
    },
  },
});

export type BankDetailContract = typeof bankDetailContract;
