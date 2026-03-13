import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { ErrorSchema, UploadSchema } from "~/lib/dataSchema";

const c = initContract();

export const uploadContract = c.router({
  upload: {
    deleteMedia: {
      method: "DELETE",
      path: "/upload/delete",
      body: z.object({
        publicIds: z.array(z.string()),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          publicIds: z.array(z.string()).optional(),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Delete media from cloudinary",
    },
    uploadMedia: {
      method: "POST",
      path: "/upload/file",
      body: UploadSchema,
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          data: z.array(
            z.object({
              imageUrl: z.string(),
              publicId: z.string(),
            }),
          ),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Upload media to cloudinary",
    },
  },
});

export type UploadContract = typeof uploadContract;
