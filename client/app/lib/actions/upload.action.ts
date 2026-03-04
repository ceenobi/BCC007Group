import { apiClient } from "../apiClient";
import type { DeleteMediaData, UploadFormData } from "../dataSchema";

export async function uploadMedia({
  validated,
  cookie,
}: {
  validated: UploadFormData;
  cookie: string;
}) {
  return await (apiClient.upload.uploadMedia as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export const deleteMedia = async ({
  validated,
  cookie,
}: {
  validated: DeleteMediaData;
  cookie: string;
}) => {
  return await (apiClient.upload.deleteMedia as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};
