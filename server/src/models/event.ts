import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  location: string;
  date: Date;
  time: string;
  eventType: "announcement" | "meeting" | "birthday" | "other";
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  interestedMembers: mongoose.Types.ObjectId[];
  organizer: mongoose.Types.ObjectId[];
  isPublic: boolean;
  featuredImage?: string;
  featuredImageId?: string | undefined;
  fees: number;
}
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: ["announcement", "meeting", "birthday", "other"],
      default: "announcement",
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    interestedMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    organizer: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    featuredImage: {
      type: String,
    },
    featuredImageId: {
      type: String,
    },
    fees: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

EventSchema.index({ title: "text", location: "text", organizer: "text" });
EventSchema.index({ date: 1 });
EventSchema.index({ organizer: 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ isPublic: 1 });
EventSchema.index({ interestedMembers: 1 });

const Event =
  mongoose.models.Event ||
  mongoose.model<IEvent>("Event", EventSchema, "event");

export default Event;
