import { Info, Loader, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import ActionButton from "~/components/actionButton";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { getQueryClient } from "~/lib/queryClient";

export default function BatchDelete({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (selected: string[]) => void;
}) {
  const fetcher = useFetcher();
  const queryClient = getQueryClient();
  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data?.status === 200) {
        toast.success(
          fetcher.data?.body?.message || "Delete operation successful",
        );
        queryClient.invalidateQueries({ queryKey: ["events"] });
        setSelected([]);
      } else {
        toast.error(fetcher.data?.body?.message || "Something went wrong");
      }
    }
  }, [fetcher.data]);

  const submitAction = () => {
    fetcher.submit(
      { ids: JSON.stringify(selected) },
      {
        method: "delete",
        action: "/events?type=batchDelete",
      },
    );
  };

  return (
    <>
      <Alert className="alertBox">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={24} className="text-red-500" />
            <AlertTitle>
              {selected.length} events marked for deletion, This action cannot
              be undone
            </AlertTitle>
          </div>
          <ActionButton
            type="button"
            text="Delete"
            loading={isSubmitting}
            children={<Loader className="animate-spin" />}
            classname="rounded-sm cursor-pointer bg-red-500 hover:bg-red-600 dark:text-white"
            disabled={isSubmitting}
            onClick={submitAction}
          />
        </div>
      </Alert>
    </>
  );
}
