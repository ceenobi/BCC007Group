import User from "../models/user.js";
import Payment from "../models/payment.js";
import Ticket from "../models/ticket.js";
import DashboardStats from "../models/dashboardStats.js";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import logger from "../config/logger.js";

export const calculateDashboardStats = async () => {
  logger.info("Starting dashboard stats calculation workflow...");
  try {
    const currentDate = new Date();
    const startOfCurrentMonth = startOfMonth(currentDate);
    const startOfLastMonth = startOfMonth(subMonths(currentDate, 1));
    const endOfLastMonth = endOfMonth(subMonths(currentDate, 1));

    const [
      currentMonthPaymentStats,
      lastMonthPaymentStats,
      currentMonthSubsStats,
      lastMonthSubsStats,
      openTicketsCount,
      lastMonthTicketsCount,
      totalMembersCount,
      paidMembersCount,
      lastMonthPaidMembersCount,
    ] = await Promise.all([
      // Current Month Revenue
      Payment.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: { $gte: startOfCurrentMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      // Last Month Revenue
      Payment.aggregate([
        {
          $match: {
            paymentStatus: "completed",
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      // Current Active Subscriptions (count unique users)
      Payment.aggregate([
        { $match: { subscriptionStatus: "active", isRecurring: true } },
        { $group: { _id: "$userId" } },
        { $count: "count" },
      ]).then((res) => res[0]?.count || 0),
      // Subscriptions at start of this month (count unique users)
      Payment.aggregate([
        {
          $match: {
            subscriptionStatus: "active",
            isRecurring: true,
            createdAt: { $lt: startOfCurrentMonth },
          },
        },
        { $group: { _id: "$userId" } },
        { $count: "count" },
      ]).then((res) => res[0]?.count || 0),
      // Open Tickets
      Ticket.countDocuments({ status: { $in: ["open", "in-progress"] } }),
      // Tickets closed last month (to calculate trend)
      Ticket.countDocuments({
        status: "closed",
        updatedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      // Total Members
      User.countDocuments({}),
      // Paid Members this month
      Payment.distinct("userId", {
        paymentType: "membership_dues",
        paymentStatus: "completed",
        lastPaymentDate: { $gte: startOfCurrentMonth },
      }),
      // Paid Members last month (for trend)
      Payment.distinct("userId", {
        paymentType: "membership_dues",
        paymentStatus: "completed",
        lastPaymentDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
    ]);

    const currentRevenue = currentMonthPaymentStats[0]?.total || 0;
    const lastRevenue = lastMonthPaymentStats[0]?.total || 0;

    const calculateChange = (current: number, last: number) => {
      if (last === 0) return current > 0 ? 100 : 0;
      return ((current - last) / last) * 100;
    };

    const revenueChange = calculateChange(currentRevenue, lastRevenue);
    const subsChange = calculateChange(
      currentMonthSubsStats,
      lastMonthSubsStats,
    );
    const ticketsChange = calculateChange(
      openTicketsCount,
      lastMonthTicketsCount,
    );

    const currentPaidCount = paidMembersCount.length;
    const lastPaidCount = lastMonthPaidMembersCount.length;
    const duesChange = calculateChange(currentPaidCount, lastPaidCount);

    const pendingDues = Math.max(0, totalMembersCount - currentPaidCount);

    const statsData = {
      totalRevenue: currentRevenue,
      revenueChange: Math.round(revenueChange),
      activeSubscriptions: currentMonthSubsStats,
      subscriptionsChange: Math.round(subsChange),
      openTickets: openTicketsCount,
      ticketsChange: Math.round(ticketsChange),
      pendingDues: pendingDues,
      duesChange,
    };

    // Update or create the single dashboard stats document
    const stats = await DashboardStats.findOneAndUpdate({}, statsData, {
      upsert: true,
      returnDocument: "after",
    });

    logger.info("Dashboard stats calculation workflow completed successfully");
    return { success: true, stats };
  } catch (error: any) {
    logger.error("Error calculating dashboard stats:", error);
    throw error;
  }
};
