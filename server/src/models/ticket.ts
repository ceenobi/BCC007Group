import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  ticketId: string;
  title: string;
  description: string;
  category: "technical" | "event" | "payment" | "other";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  assignedTo: mongoose.Types.ObjectId | null;
}

const TicketSchema = new Schema<ITicket>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true, maxlength: 200 },
    category: {
      type: String,
      enum: ["technical", "event", "payment", "other"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    assignedTo: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Ticket = mongoose.model<ITicket>("Ticket", TicketSchema);

TicketSchema.index({ userId: 1 });
TicketSchema.index({ status: 1, updatedAt: 1 });

export default Ticket;
