import { initContract } from "@ts-rest/core";
import z from "zod";
import { ErrorSchema, paymentSchema } from "~/lib/dataSchema";

const c = initContract();

// const PaymentResponseSchema = z.object({
//   success: z.boolean(),
//   message: z.string(),
//   data: paymentSchema,
// });

const PaymentsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    payments: z.array(paymentSchema),
    pagination: z.object({
      currentPage: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasMore: z.boolean(),
    }),
  }),
});

export const ReportTrendSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  count: z.number(),
});

export const ReportTypeBreakdownSchema = z.object({
  _id: z.string(),
  revenue: z.number(),
  count: z.number(),
});

export const ReportMonthlyBreakdownSchema = z.object({
  _id: z.number(),
  month: z.string(),
  total: z.number(),
  count: z.number(),
});

export const PaymentReportsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    stats: z.object({
      totalRevenue: z.number(),
      totalCount: z.number(),
      completedRevenue: z.number(),
      completedCount: z.number(),
      pendingRevenue: z.number(),
      pendingCount: z.number(),
    }),
    typeBreakdown: z.array(ReportTypeBreakdownSchema),
    trends: z.array(ReportTrendSchema),
    monthlyBreakdown: z.array(ReportMonthlyBreakdownSchema).optional(),
    monthlySummary: z
      .object({
        year: z.number(),
        total: z.number(),
      })
      .optional(),
    paymentStats: z
      .object({
        yearlyDues: z.number(),
        totalPaidThisYear: z.number(),
        monthsPaid: z.number(),
        paymentPercentage: z.number(),
        isUpToDate: z.boolean(),
        cycleStart: z.union([z.string(), z.date(), z.null()]),
        cycleEnd: z.union([z.string(), z.date(), z.null()]),
        lastMonthlyDuesPaid: z.any().nullable(),
      })
      .optional(),
  }),
});

export const paymentContract = c.router({
  payments: {
    listUserPayments: {
      method: "GET",
      path: "/v1/payments/user",
      query: z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        query: z.string().optional(),
        paymentStatus: z
          .enum(["pending", "completed", "failed", "cancelled"])
          .optional(),
        paymentType: z
          .enum(["donation", "event", "membership_dues"])
          .optional(),
      }),
      responses: {
        200: PaymentsResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "List current user payments",
    },
    groupPayments: {
      method: "GET",
      path: "/v1/payments/group",
      query: z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        query: z.string().optional(),
        paymentStatus: z
          .enum(["pending", "completed", "failed", "cancelled"])
          .optional(),
        paymentType: z
          .enum(["donation", "event", "membership_dues"])
          .optional(),
      }),
      responses: {
        200: PaymentsResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "List group payments",
    },
    paymentReports: {
      method: "GET",
      path: "/v1/payments/reports",
      query: z.object({
        period: z.enum(["1w", "1m", "6m", "1y", "all"]).optional(),
        paymentStatus: z
          .enum(["pending", "completed", "failed", "cancelled"])
          .optional(),
        paymentType: z
          .enum(["donation", "event", "membership_dues"])
          .optional(),
      }),
      responses: {
        200: PaymentReportsResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Get aggregated analytics for payments",
    },
    paymentReportsUser: {
      method: "GET",
      path: "/v1/payments/reports/user",
      query: z.object({
        period: z.enum(["1w", "1m", "6m", "1y", "all"]).optional(),
        paymentStatus: z
          .enum(["pending", "completed", "failed", "cancelled"])
          .optional(),
        paymentType: z
          .enum(["donation", "event", "membership_dues"])
          .optional(),
      }),
      responses: {
        200: PaymentReportsResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Get aggregated analytics for the current user's payments",
    },
  },
});

export type PaymentContract = typeof paymentContract;
