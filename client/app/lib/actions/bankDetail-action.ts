import { apiClient } from "../apiClient";
import type { CreateBankAccountData } from "../dataSchema";

export const addBankAccount = async ({
  validated,
  cookie,
}: {
  validated: CreateBankAccountData;
  cookie?: string;
}) => {
  return await (apiClient.bank.createBankAccount as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const getBankAccount = async ({ cookie }: { cookie?: string }) => {
  return await (apiClient.bank.getBankAccount as any)({
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const updateBankAccount = async ({
  validated,
  cookie,
}: {
  validated: CreateBankAccountData;
  cookie?: string;
}) => {
  return await (apiClient.bank.updateBankAccount as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};
