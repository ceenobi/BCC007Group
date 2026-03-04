import { Loader, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import ActionButton from "~/components/actionButton";
import Modal from "~/components/modal";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import type { EventData } from "~/lib/dataSchema";
import { getQueryClient } from "~/lib/queryClient";

export default function DeleteEvent({
  item,
  selected,
}: {
  item: EventData;
  selected?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();
  const queryClient = getQueryClient();
  const isSubmitPending =
    fetcher.state === "submitting" &&
    fetcher.formAction !== `/events?type=delete`;

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data?.status === 200) {
        setIsOpen(false);
        toast.success(
          fetcher.data?.body?.message || "Delete operation successful",
        );
        queryClient.invalidateQueries({ queryKey: ["events"] });
      } else {
        toast.error(fetcher.data?.body?.message || "Something went wrong");
      }
    }
  }, [fetcher.data]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        disabled={isSubmitPending || selected?.some((id) => id === item._id)}
        className="cursor-pointer text-red-500"
      >
        <Trash2 />
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="py-4">
          <div className="flex flex-col items-center w-full">
            <Trash2 size={20} className="text-red-500" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Confirm Delete
            </h1>
            <p className="text-center text-muted-foreground">
              Are you sure you want to delete this event?
            </p>
            <p className="font-semibold text-center text-gray-900 dark:text-muted-foreground">
              {item.title}
            </p>
          </div>
          <Separator className="my-4" />
          <div className="px-4 mt-4 flex gap-4 justify-center">
            <ActionButton
              type="button"
              text="Cancel"
              classname="w-fit sm:w-auto text-xs font-medium py-4 border-blue-500 text-blue-500 hover:text-blue-500"
              onClick={() => setIsOpen(false)}
              variant="outline"
            />
            <ActionButton
              type="button"
              text="Delete"
              loading={fetcher.state === "submitting"}
              children={<Loader className="animate-spin" />}
              classname="w-fit sm:w-auto py-4 bg-red-500 hover:bg-red-600 text-white hover:text-white"
              onClick={() => {
                fetcher.submit(
                  { id: item._id },
                  {
                    method: "delete",
                    action: "/events?type=delete",
                  },
                );
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
