import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  TicketSchema,
  CreateTicketSchema,
  UpdateTicketSchema,
  ErrorSchema,
} from "~/lib/dataSchema";

const c = initContract();

const TicketResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: TicketSchema,
});

const TicketsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    tickets: z.array(TicketSchema),
    summary: z
      .object({
        totalTickets: z.number().optional(),
        openTickets: z.number().optional(),
        closedTickets: z.number().optional(),
        inProgressTickets: z.number().optional(),
        resolvedTickets: z.number().optional(),
      })
      .optional(),
    pagination: z.object({
      currentPage: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasMore: z.boolean(),
    }),
  }),
});

export const ticketContract = c.router({
  tickets: {
    createTicket: {
      method: "POST",
      path: "/api/v1/tickets/create",
      summary: "Create ticket",
      body: CreateTicketSchema,
      responses: {
        201: TicketResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
    },
    getTickets: {
      method: "GET",
      path: "/api/v1/tickets/get",
      query: z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        query: z.string().optional(),
        status: z
          .enum(["open", "in-progress", "resolved", "closed"])
          .optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        category: z.enum(["technical", "event", "payment", "other"]).optional(),
      }),
      responses: {
        200: TicketsResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Get tickets",
    },
    updateTicket: {
      method: "PATCH",
      path: "/api/v1/tickets/update/:id",
      pathParams: z.object({
        id: z.string(),
      }),
      summary: "Update ticket",
      body: UpdateTicketSchema,
      responses: {
        200: TicketResponseSchema,
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

export type TicketContract = typeof ticketContract;
