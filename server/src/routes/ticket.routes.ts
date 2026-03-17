import { initServer } from "@ts-rest/express";
import { ticketContract } from "../contract/ticket.contract.js";
import {
  createTsRestSuccess,
  createTsRestError,
} from "../lib/tsRestResponse.js";
import tryCatchFn from "../lib/tryCatchFn.js";
import { authorizedRoles, verifyUser } from "../middleware/auth.middleware.js";
import Ticket from "../models/ticket.js";
import User from "../models/user.js";
import {
  cacheMiddleware,
  invalidateCache,
} from "../middleware/cache.middleware.js";
import { validateFormData } from "../middleware/formValidate.js";
import { customRateLimiter } from "../middleware/rateLimit.middleware.js";
import { CreateTicketSchema, UpdateTicketSchema } from "../lib/dataSchema.js";
import { generateTicketId } from "../lib/options.js";
import { workflowClient } from "../workflows/client.js";
import { env } from "../config/keys.js";
import { serverEvents } from "../lib/events.js";
import logger from "../config/logger.js";

import { connectMongoDb } from "../config/db.server.js";

export const getTicketRouter = () => {
  const s = initServer();

  return s.router(ticketContract, {
    tickets: {
      createTicket: {
        middleware: [
          customRateLimiter(10),
          verifyUser,
          authorizedRoles("super_admin", "admin", "member"),
          validateFormData(CreateTicketSchema),
        ],
        handler: tryCatchFn(async ({ req }) => {
          const { title, description, category, priority } = req.body;
          const ticket = await connectMongoDb(() =>
            Ticket.create({
              title,
              description,
              category,
              priority,
              userId: req.user?.id,
              ticketId: generateTicketId(),
            }),
          );
          if (!ticket) {
            return createTsRestError(400, "Ticket creation failed");
          }
          await invalidateCache("cache:/api/v1/tickets*");
          workflowClient
            .trigger({
              url: `${env.serverUrl}/api/v1/workflows/ticket-created`,
              body: {
                user: req.user,
                ticketId: ticket.ticketId,
              },
            })
            .catch((error: any) => {
              logger.error("Failed to trigger ticket created workflow:", error);
            });
          serverEvents.emit("ticket:created", ticket);
          return createTsRestSuccess(201, {
            success: true,
            message: "Ticket created and will be processed",
            data: ticket,
          });
        }),
      },
      getTickets: {
        middleware: [
          verifyUser,
          authorizedRoles("super_admin", "admin", "member"),
          cacheMiddleware({ ttl: 3600 }),
        ],
        handler: tryCatchFn(async ({ query: validatedQuery }) => {
          const {
            page = 1,
            limit = 10,
            query,
            status,
            priority,
            category,
          } = validatedQuery;
          const matchStage: any = {
            ...(status && { status }),
            ...(priority && { priority }),
            ...(category && { category }),
          };
          if (query) {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            matchStage.$or = [
              { title: { $regex: escapedQuery, $options: "i" } },
              { description: { $regex: escapedQuery, $options: "i" } },
              { ticketId: { $regex: escapedQuery, $options: "i" } },
            ];
          }
          const tickets = await connectMongoDb(() =>
            Ticket.find(matchStage)
              .populate("userId", "name email phone")
              .populate("assignedTo", "name email phone")
              .skip((page - 1) * limit)
              .limit(limit)
              .sort({ createdAt: -1 })
              .lean(),
          );
          const totalTickets = await connectMongoDb(() =>
            Ticket.countDocuments(matchStage),
          );
          //ticket stats
          const ticketStats = await connectMongoDb(() =>
            Ticket.aggregate([
              {
                $group: {
                  _id: null,
                  totalTickets: { $sum: 1 },
                  openTickets: {
                    $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] },
                  },
                  closedTickets: {
                    $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
                  },
                  inProgressTickets: {
                    $sum: {
                      $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0],
                    },
                  },
                  resolvedTickets: {
                    $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
                  },
                },
              },
            ]),
          );
          if (!tickets) {
            return createTsRestError(404, "Tickets not found");
          }
          return createTsRestSuccess(200, {
            success: true,
            message: "Tickets fetched successfully",
            data: {
              tickets,
              summary: ticketStats[0] || {},
              pagination: {
                currentPage: Number(page),
                limit: Number(limit),
                total: totalTickets,
                totalPages: Math.ceil(totalTickets / Number(limit)),
                hasMore: (page - 1) * limit + tickets.length < totalTickets,
              },
            },
          });
        }),
      },
      updateTicket: {
        middleware: [
          verifyUser,
          authorizedRoles("super_admin", "admin"),
          validateFormData(UpdateTicketSchema),
        ],
        handler: tryCatchFn(async ({ params, req }) => {
          const { id } = params;
          if (!id) {
            return createTsRestError(400, "Invalid ticket id");
          }
          const ticket = await connectMongoDb(() => Ticket.findById(id).lean());
          if (!ticket) {
            return createTsRestError(404, "Ticket not found");
          }

          const { assignedTo, status } = req.body;

          // Define statuses that require the ticket to be assigned
          const STATUSES_REQUIRING_ASSIGNMENT = new Set([
            "resolved",
            "in-progress",
            "closed",
          ]) as Set<string>;

          // Validate that ticket is assigned when setting certain statuses
          if (
            status &&
            STATUSES_REQUIRING_ASSIGNMENT.has(status) &&
            !ticket.assignedTo
          ) {
            return createTsRestError(
              400,
              `Ticket cannot be set to "${status}" without being assigned to an admin`,
            );
          }

          if (assignedTo) {
            // Ensure only super admin can assign tickets
            if (req.user?.role !== "super_admin") {
              return createTsRestError(
                403,
                "Unauthorized: Only super admins can assign tickets",
              );
            }
            const currentAssigneeId = ticket.assignedTo?.toString();
            // Prevent assignment if already assigned to a different user
            if (currentAssigneeId && currentAssigneeId !== assignedTo) {
              return createTsRestError(
                400,
                "Ticket is already assigned to another user",
              );
            }
            // Validate assignee (only if it's a new assignment)
            if (currentAssigneeId !== assignedTo) {
              const assignee = await connectMongoDb(() =>
                User.findById(assignedTo).select("role").lean(),
              );
              if (!assignee) {
                return createTsRestError(404, "Assignee not found");
              }
              if (assignee.role !== "admin") {
                return createTsRestError(
                  400,
                  "Tickets can only be assigned to admins",
                );
              }
            }
          }
          const updatedTicket = await connectMongoDb(() =>
            Ticket.findByIdAndUpdate(id, req.body, {
              returnDocument: "after",
              runValidators: true,
            })
              .populate("userId", "name email phone")
              .populate("assignedTo", "name email phone")
              .lean(),
          );

          if (!updatedTicket) {
            return createTsRestError(404, "Ticket not found or update failed");
          }
          await invalidateCache("cache:/api/v1/tickets*");
          //send email if user is assigned
          if (updatedTicket.assignedTo) {
            workflowClient
              .trigger({
                url: `${env.serverUrl}/api/v1/workflows/ticket-issue-assigned`,
                body: {
                  user: updatedTicket.assignedTo,
                  ticketId: updatedTicket.ticketId,
                },
              })
              .catch((error: any) => {
                logger.error(
                  "Failed to trigger ticket issue assigned workflow:",
                  error,
                );
              });
          }
          //send mail if ticket status is set to resolved
          if (updatedTicket.status === "resolved") {
            workflowClient
              .trigger({
                url: `${env.serverUrl}/api/v1/workflows/ticket-issue-resolved`,
                body: {
                  user: updatedTicket.userId,
                  ticketId: updatedTicket.ticketId,
                },
              })
              .catch((error: any) => {
                logger.error(
                  "Failed to trigger ticket issue resolved workflow:",
                  error,
                );
              });
          }
          serverEvents.emit("ticket:updated", updatedTicket);
          return createTsRestSuccess(200, {
            success: true,
            message: "Ticket updated successfully",
            data: updatedTicket,
          });
        }),
      },
    },
  });
};
