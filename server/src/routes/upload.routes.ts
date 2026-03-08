import { initServer } from "@ts-rest/express";
import { uploadContract } from "../contract/upload.contract.js";
import { createTsRestSuccess, createTsRestError } from "../lib/tsRestResponse.js";
import tryCatchFn from "../lib/tryCatchFn.js";
import { validateFormData } from "../middleware/formValidate.js";
import { customRateLimiter } from "../middleware/rateLimit.middleware.js";
import { authorizedRoles, verifyUser } from "../middleware/auth.middleware.js";
import { UploadSchema } from "../lib/dataSchema.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/upload.js";

export const getUploadRouter = () => {
  const s = initServer();

  return s.router(uploadContract, {
  upload: {
    deleteMedia: {
      middleware: [
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
      ],
      handler: tryCatchFn(async ({ body }) => {
        const { publicIds } = body;
        await Promise.all(
          publicIds.map((id: string) => deleteFromCloudinary(id)),
        );
        return createTsRestSuccess(200, {
          success: true,
          message: "Media deleted successfully",
          publicIds,
        });
      }),
    },
    uploadMedia: {
      middleware: [
        customRateLimiter(10),
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
        validateFormData(UploadSchema),
      ],
      handler: tryCatchFn(async ({ req }) => {
        const { files, folder } = req.body;
        if (!files || files.length === 0) {
          return createTsRestError(400, "No files uploaded");
        }
        const uploadedFiles = await Promise.all(
          files.map((file: string) =>
            uploadToCloudinary(file, {
              folder,
            }),
          ),
        );
        return createTsRestSuccess(200, {
          success: true,
          message: "Files uploaded successfully",
          data: uploadedFiles,
        });
      }),
    },
  },
});
};
