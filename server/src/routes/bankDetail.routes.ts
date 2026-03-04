import { initServer } from "@ts-rest/express";
import { bankDetailContract } from "~/contract/bankDetail.contract";
import { createTsRestSuccess, createTsRestError } from "~/lib/tsRestResponse";
import tryCatchFn from "~/lib/tryCatchFn";
import { validateFormData } from "~/middleware/formValidate";
import { customRateLimiter } from "~/middleware/rateLimit.middleware";
import { authorizedRoles, verifyUser } from "~/middleware/auth.middleware";
import { createBankAccountSchema } from "~/lib/dataSchema";
import BankDetails from "~/models/bank";
import {
  cacheMiddleware,
  invalidateCache,
} from "~/middleware/cache.middleware";

const s = initServer();

export const bankDetailRouter = s.router(bankDetailContract, {
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
        const isBankDetailExist = await BankDetails.findOne({
          bankAccountNumber,
          bankAccountName,
          bank,
          bankCode,
          userId: req.user?.id,
        }).lean();
        if (isBankDetailExist) {
          return createTsRestError(400, "Bank detail already exists");
        }
        const bankDetails = await BankDetails.create({
          bankAccountNumber,
          bankAccountName,
          bank,
          bankCode,
          userId: req.user?.id,
        });
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
        const bankDetails = await BankDetails.findOne({
          userId: req.user?.id,
        }).lean();
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
        const isBankDetailExist = await BankDetails.findOne({
          userId: req.user?.id,
        }).lean();
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
        const updatedBankDetails = await BankDetails.findOneAndUpdate(
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
        ).lean();
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
