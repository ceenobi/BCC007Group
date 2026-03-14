import { initClient } from "@ts-rest/core";
import { authContract } from "~/contract/auth.contract";
import { uploadContract } from "~/contract/upload.contract";
import { paystackContract } from "~/contract/paystack.contract";
import { bankDetailContract } from "~/contract/bankDetail.contract";
import { memberContract } from "~/contract/member.contract";
import { eventContract } from "~/contract/event.contract";
import { ticketContract } from "~/contract/ticket.contract";
import { paymentContract } from "~/contract/payment.contract";
import { dashboardContract } from "~/contract/dashboard.contract";

const normalizeOrigin = (value: string) => value.replace(/\/?api\/?$/, "");

const getBaseUrl = () => {
  const origin = normalizeOrigin(
    import.meta.env.VITE_BASE_URL || "http://localhost:4600",
  );
  return typeof document === "undefined" ? `${origin}/api` : "/api";
};

const combinedContract = {
  ...authContract,
  ...uploadContract,
  ...paystackContract,
  ...bankDetailContract,
  ...memberContract,
  ...eventContract,
  ...ticketContract,
  ...paymentContract,
  ...dashboardContract,
};

export const apiClient = initClient(combinedContract, {
  baseUrl: getBaseUrl(),
  baseHeaders: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  validateResponse: true,
  jsonQuery: false,
  throwOnUnknownStatus: true,
});
