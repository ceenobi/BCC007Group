import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { ErrorSchema, UserSchema } from "~/lib/dataSchema";

const MemberResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: UserSchema,
});

const MembersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    members: z.array(UserSchema),
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

export const memberContract = c.router({
  members: {
    getMembers: {
      method: "GET",
      path: "/api/v1/members/get",
      query: z.object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        query: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        role: z.enum(["member", "admin", "super_admin"]).optional(),
      }),
      responses: {
        200: MembersResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Get members",
    },
    getAMember: {
      method: "GET",
      path: "/api/v1/members/get/:id",
      pathParams: z.object({
        id: z.any(),
      }),
      responses: {
        200: MemberResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Get a member",
    },
    assignRole: {
      method: "PATCH",
      path: "/api/v1/members/:id/assign-role",
      pathParams: z.object({
        id: z.any(),
      }),
      body: z.object({
        role: z.enum(["member", "admin", "super_admin"]),
      }),
      responses: {
        200: MemberResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Assign a role to a member",
    },
  },
});

export type MemberContract = typeof memberContract;
