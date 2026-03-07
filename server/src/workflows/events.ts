import { invalidateCache } from "@/middleware/cache.middleware.js";
import { Types } from "mongoose";
import Event from "@/models/event.js";

type BulkWriteOperation = {
  updateOne: {
    filter: { _id: Types.ObjectId };
    update: { $set: { status: string; updatedAt: Date } };
  };
};

/**
 * Updates statuses for all events whose date/time has passed.
 * upcoming -> ongoing (if current time is between start and end)
 * ongoing -> completed (if current time is after end)
 * upcoming -> completed (if current time is after end)
 */
export async function updateEventStatuses() {
  const now = new Date();
  const session = await Event.startSession();
  session.startTransaction();
  try {
    console.info(`Starting event status update at ${now.toISOString()}`);

    // Get all events that are not cancelled or already completed
    // We also check upcoming/ongoing to see if they need to move forward
    const events = await Event.find({
      status: { $in: ["upcoming", "ongoing"] },
    }).session(session);

    if (events.length === 0) {
      console.info("No active events require status updates");
      await session.abortTransaction();
      return { success: true, updatedCount: 0 };
    }

    const bulkOps: BulkWriteOperation[] = [];
    const FOUR_HOURS_MS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

    for (const event of events) {
      // Parse the event time (format: "HH:MM" or "HH:MM AM/PM")
      const timeStr = event.time.trim();
      const timeParts = timeStr.split(" ");
      const [hPart, mPart] = timeParts[0].split(":");
      let hours = parseInt(hPart, 10);
      const minutes = parseInt(mPart, 10);
      const period = timeParts[1]?.toLowerCase();

      // Convert to 24-hour format if needed
      if (period === "pm" && hours < 12) {
        hours += 12;
      } else if (period === "am" && hours === 12) {
        hours = 0;
      }

      // Create a date object for the event's exact start time
      const eventStartDateTime = new Date(event.date);
      eventStartDateTime.setHours(hours, minutes, 0, 0);

      // End time logic: Default to 4 hours after start
      const eventEndDateTime = new Date(
        eventStartDateTime.getTime() + FOUR_HOURS_MS,
      );

      let newStatus = event.status;

      if (now < eventStartDateTime) {
        newStatus = "upcoming";
      } else if (now >= eventStartDateTime && now <= eventEndDateTime) {
        newStatus = "ongoing";
      } else if (now > eventEndDateTime) {
        newStatus = "completed";
      }

      if (newStatus !== event.status) {
        bulkOps.push({
          updateOne: {
            filter: { _id: event._id as Types.ObjectId },
            update: {
              $set: {
                status: newStatus,
                updatedAt: now,
              },
            },
          },
        });
      }
    }

    if (bulkOps.length === 0) {
      console.info("No status changes needed");
      await session.abortTransaction();
      return { success: true, updatedCount: 0 };
    }

    // Execute bulk updates
    const result = await Event.bulkWrite(bulkOps, { session });
    console.info(`Updated ${result.modifiedCount} event statuses`);

    // Invalidate event list cache
    await invalidateCache("cache:/api/v1/events*");
    console.info("Invalidated event cache");

    await session.commitTransaction();
    return {
      success: true,
      updatedCount: result.modifiedCount,
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Failed to update event statuses:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await session.endSession();
  }
}
