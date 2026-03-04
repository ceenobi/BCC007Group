import { initServer } from "@ts-rest/express";
import { uploadContract } from "~/contract/upload.contract";
import { createTsRestSuccess, createTsRestError } from "~/lib/tsRestResponse";
import tryCatchFn from "~/lib/tryCatchFn";
import { validateFormData } from "~/middleware/formValidate";
import { customRateLimiter } from "~/middleware/rateLimit.middleware";
import { authorizedRoles, verifyUser } from "~/middleware/auth.middleware";
import { UploadSchema } from "~/lib/dataSchema";
import { deleteFromCloudinary, uploadToCloudinary } from "~/config/upload";

const s = initServer();

export const uploadRouter = s.router(uploadContract, {
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
