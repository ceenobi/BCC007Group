import { ImageUp, Loader, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { getQueryClient } from "~/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateEventSchema,
  type CreateEventData,
  type UserData,
} from "~/lib/dataSchema";
import { authFields, eventTypes } from "~/lib/constants";
import { useFiles } from "~/hooks/useFile";
import Modal from "~/components/modal";
import { Separator } from "~/components/ui/separator";
import FormBox from "~/components/formBox";
import ActionButton from "~/components/actionButton";
import { toast } from "sonner";

export default function CreateEvent({ members }: { members: UserData[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();
  const queryClient = getQueryClient();
  const form = useForm<CreateEventData>({
    resolver: zodResolver(CreateEventSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      location: "",
      date: new Date() as any,
      time: new Date().toTimeString().slice(0, 5),
      eventType: "" as any,
      organizer: [],
      isPublic: true,
      fees: 0,
      featuredImage: "",
      featuredImageId: "",
    },
    mode: "onBlur",
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const { selectedFiles, setSelectedFiles, handleFiles } = useFiles({
    limit: 1,
  });
  const membersList = useMemo(() => {
    if (!Array.isArray(members)) return [];
    return members.map((member: any) => ({
      name: member?.name || "Unknown",
      id: member?.id?.toString() || "",
    }));
  }, [members]);

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 201) {
      toast.success(fetcher.data?.body?.message || "Event added successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsOpen(false);
    } else if (fetcher.data && fetcher.data?.status !== 201) {
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
    setSelectedFiles([]);
    setIsOpen(false);
  };

  const onSubmit = (data: CreateEventData) => {
    if (new Date(data.date) < new Date()) {
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
      method: "post",
      action: "/events",
    });
  };

  return (
    <>
      <Button
        size="icon"
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white rounded-full cursor-pointer"
      >
        <Plus />
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Create Event
          </h1>
        </div>
        <Separator />
        <div className="p-4  max-h-[60vh] overflow-y-auto">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            id="eventForm"
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
              {selectedFiles.length > 0 ? (
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
            text="Create"
            type="submit"
            form="eventForm"
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
