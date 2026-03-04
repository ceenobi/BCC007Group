import { useCallback, useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import AvatarDp from "~/components/avatarDp";
import { useFiles } from "~/hooks/useFile";
import type { UserData } from "~/lib/dataSchema";

export default function ChangeAvatar({ user }: { user: UserData }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { selectedFiles, setSelectedFiles, handleFiles } = useFiles({
    limit: 1,
  });
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      const data = fetcher.data as { success: boolean; message: string };
      if (data.success) {
        toast.success(data.message);
        setSelectedFiles([]);
      } else {
        toast.error(data.message);
      }
    }
  }, [fetcher.data, fetcher.state, setSelectedFiles]);

  const handleImageClick = () => {
    if (fileRef.current) {
      fileRef.current.value = "";
      fileRef.current.click();
    }
  };

  const handleUpload = useCallback(() => {
    if (selectedFiles.length > 0) {
      const formData = {
        image: selectedFiles[0].preview as string,
      };
      fetcher.submit(formData, {
        method: "post",
        action: "/uploads/upload-avatar",
      });
    }
  }, [selectedFiles, fetcher]);

  const isUploading = fetcher.state !== "idle";
  return (
    <AvatarDp
      user={user}
      selectedFiles={selectedFiles}
      setSelectedFiles={setSelectedFiles}
      fileRef={fileRef}
      isUploading={isUploading}
      handleUpload={handleUpload}
      handleImageClick={handleImageClick}
      handleFiles={handleFiles}
    />
  );
}
