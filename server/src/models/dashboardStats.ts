import mongoose, { Schema, Document } from "mongoose";

export interface IDashboardStats extends Document {
  totalRevenue: number;
  revenueChange: number;
  activeSubscriptions: number;
  subscriptionsChange: number;
  openTickets: number;
  ticketsChange: number;
  pendingDues: number;
  duesChange: number;
}

const DashboardStatsSchema = new Schema<IDashboardStats>(
  {
    totalRevenue: { type: Number, default: 0 },
    revenueChange: { type: Number, default: 0 },
    activeSubscriptions: { type: Number, default: 0 },
    subscriptionsChange: { type: Number, default: 0 },
    openTickets: { type: Number, default: 0 },
    ticketsChange: { type: Number, default: 0 },
    pendingDues: { type: Number, default: 0 },
    duesChange: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const DashboardStats =
  mongoose.models.DashboardStats ||
  mongoose.model<IDashboardStats>("DashboardStats", DashboardStatsSchema);

export default DashboardStats;
