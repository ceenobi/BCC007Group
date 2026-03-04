import { type ActionFunctionArgs, data } from "react-router";
import { updateAvatar } from "~/lib/actions/auth.action";
import { uploadMedia } from "~/lib/actions/upload.action";

export async function action({ request }: ActionFunctionArgs) {
  const cookie = request.headers.get("Cookie") || "";
  const formData = await request.formData();
  const image = formData.get("image") as string;
  if (!image) {
    return data(
      { success: false, message: "No image provided" },
      { status: 400 },
    );
  }

  // 1. Upload to Cloudinary
  const uploadResponse = await uploadMedia({
    validated: {
      files: [image],
      folder: "BCCOO7Pay/avatars",
    },
    cookie,
  });

  if (uploadResponse.status !== 200) {
    return data(
      {
        success: false,
        message: uploadResponse.body.message || "Upload failed",
      },
      { status: 400 },
    );
  }

  const uploadedImage = uploadResponse.body.data[0];

  // 2. Update user profile
  const updateResponse = await updateAvatar({
    validated: {
      image: uploadedImage.imageUrl,
      imageId: uploadedImage.publicId,
    },
    cookie,
  });

  if (updateResponse.status !== 200) {
    return data(
      {
        success: false,
        message: updateResponse.body.message || "Failed to update user avatar",
      },
      { status: 400 },
    );
  }

  return data({
    success: true,
    message: "Avatar updated successfully",
    imageUrl: uploadedImage.imageUrl,
  });
}
