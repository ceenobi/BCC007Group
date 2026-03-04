import { ImageUp, Loader, SquarePen, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "~/components/modal";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  UpdateEventSchema,
  type EventData,
  type UpdateEventData,
} from "~/lib/dataSchema";
import { getQueryClient } from "~/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UserData } from "~/lib/dataSchema";
import { useFetcher } from "react-router";
import { authFields, eventTypes } from "~/lib/constants";
import { useFiles } from "~/hooks/useFile";
import FormBox from "~/components/formBox";
import ImageComponent from "~/components/imageComponent";
import ActionButton from "~/components/actionButton";
import { toast } from "sonner";

export default function EditEvent({
  item,
  members,
}: {
  item: EventData;
  members: UserData[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const fetcher = useFetcher();
  const queryClient = getQueryClient();
  const membersList = useMemo(() => {
    if (!Array.isArray(members)) return [];
    return members?.map((member: any) => ({
      name: member?.name || "Unknown",
      id: member?.id?.toString() || "",
    }));
  }, [members]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { selectedFiles, setSelectedFiles, handleFiles } = useFiles({
    limit: 1,
  });
  const form = useForm<UpdateEventData>({
    resolver: zodResolver(UpdateEventSchema) as any,
    defaultValues: {
      title: item?.title || "",
      description: item?.description || "",
      location: item?.location || "",
      date: (item?.date
        ? new Date(item.date).toISOString().split("T")[0]
        : "") as any,
      time: item?.time || "",
      eventType: item?.eventType as any,
      organizer: item?.organizer.map((member: any) => member._id) || [],
      isPublic: item?.isPublic || true,
      fees: item?.fees || 0,
      featuredImage: item?.featuredImage || "",
      featuredImageId: item?.featuredImageId || "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success(
        fetcher.data?.body?.message || "Event updated successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["events"] });
      form.reset();
      setIsOpen(false);
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
    }
  }, [fetcher.data, form]);

  const filterFields = authFields.filter((field) =>
    [
      "title",
      "description",
      "date",
      "time",
      "location",
      "eventType",
      "organizer",
      "isPublic",
      "fees",
    ].includes(field.name),
  );
  const isSubmitting = fetcher.state === "submitting";

  const handleClose = () => {
    form.reset();
    setShowFile(false);
    setSelectedFiles([]);
    setIsOpen(false);
  };

  const onSubmit = (data: UpdateEventData) => {
    if (new Date(data.date || "") < new Date()) {
      toast.error("Event date cannot be set for today or in the past");
      return;
    }
    const formData = {
      ...data,
      featuredImage:
        selectedFiles.length > 0
          ? (selectedFiles[0].preview as string)
          : data.featuredImage,
    };
    fetcher.submit(formData as any, {
      method: "patch",
      action: `/events?id=${item._id}`,
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer text-blue-500"
      >
        <SquarePen />
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Event
          </h1>
        </div>
        <Separator />
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            id="eventFormUpdate"
            className="space-y-4"
          >
            <FormBox
              form={form}
              data={filterFields}
              getCommandData={membersList}
              getSelectData={eventTypes}
              classname="mb-4 w-full"
            />
            <div>
              <p className="text-gray-800 dark:text-muted-foreground font-medium mb-2">
                Attach a featured image (optional)
              </p>
              {item?.featuredImage && !showFile ? (
                <div className="mb-8">
                  <div className="relative aspect-square w-full h-[250px]">
                    <ImageComponent
                      cellValue={item.featuredImage}
                      alt={item.title}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFile(true)}
                    className="mt-2 rounded-sm cursor-pointer"
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <>
                  {selectedFiles.length > 0 && showFile ? (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div className="relative group border rounded-md p-1">
                          <img
                            src={file.preview as string}
                            alt="event image"
                            className="w-full h-32 object-cover rounded"
                            referrerPolicy="no-referrer"
                            loading="eager"
                          />
                          <p
                            className="xl:hidden text-xs text-center cursor-pointer"
                            onClick={() =>
                              setSelectedFiles(
                                selectedFiles.filter((_, i) => i !== index),
                              )
                            }
                          >
                            remove
                          </p>
                          <button
                            onClick={() =>
                              setSelectedFiles(
                                selectedFiles.filter((_, i) => i !== index),
                              )
                            }
                            className="xl:block hidden cursor-pointer absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="featuredImage"
                        className="border-2 border-dashed rounded-md h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:dark:bg-mainDark/40"
                      >
                        <ImageUp size={24} className="text-lightPurple" />
                        <span className="text-xs mt-1 font-medium">
                          Add Image (1 max) 2MB
                        </span>
                        <input
                          type="file"
                          id="featuredImage"
                          accept="image/*"
                          className="hidden"
                          ref={fileRef}
                          onChange={(e) => {
                            handleFiles(e);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>
          </form>
        </div>
        <Separator />
        <div className="p-4 flex flex-col-reverse sm:flex-row justify-end items-center gap-4">
          <ActionButton
            type="button"
            text="Cancel"
            classname="w-full sm:w-auto text-xs font-medium py-4 border-blue-500 text-blue-500 hover:text-blue-500"
            onClick={handleClose}
            variant="outline"
          />
          <ActionButton
            text="Update"
            type="submit"
            form="eventFormUpdate"
            classname="w-full sm:w-auto bg-blue-500 py-4 hover:bg-blue-600 text-white hover:text-white"
            disabled={isSubmitting}
            loading={isSubmitting}
            children={<Loader className="animate-spin" />}
          />
        </div>
      </Modal>
    </>
  );
}
