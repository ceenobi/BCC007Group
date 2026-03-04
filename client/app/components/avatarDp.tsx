import { Loader, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import type { UserData } from "~/lib/dataSchema";

interface SelectedFiles {
  file: File;
  preview?: string | ArrayBuffer | null;
}
interface AvatarDpProps {
  user: UserData;
  selectedFiles: SelectedFiles[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<SelectedFiles[]>>;
  fileRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  handleUpload: () => void;
  handleImageClick: () => void;
  handleFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export default function AvatarDp({
  user,
  selectedFiles,
  setSelectedFiles,
  fileRef,
  isUploading,
  handleUpload,
  handleImageClick,
  handleFiles,
}: AvatarDpProps) {
  return (
    <Card className="bg-white/5 dark:bg-coolBlue/20 shadow rounded-sm">
      <CardContent className="p-4 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Profile picture</h3>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Button
                variant="ghost"
                className="relative h-14 w-14 rounded-full p-0"
                aria-label="Profile menu"
              >
                {user?.image || selectedFiles.length > 0 ? (
                  <img
                    className="h-14 w-14 rounded-full object-cover border-2 border-border"
                    src={
                      selectedFiles.length > 0
                        ? (selectedFiles[0].preview as string)
                        : user?.image
                    }
                    alt={`avatar preview`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center">
                    {user?.name
                      ?.split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </Button>
              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="absolute top-0 right-0 p-1 rounded-full bg-gray-300 text-gray-600 cursor-pointer"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {selectedFiles.length === 0 ? (
              <label htmlFor="avatar">
                <Button
                  onClick={handleImageClick}
                  className="rounded-sm bg-yellow-400 hover:bg-yellow-500 text-black font-bold cursor-pointer"
                >
                  Select image
                </Button>
              </label>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="rounded-sm bg-yellow-400 hover:bg-yellow-500 text-black font-bold cursor-pointer"
                >
                  {isUploading ? "Uploading..." : "Upload image"}{" "}
                </Button>
                {isUploading && (
                  <Loader className="ml-2 animate-spin" size={16} />
                )}
              </div>
            )}
          </div>
          <span className="text-sm mt-1 font-medium text-muted-foreground">
            Max file size: 2MB
          </span>
          <input
            type="file"
            id="avatar"
            accept="image/*"
            className="hidden"
            ref={fileRef}
            onChange={(e) => {
              handleFiles(e);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
