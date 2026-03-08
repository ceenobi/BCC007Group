import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { DeleteMediaSchema, ErrorSchema, UploadSchema } from "../lib/dataSchema.js";

const c = initContract();

export const uploadContract = c.router({
  upload: {
    deleteMedia: {
      method: "DELETE",
      path: "/api/upload/delete",
      body: DeleteMediaSchema,
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
      path: "/api/upload/file",
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
