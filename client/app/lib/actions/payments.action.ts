import { apiClient } from "../apiClient";

export async function listUserPayments({
  cookie,
  page,
  limit,
  query,
  paymentStatus,
  paymentType,
}: {
  cookie?: string;
  page?: number;
  limit?: number;
  query?: string;
  paymentStatus?: "pending" | "completed" | "failed" | "cancelled";
  paymentType?: "donation" | "event" | "membership_dues";
}) {
  const queryParams: any = {
    page,
    limit,
  };
  if (query) queryParams.query = query;
  if (paymentStatus) queryParams.paymentStatus = paymentStatus;
  if (paymentType) queryParams.paymentType = paymentType;
  return await (apiClient.payments.listUserPayments as any)({
    query: queryParams,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}
export async function groupPayments({
  cookie,
  page,
  limit,
  query,
  paymentStatus,
  paymentType,
}: {
  cookie?: string;
  page?: number;
  limit?: number;
  query?: string;
  paymentStatus?: "pending" | "completed" | "failed" | "cancelled";
  paymentType?: "donation" | "event" | "membership_dues";
}) {
  const queryParams: any = {
    page,
    limit,
  };
  if (query) queryParams.query = query;
  if (paymentStatus) queryParams.paymentStatus = paymentStatus;
  if (paymentType) queryParams.paymentType = paymentType;
  return await (apiClient.payments.groupPayments as any)({
    query: queryParams,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function paymentReports({
  cookie,
  period,
  paymentStatus,
  paymentType,
}: {
  cookie?: string;
  period?: "1w" | "1m" | "6m" | "1y" | "all";
  paymentStatus?: "pending" | "completed" | "failed" | "cancelled";
  paymentType?: "donation" | "event" | "membership_dues";
}) {
  const queryParams: any = {};
  if (period) queryParams.period = period;
  if (paymentStatus) queryParams.paymentStatus = paymentStatus;
  if (paymentType) queryParams.paymentType = paymentType;
  return await (apiClient.payments.paymentReports as any)({
    query: queryParams,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function paymentReportsUser({
  cookie,
  period,
  paymentStatus,
  paymentType,
}: {
  cookie?: string;
  period?: "1w" | "1m" | "6m" | "1y" | "all";
  paymentStatus?: "pending" | "completed" | "failed" | "cancelled";
  paymentType?: "donation" | "event" | "membership_dues";
}) {
  const queryParams: any = {};
  if (period) queryParams.period = period;
  if (paymentStatus) queryParams.paymentStatus = paymentStatus;
  if (paymentType) queryParams.paymentType = paymentType;
  return await (apiClient.payments.paymentReportsUser as any)({
    query: queryParams,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}
