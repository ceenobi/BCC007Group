import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { ErrorSchema } from "~/lib/dataSchema";

const c = initContract();

export const dashboardContract = c.router({
  dashboard: {
    getActivityTrends: {
      method: "GET",
      path: "/api/v1/dashboard/activities",
      query: z.object({
        days: z.coerce.number().optional(),
      }),
      summary: "Get activity trends",
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.array(
            z.object({
              date: z.string(),
              totalAmount: z.number(),
              transactionCount: z.number(),
              paymentCount: z.number().optional(),
              eventCount: z.number().optional(),
              activityType: z.enum(["payment", "event", "both"]),
            }),
          ),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
    },
    getAnnouncements: {
      method: "GET",
      path: "/api/v1/dashboard/upcoming-events",
      summary: "Get upcoming events",
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            events: z.array(
              z.object({
                _id: z.string(),
                title: z.string(),
                description: z.string().optional(),
                date: z.string(),
                eventType: z.string(),
                daysUntilEvent: z.number(),
              }),
            ),
            eventsCount: z.number(),
            users: z.array(
              z.object({
                _id: z.string(),
                name: z.string(),
                dateOfBirth: z.string(),
                image: z.string(),
                daysUntilBirthday: z.number(),
              }),
            ),
            usersCount: z.number(),
          }),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
    },
    getStats: {
      method: "GET",
      path: "/api/v1/dashboard/stats",
      summary: "Get dashboard stats",
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            totalRevenue: z.number(),
            revenueChange: z.number(),
            activeSubscriptions: z.number(),
            subscriptionsChange: z.number(),
            openTickets: z.number(),
            ticketsChange: z.number(),
            pendingDues: z.number(),
            duesChange: z.number(),
          }),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
    },
    getRecentActivities: {
      method: "GET",
      path: "/api/v1/dashboard/recent-activities",
      query: z.object({
        limit: z.coerce.number().optional(),
      }),
      summary: "Get recent activities",
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.array(
            z.object({
              id: z.string(),
              type: z.enum(["payment", "event", "member", "ticket"]),
              title: z.string(),
              description: z.string(),
              timestamp: z.string(),
              status: z.string().optional(),
              amount: z.number().optional(),
              user: z
                .object({
                  name: z.string(),
                  image: z.string().optional(),
                })
                .optional(),
            }),
          ),
        }),
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

export type DashboardContract = typeof dashboardContract;
