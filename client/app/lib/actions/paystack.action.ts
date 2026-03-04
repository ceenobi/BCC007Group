import { apiClient } from "../apiClient";
import type {
  CancelSubscriptionData,
  InitializePaymentData,
  VerifyPaymentData,
} from "../dataSchema";

export async function listBanks({ cookie }: { cookie?: string }) {
  return await (apiClient.paystack.listBanks as any)({
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function resolveAccount({
  accountNumber,
  bankCode,
  cookie,
}: {
  accountNumber: string;
  bankCode: string;
  cookie?: string;
}) {
  return await (apiClient.paystack.resolveAccount as any)({
    query: {
      account_number: accountNumber,
      bank_code: bankCode,
    },
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function initializePayment({
  validated,
  cookie,
}: {
  validated: InitializePaymentData;
  cookie: string;
}) {
  return await (apiClient.paystack.initializePayment as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function verifyPayment({
  validated,
  cookie,
}: {
  validated: VerifyPaymentData;
  cookie: string;
}) {
  return await (apiClient.paystack.verifyPayment as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function cancelSubscription({
  validated,
  cookie,
}: {
  validated: CancelSubscriptionData;
  cookie: string;
}) {
  return await (apiClient.paystack.cancelSubscription as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function webhook({
  validated,
  cookie,
}: {
  validated: any;
  cookie: string;
}) {
  return await (apiClient.paystack.webhook as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

