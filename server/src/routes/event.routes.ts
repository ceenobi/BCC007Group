import { initServer } from "@ts-rest/express";
import { eventContract } from "~/contract/event.contract";
import { createTsRestError, createTsRestSuccess } from "~/lib/tsRestResponse";
import tryCatchFn from "~/lib/tryCatchFn";
import { validateFormData } from "~/middleware/formValidate";
import { customRateLimiter } from "~/middleware/rateLimit.middleware";
import { authorizedRoles, verifyUser } from "~/middleware/auth.middleware";
import {
  BatchDeleteEventSchema,
  CreateEventSchema,
  UpdateEventSchema,
} from "~/lib/dataSchema";
import Event from "~/models/event";
import { workflowClient } from "~/workflows/client";
import { env } from "~/config/keys";
import logger from "~/config/logger";
import User from "~/models/user";
import {
  cacheMiddleware,
  invalidateCache,
} from "~/middleware/cache.middleware";
import mongoose from "mongoose";
import { deleteFromCloudinary } from "~/config/upload";
import { serverEvents } from "~/lib/events";

const s = initServer();

export const eventRouter = s.router(eventContract, {
  events: {
    createEvent: {
      middleware: [
        customRateLimiter(10),
        verifyUser,
        authorizedRoles("admin", "super_admin"),
        validateFormData(CreateEventSchema),
      ],
      handler: tryCatchFn(async ({ body }) => {
        //ensure date is not in past
        if (new Date(body.date) < new Date()) {
          return createTsRestSuccess(400, {
            success: false,
            message: "Event date cannot be set for today or in the past",
          });
        }
        const event = await Event.create(body);
        //clear cache
        await invalidateCache("cache:/api/v1/events*");
        //fetch user to use in workflow
        const users = await User.find({ _id: { $in: event.organizer } }).lean();
        // Trigger workflow for email
        workflowClient
          .trigger({
            url: `${env.serverUrl}/api/v1/workflows/event-created`,
            body: {
              users,
              event,
            },
          })
          .catch((error: any) => {
            logger.error("Failed to trigger event created workflow:", error);
          });
        serverEvents.emit("event:created", event);
        return createTsRestSuccess(201, {
          success: true,
          message: "Event added successfully",
          data: event,
        });
      }),
    },
    getEvents: {
      middleware: [
        verifyUser,
        authorizedRoles("super_admin", "admin", "member"),
        cacheMiddleware({ ttl: 3600 }),
      ],
      handler: tryCatchFn(async ({ query: validatedQuery }) => {
        const {
          page = 1,
          limit = 10,
          query = "",
          status,
          eventType,
          startDate,
          endDate,
        } = validatedQuery;
        const dateFilter: any = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const matchStage: any = {
          ...(status && { status }),
          ...(eventType && { eventType }),
        };

        if (Object.keys(dateFilter).length > 0) {
          matchStage.date = dateFilter;
        }

        if (query) {
          const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const users = await User.find({
            $or: [{ name: { $regex: escapedQuery, $options: "i" } }],
          }).select("_id");
          const userIds = users.map((user) => user._id);

          matchStage.$or = [
            { title: { $regex: escapedQuery, $options: "i" } },
            { organizer: { $in: userIds } },
          ];

          if (mongoose.Types.ObjectId.isValid(query)) {
            matchStage.$or.push({ _id: query });
          }
        }

        const events = await Event.find(matchStage)
          .populate("organizer", "memberId name email image")
          .populate("interestedMembers", "memberId name email image")
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean();

        const totalEvents = await Event.countDocuments(matchStage);
        if (!events) {
          return createTsRestError(404, "Events not found");
        }
        return createTsRestSuccess(200, {
          success: true,
          message: "Events fetched successfully",
          data: {
            events,
            pagination: {
              currentPage: Number(page),
              limit: Number(limit),
              total: totalEvents,
              totalPages: Math.ceil(totalEvents / Number(limit)),
              hasMore: (page - 1) * limit + events.length < totalEvents,
            },
          },
        });
      }),
    },
    batchDeleteEvents: {
      middleware: [
        verifyUser,
        authorizedRoles("super_admin", "admin"),
        validateFormData(BatchDeleteEventSchema),
      ],
      handler: tryCatchFn(async ({ req }) => {
        const { ids } = req.body;
        const events = await Event.find({
          _id: { $in: ids },
        }).lean();
        for (const event of events) {
          if (!event) {
            return createTsRestError(
              404,
              `Event with ID ${event._id} not found`,
            );
          }
        }
        //delete event images from cloudinary
        await Promise.all(
          events.map(async (event) => {
            if (event.featuredImageId) {
              await deleteFromCloudinary(event.featuredImageId);
            }
          }),
        );
        await Promise.all([
          Event.deleteMany({
            _id: { $in: ids },
          }),
          invalidateCache("cache:/api/v1/events*"),
        ]);
        return createTsRestSuccess(200, {
          success: true,
          message: "Events deleted successfully",
          data: { deletedCount: events.length },
        });
      }),
    },
    deleteEvent: {
      middleware: [verifyUser, authorizedRoles("super_admin", "admin")],
      handler: tryCatchFn(async ({ params }) => {
        const { id } = params;
        const event = await Event.findById(id).lean();
        if (!event) {
          return createTsRestError(404, "Event not found");
        }
        //delete event images from cloudinary
        if (event.featuredImageId) {
          await deleteFromCloudinary(event.featuredImageId);
        }
        await Promise.all([
          Event.deleteOne({ _id: id }),
          invalidateCache("cache:/api/v1/events*"),
        ]);
        return createTsRestSuccess(200, {
          success: true,
          message: "Event deleted successfully",
          data: { deletedCount: 1 },
        });
      }),
    },
    updateEvent: {
      middleware: [
        verifyUser,
        authorizedRoles("super_admin", "admin"),
        validateFormData(UpdateEventSchema),
      ],
      handler: tryCatchFn(async ({ params, body }) => {
        const { id } = params;
        const event = await Event.findById(id);
        if (!event) {
          return createTsRestError(404, "Event not found");
        }
        const oldOrganizer = event.organizer || [];
        const newOrganizer = (body as any).organizer || oldOrganizer;
        const idsToDeleteOrganizer = oldOrganizer.filter(
          (id: string) => !newOrganizer.includes(id),
        );
        // Find IDs that are in new but NOT in old (new recommendations)
        const idsToAddOrganizer = newOrganizer.filter(
          (id: string) => !oldOrganizer.includes(id.toString()),
        );

        if (idsToDeleteOrganizer.length > 0) {
          await Promise.all(
            idsToDeleteOrganizer.map((id: string) =>
              Event.findByIdAndUpdate(id, {
                $pull: { organizer: id },
              }),
            ),
          );
        }

        if (idsToAddOrganizer.length > 0) {
          await Promise.all(
            idsToAddOrganizer.map((id: string) =>
              Event.findByIdAndUpdate(id, {
                $addToSet: { organizer: id },
              }),
            ),
          );
        }

        for (const [key, value] of Object.entries(body)) {
          if (value !== undefined) {
            (event as any)[key] = value;
          }
        }
        await event.save();
        await invalidateCache("cache:/api/v1/events*");
        serverEvents.emit("event:updated", event);
        return createTsRestSuccess(200, {
          success: true,
          message: "Event updated successfully",
          data: event,
        });
      }),
    },
  },
});
