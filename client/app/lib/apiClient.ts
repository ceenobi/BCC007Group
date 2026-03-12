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

const getBaseUrl = () => {
  const url = import.meta.env.VITE_BASE_URL || "http://localhost:4500";
  if (url.startsWith("/")) {
    return typeof document === "undefined"
      ? `https://bcc007pay-server.vercel.app${url}`
      : "";
  }
  return url;
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
  baseUrl:
    typeof document === "undefined" &&
    import.meta.env.VITE_BASE_URL?.startsWith("/")
      ? `https://bcc007pay-server.vercel.app${import.meta.env.VITE_BASE_URL}`
      : import.meta.env.VITE_BASE_URL || "http://localhost:4500",
  baseHeaders: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  validateResponse: true,
  jsonQuery: false,
  throwOnUnknownStatus: true,
});
