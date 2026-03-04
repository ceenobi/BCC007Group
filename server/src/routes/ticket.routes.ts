import { initServer } from "@ts-rest/express";
import { ticketContract } from "~/contract/ticket.contract";
import { createTsRestSuccess, createTsRestError } from "~/lib/tsRestResponse";
import tryCatchFn from "~/lib/tryCatchFn";
import { authorizedRoles, verifyUser } from "~/middleware/auth.middleware";
import Ticket from "~/models/ticket";
import User from "~/models/user";
import {
  cacheMiddleware,
  invalidateCache,
} from "~/middleware/cache.middleware";
import { validateFormData } from "~/middleware/formValidate";
import { customRateLimiter } from "~/middleware/rateLimit.middleware";
import { CreateTicketSchema, UpdateTicketSchema } from "~/lib/dataSchema";
import { generateTicketId } from "~/lib/options";
import { workflowClient } from "~/workflows/client";
import { env } from "~/config/keys";
import { serverEvents } from "~/lib/events";
import logger from "~/config/logger";

const s = initServer();

export const ticketRouter = s.router(ticketContract, {
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
        const ticket = await Ticket.create({
          title,
          description,
          category,
          priority,
          userId: req.user?.id,
          ticketId: generateTicketId(),
        });
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
        const tickets = await Ticket.find(matchStage)
          .populate("userId", "name email phone")
          .populate("assignedTo", "name email phone")
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean();
        const totalTickets = await Ticket.countDocuments(matchStage);
        //ticket stats
        const ticketStats = await Ticket.aggregate([
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
                $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
              },
              resolvedTickets: {
                $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
              },
            },
          },
        ]);
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
        const ticket = await Ticket.findById(id).lean();
        if (!ticket) {
          return createTsRestError(404, "Ticket not found");
        }
        //throw error if ticket status is resolved but has not been assigned
        if (ticket.status === "resolved" && !ticket.assignedTo) {
          return createTsRestError(
            400,
            "Ticket cannot be resolved without being assigned",
          );
        }
        const { assignedTo } = req.body;

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
            const assignee = await User.findById(assignedTo)
              .select("role")
              .lean();
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
        const updatedTicket = await Ticket.findByIdAndUpdate(id, req.body, {
          returnDocument: "after",
          runValidators: true,
        })
          .populate("userId", "name email phone")
          .populate("assignedTo", "name email phone")
          .lean();

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
