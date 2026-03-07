import { cacheMiddleware } from "@/middleware/cache.middleware.js";
import { authorizedRoles, verifyUser } from "@/middleware/auth.middleware.js";
import { initServer } from "@ts-rest/express";
import { createTsRestSuccess, createTsRestError } from "@/lib/tsRestResponse.js";
import User from "@/models/user.js";
import Event from "@/models/event.js";
import Payment from "@/models/payment.js";
import Ticket from "@/models/ticket.js";
import { dashboardContract } from "@/contract/dashboard.contract.js";
import tryCatchFn from "@/lib/tryCatchFn.js";
import DashboardStats from "@/models/dashboardStats.js";

import { connectMongoDb } from "@/config/db.server.js";

// type ActivityTrendsQuery = z.infer<
//   typeof dashboardContract.dashboard.getActivityTrends.query
// >;

interface ActivityTrend {
  date: string;
  totalAmount: number;
  transactionCount: number;
  paymentCount: number;
  eventCount: number;
  activityType: "payment" | "event" | "both";
}

export const getDashboardRouter = () => {
  const s = initServer();

  return s.router(dashboardContract, {
  dashboard: {
    getAnnouncements: {
      middleware: [
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
        cacheMiddleware({
          ttl: 3600,
        }),
      ],
      handler: tryCatchFn(async () => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();
        const [users, events] = await connectMongoDb(() => Promise.all([
          User.aggregate([
            {
              $match: {
                dateOfBirth: { $exists: true, $ne: null },
                $expr: {
                  $eq: [{ $month: "$dateOfBirth" }, currentMonth],
                },
              },
            },
            {
              $project: {
                name: 1,
                dateOfBirth: 1,
                image: 1,
                daysUntilBirthday: {
                  $let: {
                    vars: {
                      birthDate: {
                        $dateFromParts: {
                          year: now.getFullYear(),
                          month: { $month: "$dateOfBirth" },
                          day: { $dayOfMonth: "$dateOfBirth" },
                        },
                      },
                    },
                    in: {
                      $subtract: [{ $dayOfMonth: "$$birthDate" }, currentDay],
                    },
                  },
                },
              },
            },
            {
              $match: {
                daysUntilBirthday: { $gte: 0 }, // Only include upcoming birthdays
              },
            },
            {
              $sort: { daysUntilBirthday: 1 }, // Sort by closest birthday
            },
            {
              $limit: 5, // Limit to 10 upcoming birthdays
            },
          ]),
          Event.aggregate([
            {
              $match: {
                date: {
                  $exists: true,
                  $ne: null,
                  $gte: new Date(now.getFullYear(), now.getMonth(), 1), // Start of current month
                  $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1), // Start of next month
                },
                status: "upcoming",
              },
            },
            {
              $project: {
                title: 1,
                description: 1,
                date: 1,
                time: 1,
                eventType: 1,
                organizer: 1,
                daysUntilEvent: {
                  $subtract: [{ $dayOfMonth: "$date" }, currentDay],
                },
              },
            },
            {
              $match: {
                daysUntilEvent: { $gte: 0 }, // Only include upcoming events
              },
            },
            {
              $sort: {
                daysUntilEvent: 1, // Sort by closest event
                time: 1, // For events on same day, sort by time
              },
            },
            {
              $limit: 5, // Limit to 5 upcoming events
            },
            {
              $lookup: {
                from: "users",
                localField: "organizer",
                foreignField: "_id",
                as: "organizerInfo",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      image: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$organizerInfo",
            },
          ]),
        ]));
        const upcomingEvents = {
          users,
          usersCount: users.length,
          events,
          eventsCount: events.length,
        };
        return createTsRestSuccess(200, {
          success: true,
          message: "Upcoming events retrieved successfully",
          data: upcomingEvents,
        });
      }),
    },
    getActivityTrends: {
      middleware: [
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
        cacheMiddleware({
          ttl: 3600,
        }),
      ],
      handler: tryCatchFn(async ({ query }) => {
        const days = query.days || 7;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        // Enhanced aggregation for both payments and events
        const [paymentTrends, eventTrends] = (await connectMongoDb(() => Promise.all([
          // Payment aggregation
          Payment.aggregate([
            {
              $match: {
                lastPaymentDate: { $gte: daysAgo, $lte: new Date() },
                paymentStatus: "completed",
              },
            },
            {
              $project: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$lastPaymentDate",
                  },
                },
                amount: 1,
              },
            },
            {
              $group: {
                _id: "$date",
                totalAmount: { $sum: "$amount" },
                transactionCount: { $sum: 1 },
                paymentCount: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                date: "$_id",
                totalAmount: 1,
                transactionCount: 1,
                paymentCount: 1,
                activityType: { $literal: "payment" },
              },
            },
          ]),

          // Event aggregation
          Event.aggregate([
            {
              $match: {
                date: { $gte: daysAgo, $lte: new Date() },
                status: { $in: ["upcoming", "ongoing", "completed"] },
              },
            },
            {
              $project: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              },
            },
            {
              $group: {
                _id: "$date",
                transactionCount: { $sum: 1 },
                eventCount: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                date: "$_id",
                totalAmount: { $literal: 0 },
                transactionCount: 1,
                eventCount: 1,
                activityType: { $literal: "event" },
              },
            },
          ]),
        ]))) as any[][];

        // Create comprehensive date map with all days
        const dateMap = new Map<string, ActivityTrend>();
        const currentDate = new Date(daysAgo);

        // Initialize with all days having zero values
        for (let i = 0; i <= days; i++) {
          const dateStr = currentDate.toISOString().split("T")[0];
          dateMap.set(dateStr, {
            date: dateStr,
            totalAmount: 0,
            transactionCount: 0,
            paymentCount: 0,
            eventCount: 0,
            activityType: "event", // Initial value, will be updated
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Update with payment data
        paymentTrends.forEach((trend) => {
          const existing = dateMap.get(trend.date);
          if (existing) {
            existing.totalAmount += trend.totalAmount;
            existing.transactionCount += trend.transactionCount;
            existing.paymentCount += trend.paymentCount;
          }
        });

        // Update with event data
        eventTrends.forEach((trend) => {
          const existing = dateMap.get(trend.date);
          if (existing) {
            existing.transactionCount += trend.transactionCount;
            existing.eventCount += trend.eventCount;
          }
        });

        // Convert to sorted array and set activity type
        const result: ActivityTrend[] = Array.from(dateMap.values())
          .map((trend) => ({
            ...trend,
            activityType: (trend.paymentCount > 0 && trend.eventCount > 0
              ? "both"
              : trend.paymentCount > 0
                ? "payment"
                : "event") as "payment" | "event" | "both",
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        if (result.length === 0) {
          return createTsRestError(404, "No activity trends found");
        }

        return createTsRestSuccess(200, {
          success: true,
          message: "Activity trends retrieved successfully",
          data: result,
        });
      }),
    },
    getStats: {
      middleware: [
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
        cacheMiddleware({
          ttl: 3600,
        }),
      ],
      handler: tryCatchFn(async () => {
        const stats = await connectMongoDb(() => DashboardStats.findOne().sort({ updatedAt: -1 }));

        if (!stats) {
          return createTsRestSuccess(200, {
            success: true,
            message: "Dashboard stats retrieved successfully",
            data: {
              totalRevenue: 0,
              revenueChange: 0,
              activeSubscriptions: 0,
              subscriptionsChange: 0,
              openTickets: 0,
              ticketsChange: 0,
              pendingDues: 0,
              duesChange: 0,
            },
          });
        }

        return createTsRestSuccess(200, {
          success: true,
          message: "Dashboard stats retrieved successfully",
          data: {
            totalRevenue: stats.totalRevenue,
            revenueChange: stats.revenueChange,
            activeSubscriptions: stats.activeSubscriptions,
            subscriptionsChange: stats.subscriptionsChange,
            openTickets: stats.openTickets,
            ticketsChange: stats.ticketsChange,
            pendingDues: stats.pendingDues,
            duesChange: stats.duesChange,
          },
        });
      }),
    },
    getRecentActivities: {
      middleware: [
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
      ],
      handler: tryCatchFn(async ({ query }) => {
        const limit = query.limit || 10;

        const [payments, events, tickets] = await connectMongoDb(() => Promise.all([
          Payment.find({ paymentStatus: "completed" })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("userId", "name image")
            .lean(),
          Event.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("organizer", "name image")
            .lean(),
          Ticket.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("userId", "name image")
            .lean(),
        ]));

        const activities = [
          ...payments.map((p: any) => ({
            id: p._id.toString(),
            type: "payment" as const,
            title: `Payment for ${p.paymentType.replace("_", " ")}`,
            description: `${p.userId?.name || "Member"} paid ₦${p.amount}`,
            timestamp: p.createdAt.toISOString(),
            amount: p.amount,
            user: {
              name: p.userId?.name || "Unknown",
              image: p.userId?.image,
            },
          })),
          ...events.map((e: any) => ({
            id: e._id.toString(),
            type: "event" as const,
            title: `New Event: ${e.title}`,
            description: `Hosted by ${e.organizer?.name || "Admin"}`,
            timestamp: e.createdAt.toISOString(),
            status: e.status,
            user: {
              name: e.organizer?.name || "Admin",
              image: e.organizer?.image,
            },
          })),
          ...tickets.map((t: any) => ({
            id: t._id.toString(),
            type: "ticket" as const,
            title: `New Ticket: ${t.title}`,
            description: `Priority: ${t.priority}`,
            timestamp: t.createdAt.toISOString(),
            status: t.status,
            user: {
              name: t.userId?.name || "Member",
              image: t.userId?.image,
            },
          })),
        ]
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .slice(0, limit);

        return createTsRestSuccess(200, {
          success: true,
          message: "Recent activities retrieved successfully",
          data: activities,
        });
      }),
    },
  },
});
};
