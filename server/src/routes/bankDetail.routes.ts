import { initServer } from "@ts-rest/express";
import { bankDetailContract } from "../contract/bankDetail.contract.js";
import { createTsRestSuccess, createTsRestError } from "../lib/tsRestResponse.js";
import tryCatchFn from "../lib/tryCatchFn.js";
import { validateFormData } from "../middleware/formValidate.js";
import { customRateLimiter } from "../middleware/rateLimit.middleware.js";
import { authorizedRoles, verifyUser } from "../middleware/auth.middleware.js";
import { createBankAccountSchema } from "../lib/dataSchema.js";
import BankDetails from "../models/bank.js";
import {
  cacheMiddleware,
  invalidateCache,
} from "../middleware/cache.middleware.js";

import { connectMongoDb } from "../config/db.server.js";

export const getBankDetailRouter = () => {
  const s = initServer();

  return s.router(bankDetailContract, {
  bank: {
    createBankAccount: {
      middleware: [
        customRateLimiter(10),
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
        validateFormData(createBankAccountSchema),
      ],
      handler: tryCatchFn(async ({ req }) => {
        const { bankAccountNumber, bankAccountName, bank, bankCode } = req.body;
        //check if bank detail exists already
        const isBankDetailExist = await connectMongoDb(() => BankDetails.findOne({
          bankAccountNumber,
          bankAccountName,
          bank,
          bankCode,
          userId: req.user?.id,
        }).lean());
        if (isBankDetailExist) {
          return createTsRestError(400, "Bank detail already exists");
        }
        const bankDetails = await connectMongoDb(() => BankDetails.create({
          bankAccountNumber,
          bankAccountName,
          bank,
          bankCode,
          userId: req.user?.id,
        }));
        await invalidateCache(`cache:bank-detail:${req.user?.id}`);
        return createTsRestSuccess(201, {
          success: true,
          message: "Bank detail added successfully",
          data: bankDetails,
        });
      }),
    },
    getBankAccount: {
      middleware: [
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
        cacheMiddleware({
          ttl: 3600,
          keyGenerator: (req) => `cache:bank-detail:${req.user?.id}`,
        }),
      ],
      handler: tryCatchFn(async ({ req }) => {
        const bankDetails = await connectMongoDb(() => BankDetails.findOne({
          userId: req.user?.id,
        }).lean());
        if (!bankDetails) {
          return createTsRestError(404, "Bank detail not found");
        }
        return createTsRestSuccess(200, {
          success: true,
          message: "Bank detail fetched successfully",
          data: bankDetails,
        });
      }),
    },
    updateBankAccount: {
      middleware: [
        customRateLimiter(10),
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
        validateFormData(createBankAccountSchema),
      ],
      handler: tryCatchFn(async ({ req }) => {
        const { bankAccountNumber, bankAccountName, bank, bankCode } = req.body;
        //check if bank detail exists already
        const isBankDetailExist = await connectMongoDb(() => BankDetails.findOne({
          userId: req.user?.id,
        }).lean());
        if (!isBankDetailExist) {
          return createTsRestError(404, "Bank detail not found");
        }
        if (!isBankDetailExist.userId.equals(req.user?.id)) {
          return createTsRestError(
            403,
            "You are not authorized to update this bank detail",
          );
        }
        if (
          isBankDetailExist.bankAccountNumber === bankAccountNumber &&
          isBankDetailExist.bankAccountName === bankAccountName &&
          isBankDetailExist.bank === bank &&
          isBankDetailExist.bankCode === bankCode
        ) {
          return createTsRestError(400, "Bank detail already exists");
        }
        const updatedBankDetails = await connectMongoDb(() => BankDetails.findOneAndUpdate(
          {
            userId: req.user?.id,
          },
          {
            bankAccountNumber,
            bankAccountName,
            bank,
            bankCode,
          },
          { returnDocument: "after" },
        ).lean());
        await invalidateCache(`cache:bank-detail:${req.user?.id}`);
        return createTsRestSuccess(200, {
          success: true,
          message: "Bank detail updated successfully",
          data: updatedBankDetails,
        });
      }),
    },
  },
});
};
