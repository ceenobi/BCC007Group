import { useCallback, useEffect, useRef, useState } from "react";
import { useFiles } from "~/hooks/useFile";
import { toast } from "sonner";
import type { UserData } from "~/lib/dataSchema";
import { PageSection } from "~/components/pageWrapper";
import { useFetcher, type URLSearchParamsInit } from "react-router";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Checkbox } from "~/components/ui/checkbox";
import ActionButton from "~/components/actionButton";
import AvatarDp from "~/components/avatarDp";

export default function UploadAvatar({
  user,
  setSearchParams,
}: {
  user: UserData;
  setSearchParams: (searchParams: URLSearchParamsInit) => void;
}) {
  const [isChecked] = useState(!!(user?.image && user.image.length > 0));
  const fileRef = useRef<HTMLInputElement>(null);
  const { selectedFiles, setSelectedFiles, handleFiles } = useFiles({
    limit: 1,
  });
  const fetcher = useFetcher();
  const step = "1";

  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      const data = fetcher.data as { success: boolean; message: string };
      if (data.success && step === "1") {
        toast.success(data.message);
        setSelectedFiles([]);
        setSearchParams({ step: "2" });
      } else {
        toast.error(data.message);
      }
    }
  }, [fetcher.data, fetcher.state, setSelectedFiles, setSearchParams]);

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

  const goNext = () => {
    setSearchParams({ step: "2" });
  };

  return (
    <PageSection index={1}>
      <div className="space-y-4">
        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox id="profile" name="profile" defaultChecked={isChecked} />
            <FieldLabel htmlFor="profile" className="text-muted-foreground">
              Firstly, set up your profile image
            </FieldLabel>
          </Field>
        </FieldGroup>
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
        <div className="flex justify-end">
          <ActionButton
            text={"Continue"}
            type="button"
            onClick={goNext}
            classname="btnBlue"
          />
        </div>
      </div>
    </PageSection>
  );
}
