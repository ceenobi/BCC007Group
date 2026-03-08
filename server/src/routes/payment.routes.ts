import { initServer } from "@ts-rest/express";
import { paymentContract } from "../contract/payment.contract.js";
import { createTsRestSuccess, createTsRestError } from "../lib/tsRestResponse.js";
import tryCatchFn from "../lib/tryCatchFn.js";
import { authorizedRoles, verifyUser } from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import mongoose from "mongoose";

import { connectMongoDb } from "../config/db.server.js";

export const getPaymentRouter = () => {
  const s = initServer();

  return s.router(paymentContract, {
  payments: {
    listUserPayments: {
      middleware: [
        verifyUser,
        authorizedRoles("super_admin", "admin", "member"),
        cacheMiddleware({
          ttl: 3600,
          keyGenerator: (req) => `cache:payments:${req.user?.id}`,
        }),
      ],
      handler: tryCatchFn(async ({ req, query: validatedQuery }) => {
        const {
          page = 1,
          limit = 10,
          query,
          paymentStatus,
          paymentType,
        } = validatedQuery;
        const matchStage: any = {
          userId: req.user?.id,
        };
        const normalizedQuery = query?.trim();
        if (normalizedQuery) {
          matchStage.reference = normalizedQuery;
        }
        if (paymentStatus) {
          matchStage.paymentStatus = paymentStatus;
        }
        if (paymentType) {
          matchStage.paymentType = paymentType;
        }
        const payments = await connectMongoDb(() => Payment.find(matchStage)
          .populate("userId", "memberId name email image")
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean())
        const totalPayments = await connectMongoDb(() => Payment.countDocuments(matchStage));
        if (!payments) {
          return createTsRestError(404, "Payments not found");
        }
        return createTsRestSuccess(200, {
          success: true,
          message: "Payments fetched successfully",
          data: {
            payments,
            pagination: {
              currentPage: Number(page),
              limit: Number(limit),
              total: totalPayments,
              totalPages: Math.ceil(totalPayments / Number(limit)),
              hasMore: (page - 1) * limit + payments.length < totalPayments,
            },
          },
        });
      }),
    },
    groupPayments: {
      middleware: [
        verifyUser,
        authorizedRoles("super_admin", "admin"),
        cacheMiddleware({
          ttl: 3600,
        }),
      ],
      handler: tryCatchFn(async ({ query: validatedQuery }) => {
        const {
          page = 1,
          limit = 10,
          query,
          paymentStatus,
          paymentType,
        } = validatedQuery;
        const matchStage: any = {};

        const normalizedQuery = query?.trim();
        const isReferenceQuery = normalizedQuery
          ? /^BCC-[A-Z0-9]+-\d+$/i.test(normalizedQuery)
          : false;

        if (normalizedQuery && isReferenceQuery) {
          matchStage.reference = normalizedQuery;
        } else if (normalizedQuery) {
          // Find users matching the name query
          const users = await connectMongoDb(() => User.find({
            $or: [{ name: { $regex: normalizedQuery, $options: "i" } }],
          })
            .select("_id")
            .lean())
          const userIds = users.map((u: any) => u._id);

          matchStage.$or = [
            { reference: normalizedQuery },
            { userId: { $in: userIds } },
          ];
        }
        if (paymentStatus) {
          matchStage.paymentStatus = paymentStatus;
        }
        if (paymentType) {
          matchStage.paymentType = paymentType;
        }

        const payments = await connectMongoDb(() => Payment.find(matchStage)
          .populate("userId", "memberId name email image")
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean());

        const totalPayments = await connectMongoDb(() => Payment.countDocuments(matchStage));
        if (!payments) {
          return createTsRestError(404, "Payments not found");
        }

        return createTsRestSuccess(200, {
          success: true,
          message: "Group payments fetched successfully",
          data: {
            payments,
            pagination: {
              currentPage: Number(page),
              limit: Number(limit),
              total: totalPayments,
              totalPages: Math.ceil(totalPayments / Number(limit)),
              hasMore: (page - 1) * limit + payments.length < totalPayments,
            },
          },
        });
      }),
    },
    paymentReports: {
      middleware: [
        verifyUser,
        authorizedRoles("super_admin", "admin"),
        cacheMiddleware({
          ttl: 3600,
          keyGenerator: (req) =>
            `cache:payment-reports:all:${req.query.period || "all"}:${req.query.paymentStatus || "all"}:${req.query.paymentType || "all"}`,
        }),
      ],
      handler: tryCatchFn(async ({ query: validatedQuery }) => {
        const { period, paymentStatus, paymentType } = validatedQuery;

        const matchStage: any = {};
        if (paymentStatus) matchStage.paymentStatus = paymentStatus;
        if (paymentType) matchStage.paymentType = paymentType;

        if (period && period !== "all") {
          const now = new Date();
          let startDate = new Date();
          if (period === "1w") startDate.setDate(now.getDate() - 7);
          else if (period === "1m") startDate.setMonth(now.getMonth() - 1);
          else if (period === "6m") startDate.setMonth(now.getMonth() - 6);
          else if (period === "1y")
            startDate.setFullYear(now.getFullYear() - 1);

          matchStage.createdAt = { $gte: startDate };
        }

        const dateFormat =
          period === "1w" || period === "1m" ? "%Y-%m-%d" : "%Y-%m";

        const aggregateResult = await connectMongoDb(() => Payment.aggregate([
          { $match: matchStage },
          {
            $facet: {
              statsTotals: [
                {
                  $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                    totalCount: { $sum: 1 },
                  },
                },
              ],
              statsCompleted: [
                { $match: { paymentStatus: "completed" } },
                {
                  $group: {
                    _id: null,
                    completedRevenue: { $sum: "$amount" },
                    completedCount: { $sum: 1 },
                  },
                },
              ],
              statsPending: [
                { $match: { paymentStatus: "pending" } },
                {
                  $group: {
                    _id: null,
                    pendingRevenue: { $sum: "$amount" },
                    pendingCount: { $sum: 1 },
                  },
                },
              ],
              typeBreakdown: [
                {
                  $group: {
                    _id: "$paymentType",
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 },
                  },
                },
              ],
              trends: [
                {
                  $group: {
                    _id: {
                      $dateToString: { format: dateFormat, date: "$createdAt" },
                    },
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { _id: 1 } },
                {
                  $project: {
                    _id: 0,
                    date: "$_id",
                    revenue: 1,
                    count: 1,
                  },
                },
              ],
            },
          },
        ]));

        const result = aggregateResult[0];
        const stats = {
          totalRevenue: result.statsTotals[0]?.totalRevenue || 0,
          totalCount: result.statsTotals[0]?.totalCount || 0,
          completedRevenue: result.statsCompleted[0]?.completedRevenue || 0,
          completedCount: result.statsCompleted[0]?.completedCount || 0,
          pendingRevenue: result.statsPending[0]?.pendingRevenue || 0,
          pendingCount: result.statsPending[0]?.pendingCount || 0,
        };
        //get payment trends over the year by months
        const currentYear = new Date().getFullYear();
        const monthlyMatchStage: any = {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`),
          },
        };
        if (paymentStatus) monthlyMatchStage.paymentStatus = paymentStatus;
        if (paymentType) monthlyMatchStage.paymentType = paymentType;

        const paymentsByMonth = await connectMongoDb(() => Payment.aggregate([
          { $match: monthlyMatchStage },
          {
            $group: {
              _id: { $month: "$createdAt" },
              month: {
                $first: { $dateToString: { format: "%B", date: "$createdAt" } },
              },
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]));

        const allMonths = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(currentYear, i, 1);
          return {
            _id: i + 1,
            month: date.toLocaleString("default", { month: "long" }),
            total: 0,
            count: 0,
          };
        });

        const monthlyBreakdown = allMonths.map((m) => {
          const fromDb = paymentsByMonth.find((p: any) => p._id === m._id);
          if (!fromDb) return m;
          return {
            _id: fromDb._id,
            month: fromDb.month || m.month,
            total: fromDb.total || 0,
            count: fromDb.count || 0,
          };
        });

        const monthlySummary = {
          year: currentYear,
          total: monthlyBreakdown.reduce(
            (sum: number, m: any) => sum + m.total,
            0,
          ),
        };

        // Group-level rolling 12-month membership dues stats
        const firstDuesPayment = await connectMongoDb(() => Payment.findOne(
          {
            paymentType: "membership_dues",
            paymentStatus: "completed",
          },
          { createdAt: 1 },
          { sort: { createdAt: 1 } },
        ).lean());

        if (!firstDuesPayment?.createdAt) {
          return createTsRestSuccess(200, {
            success: true,
            message: "Payment reports fetched successfully",
            data: {
              stats,
              typeBreakdown: result.typeBreakdown,
              trends: result.trends,
              monthlyBreakdown,
              monthlySummary,
              paymentStats: {
                yearlyDues: 0,
                totalPaidThisYear: 0,
                monthsPaid: 0,
                paymentPercentage: 0,
                isUpToDate: false,
                cycleStart: null,
                cycleEnd: null,
                lastMonthlyDuesPaid: null,
              },
            },
          });
        }

        const cycleStart = new Date(firstDuesPayment.createdAt as any);
        const cycleEnd = new Date(cycleStart);
        cycleEnd.setFullYear(cycleEnd.getFullYear() + 1);

        const yearlyPayments = await connectMongoDb(() => Payment.aggregate([
          {
            $match: {
              paymentType: "membership_dues",
              paymentStatus: "completed",
              createdAt: { $gte: cycleStart, $lt: cycleEnd },
            },
          },
          {
            $group: {
              _id: null,
              totalPaid: { $sum: "$amount" },
              monthsPaid: { $addToSet: { $month: "$createdAt" } },
              lastPayment: { $max: "$createdAt" },
            },
          },
        ]));

        const yearlyDues = 2000 * 12; // 2000 per month * 12 months
        const totalPaidThisYear = yearlyPayments[0]?.totalPaid || 0;
        const monthsPaid = yearlyPayments[0]?.monthsPaid?.length || 0;
        const paymentPercentage = (totalPaidThisYear / yearlyDues) * 100;
        const expectedMonthsPaid = Math.min(
          12,
          Math.floor(
            (new Date().getTime() - cycleStart.getTime()) /
              (1000 * 60 * 60 * 24 * 30.44),
          ) + 1,
        );
        const isUpToDate = monthsPaid >= expectedMonthsPaid;

        const paymentStats = {
          yearlyDues,
          totalPaidThisYear,
          monthsPaid,
          paymentPercentage: Math.min(100, paymentPercentage),
          isUpToDate,
          cycleStart,
          cycleEnd,
          lastMonthlyDuesPaid: yearlyPayments[0]?.lastPayment || null,
        };

        return createTsRestSuccess(200, {
          success: true,
          message: "Payment reports fetched successfully",
          data: {
            stats,
            typeBreakdown: result.typeBreakdown,
            trends: result.trends,
            monthlyBreakdown,
            monthlySummary,
            paymentStats,
          },
        });
      }),
    },
    paymentReportsUser: {
      middleware: [
        verifyUser,
        authorizedRoles("super_admin", "admin", "member"),
        cacheMiddleware({
          ttl: 3600,
          keyGenerator: (req) =>
            `cache:payment-reports:${req.user?.id}:${req.query.period || "all"}:${req.query.paymentStatus || "all"}:${req.query.paymentType || "all"}`,
        }),
      ],
      handler: tryCatchFn(async ({ req, query: validatedQuery }) => {
        const { period, paymentStatus, paymentType } = validatedQuery;

        const matchStage: any = {
          userId: new mongoose.Types.ObjectId(req.user?.id),
        };
        if (paymentStatus) matchStage.paymentStatus = paymentStatus;
        if (paymentType) matchStage.paymentType = paymentType;

        if (period && period !== "all") {
          const now = new Date();
          let startDate = new Date();
          if (period === "1w") startDate.setDate(now.getDate() - 7);
          else if (period === "1m") startDate.setMonth(now.getMonth() - 1);
          else if (period === "6m") startDate.setMonth(now.getMonth() - 6);
          else if (period === "1y")
            startDate.setFullYear(now.getFullYear() - 1);

          matchStage.createdAt = { $gte: startDate };
        }

        const dateFormat =
          period === "1w" || period === "1m" ? "%Y-%m-%d" : "%Y-%m";

        const aggregateResult = await connectMongoDb(() => Payment.aggregate([
          { $match: matchStage },
          {
            $facet: {
              statsTotals: [
                {
                  $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                    totalCount: { $sum: 1 },
                  },
                },
              ],
              statsCompleted: [
                { $match: { paymentStatus: "completed" } },
                {
                  $group: {
                    _id: null,
                    completedRevenue: { $sum: "$amount" },
                    completedCount: { $sum: 1 },
                  },
                },
              ],
              statsPending: [
                { $match: { paymentStatus: "pending" } },
                {
                  $group: {
                    _id: null,
                    pendingRevenue: { $sum: "$amount" },
                    pendingCount: { $sum: 1 },
                  },
                },
              ],
              typeBreakdown: [
                {
                  $group: {
                    _id: "$paymentType",
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 },
                  },
                },
              ],
              trends: [
                {
                  $group: {
                    _id: {
                      $dateToString: { format: dateFormat, date: "$createdAt" },
                    },
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { _id: 1 } },
                {
                  $project: {
                    _id: 0,
                    date: "$_id",
                    revenue: 1,
                    count: 1,
                  },
                },
              ],
            },
          },
        ]));

        const result = aggregateResult[0];
        const stats = {
          totalRevenue: result.statsTotals[0]?.totalRevenue || 0,
          totalCount: result.statsTotals[0]?.totalCount || 0,
          completedRevenue: result.statsCompleted[0]?.completedRevenue || 0,
          completedCount: result.statsCompleted[0]?.completedCount || 0,
          pendingRevenue: result.statsPending[0]?.pendingRevenue || 0,
          pendingCount: result.statsPending[0]?.pendingCount || 0,
        };

        const currentYear = new Date().getFullYear();
        const yearlyDues = 2000 * 12;
        const monthlyMatchStage: any = {
          userId: new mongoose.Types.ObjectId(req.user?.id),
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`),
          },
        };
        if (paymentStatus) monthlyMatchStage.paymentStatus = paymentStatus;
        if (paymentType) monthlyMatchStage.paymentType = paymentType;

        const paymentsByMonth = await connectMongoDb(() => Payment.aggregate([
          { $match: monthlyMatchStage },
          {
            $group: {
              _id: { $month: "$createdAt" },
              month: {
                $first: { $dateToString: { format: "%B", date: "$createdAt" } },
              },
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]));

        const allMonths = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(currentYear, i, 1);
          return {
            _id: i + 1,
            month: date.toLocaleString("default", { month: "long" }),
            total: 0,
            count: 0,
          };
        });

        const monthlyBreakdown = allMonths.map((m) => {
          const fromDb = paymentsByMonth.find((p: any) => p._id === m._id);
          if (!fromDb) return m;
          return {
            _id: fromDb._id,
            month: fromDb.month || m.month,
            total: fromDb.total || 0,
            count: fromDb.count || 0,
          };
        });

        const monthlySummary = {
          year: currentYear,
          total: monthlyBreakdown.reduce(
            (sum: number, m: any) => sum + m.total,
            0,
          ),
        };
        // member-level rolling 12-month membership dues stats
        const cycleUserId = new mongoose.Types.ObjectId(req.user?.id);

        const firstDuesPayment = await connectMongoDb(() => Payment.findOne({
          userId: cycleUserId,
          paymentStatus: "completed",
          paymentType: "membership_dues",
        })
          .sort({ createdAt: 1 })
          .lean());

        if (!firstDuesPayment?.createdAt) {
          return createTsRestSuccess(200, {
            success: true,
            message: "Payment reports fetched successfully",
            data: {
              stats,
              typeBreakdown: result.typeBreakdown,
              trends: result.trends,
              monthlyBreakdown,
              monthlySummary,
              paymentStats: {
                yearlyDues,
                totalPaidThisYear: 0,
                monthsPaid: 0,
                paymentPercentage: 0,
                isUpToDate: false,
                cycleStart: null,
                cycleEnd: null,
                lastMonthlyDuesPaid: null,
              },
            },
          });
        }

        const cycleStart = new Date(firstDuesPayment.createdAt as any);
        const cycleEnd = new Date(cycleStart);
        cycleEnd.setFullYear(cycleEnd.getFullYear() + 1);

        const lastMonthlyDuesPaid = await connectMongoDb(() => Payment.findOne({
          userId: cycleUserId,
          paymentStatus: "completed",
          paymentType: "membership_dues",
        })
          .sort({ createdAt: -1 })
          .lean());

        const cyclePaymentsAgg = await connectMongoDb(() => Payment.aggregate([
          {
            $match: {
              userId: cycleUserId,
              paymentStatus: "completed",
              paymentType: "membership_dues",
              createdAt: {
                $gte: cycleStart,
                $lt: cycleEnd,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalPaid: { $sum: "$amount" },
              paymentCount: { $sum: 1 },
            },
          },
        ]));

        const totalPaidThisYear = cyclePaymentsAgg[0]?.totalPaid || 0;
        const monthsPaid = Math.floor(totalPaidThisYear / 2000);

        const now = new Date();
        const monthsElapsedSinceStart =
          (now.getFullYear() - cycleStart.getFullYear()) * 12 +
          (now.getMonth() - cycleStart.getMonth()) +
          1;
        const expectedMonthsPaid = Math.min(
          12,
          Math.max(1, monthsElapsedSinceStart),
        );

        const currentCycleMonthStart = new Date(cycleStart);
        currentCycleMonthStart.setMonth(
          currentCycleMonthStart.getMonth() + (expectedMonthsPaid - 1),
        );
        currentCycleMonthStart.setHours(0, 0, 0, 0);

        const nextCycleMonthStart = new Date(currentCycleMonthStart);
        nextCycleMonthStart.setMonth(nextCycleMonthStart.getMonth() + 1);

        const currentMonthlyDuesPaid = await connectMongoDb(() => Payment.findOne({
          userId: cycleUserId,
          paymentStatus: "completed",
          paymentType: "membership_dues",
          createdAt: {
            $gte: currentCycleMonthStart,
            $lt: nextCycleMonthStart,
          },
        }).lean());

        const paymentPercentage = (totalPaidThisYear / yearlyDues) * 100;
        const isUpToDate =
          monthsPaid >= expectedMonthsPaid && currentMonthlyDuesPaid !== null;

        const paymentStats = {
          yearlyDues,
          totalPaidThisYear,
          monthsPaid,
          paymentPercentage: Math.min(100, paymentPercentage),
          isUpToDate,
          cycleStart,
          cycleEnd,
          lastMonthlyDuesPaid,
        };

        return createTsRestSuccess(200, {
          success: true,
          message: "Payment reports fetched successfully",
          data: {
            stats,
            typeBreakdown: result.typeBreakdown,
            trends: result.trends,
            monthlyBreakdown,
            monthlySummary,
            paymentStats,
          },
        });
      }),
    },
  },
});
};
