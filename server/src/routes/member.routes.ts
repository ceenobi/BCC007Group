import { initServer } from "@ts-rest/express";
import { memberContract } from "../contract/member.contract.js";
import { createTsRestSuccess, createTsRestError } from "../lib/tsRestResponse.js";
import tryCatchFn from "../lib/tryCatchFn.js";
import { authorizedRoles, verifyUser } from "../middleware/auth.middleware.js";
import User from "../models/user.js";
import {
  cacheMiddleware,
  invalidateCache,
} from "../middleware/cache.middleware.js";
import { workflowClient } from "../workflows/client.js";
import logger from "../config/logger.js";
import { env } from "../config/keys.js";

import { connectMongoDb } from "../config/db.server.js";

export const getMemberRouter = () => {
  const s = initServer();

  return s.router(memberContract, {
  members: {
    getMembers: {
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
          gender,
          role,
        } = validatedQuery;
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const matchStage = {
          $or: [{ name: { $regex: escapedQuery, $options: "i" } }],
          ...(gender && { gender }),
          ...(role && { role }),
        };

        const members = await connectMongoDb(() => User.find(matchStage)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean());

        const totalMembers = await connectMongoDb(() => User.countDocuments(matchStage));
        if (!members) {
          return createTsRestError(404, "Members not found");
        }
        return createTsRestSuccess(200, {
          success: true,
          message: "Members fetched successfully",
          data: {
            members,
            pagination: {
              currentPage: Number(page),
              limit: Number(limit),
              total: totalMembers,
              totalPages: Math.ceil(totalMembers / Number(limit)),
              hasMore: (page - 1) * limit + members.length < totalMembers,
            },
          },
        });
      }),
    },
    getAMember: {
      middleware: [
        verifyUser,
        authorizedRoles("super_admin", "admin", "member"),
        cacheMiddleware({
          ttl: 3600,
          keyGenerator: (req) => `cache:member:${req.params.id}`,
        }),
      ],
      handler: tryCatchFn(async ({ req }) => {
        const { id } = req.params;
        if (!id) {
          return createTsRestError(400, "id params is required");
        }
        const member = await connectMongoDb(() => User.findById(id).lean());
        if (!member) {
          return createTsRestError(404, "Member not found");
        }
        return createTsRestSuccess(200, {
          success: true,
          message: "Member fetched successfully",
          data: member,
        });
      }),
    },
    assignRole: {
      middleware: [verifyUser, authorizedRoles("super_admin", "admin")],
      handler: tryCatchFn(async ({ req }) => {
        const { id } = req.params;
        const { role } = req.body;
        if (!id) {
          return createTsRestError(400, "id params is required");
        }
        const member = await connectMongoDb(() => User.findById(id));
        if (!member) {
          return createTsRestError(404, "Member not found");
        }
        member.role = role;
        await connectMongoDb(() => member.save());
        await invalidateCache("cache:/api/v1/members*");
        // Trigger workflow for email
        const user = { name: member.name, email: member.email };
        workflowClient
          .trigger({
            url: `${env.serverUrl}/api/v1/workflows/role-assigned`,
            body: {
              user,
              role,
            },
          })
          .catch((error: any) => {
            logger.error("Failed to trigger role assigned workflow:", error);
          });
        return createTsRestSuccess(200, {
          success: true,
          message: "Role assigned successfully",
          data: member.toObject(),
        });
      }),
    },
  },
});
};
