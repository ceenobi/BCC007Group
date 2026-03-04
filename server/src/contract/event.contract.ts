import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { ErrorSchema, EventSchema, CreateEventSchema, UpdateEventSchema } from "~/lib/dataSchema";

const EventResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: EventSchema,
});

const EventsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    events: z.array(EventSchema),
    pagination: z.object({
      currentPage: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasMore: z.boolean(),
    }),
  }),
});

const c = initContract();

export const eventContract = c.router({
  events: {
    createEvent: {
      method: "POST",
      path: "/api/v1/events/create",
      body: CreateEventSchema,
      responses: {
        201: EventResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Create an event",
    },
    getEvents: {
      method: "GET",
      path: "/api/v1/events/get",
      query: z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        query: z.string().optional(),
        status: z
          .enum(["upcoming", "ongoing", "completed", "cancelled"])
          .optional(),
        eventType: z
          .enum(["announcement", "meeting", "birthday", "other"])
          .optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
      responses: {
        200: EventsResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Get events",
    },
    batchDeleteEvents: {
      method: "DELETE",
      path: "/api/v1/events/delete",
      body: z.object({
        ids: z.array(z.string()),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.object({
            deletedCount: z.number(),
          }),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Batch delete events",
    },
    deleteEvent: {
      method: "DELETE",
      path: "/api/v1/events/delete/:id",
      pathParams: z.object({
        id: z.string(),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Delete event",
    },
    updateEvent: {
      method: "PATCH",
      path: "/api/v1/events/update/:id",
      pathParams: z.object({
        id: z.string(),
      }),
      body: UpdateEventSchema,
      responses: {
        200: EventResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Update event",
    },
  },
});

export type EventContract = typeof eventContract;
