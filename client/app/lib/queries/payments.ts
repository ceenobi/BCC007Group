import {
  listUserPayments,
  groupPayments,
  paymentReports,
  paymentReportsUser,
} from "../actions/payments.action";

export const listUserPaymentsQuery = ({
  cookie,
  page,
  limit,
  query,
  paymentStatus,
  paymentType,
}: {
  cookie?: string;
  page: number;
  limit: number;
  query?: string;
  paymentStatus?: "pending" | "completed" | "failed" | "cancelled";
  paymentType?: "donation" | "event" | "membership_dues";
}) => ({
  queryKey: ["payments", page, limit, query, paymentStatus, paymentType],
  queryFn: () =>
    listUserPayments({
      cookie,
      page,
      limit,
      query,
      paymentStatus,
      paymentType,
    }),
});

export const groupPaymentsQuery = ({
  cookie,
  page,
  limit,
  query,
  paymentStatus,
  paymentType,
}: {
  cookie?: string;
  page: number;
  limit: number;
  query?: string;
  paymentStatus?: "pending" | "completed" | "failed" | "cancelled";
  paymentType?: "donation" | "event" | "membership_dues";
}) => ({
  queryKey: ["group-payments", page, limit, query, paymentStatus, paymentType],
  queryFn: () =>
    groupPayments({
      cookie,
      page,
      limit,
      query,
      paymentStatus,
      paymentType,
    }),
});

export const paymentReportsQuery = ({
  cookie,
  period,
  paymentStatus,
  paymentType,
}: {
  cookie?: string;
  period?: "1w" | "1m" | "6m" | "1y" | "all";
  paymentStatus?: "pending" | "completed" | "failed" | "cancelled";
  paymentType?: "donation" | "event" | "membership_dues";
}) => ({
  queryKey: ["payment-reports", period, paymentStatus, paymentType],
  queryFn: () =>
    paymentReports({
      cookie,
      period,
      paymentStatus,
      paymentType,
    }),
});

export const paymentReportsUserQuery = ({
  cookie,
  period,
  paymentStatus,
  paymentType,
}: {
  cookie?: string;
  period?: "1w" | "1m" | "6m" | "1y" | "all";
  paymentStatus?: "pending" | "completed" | "failed" | "cancelled";
  paymentType?: "donation" | "event" | "membership_dues";
}) => ({
  queryKey: ["payment-reports-user", period, paymentStatus, paymentType],
  queryFn: () =>
    paymentReportsUser({
      cookie,
      period,
      paymentStatus,
      paymentType,
    }),
});
