import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, useFetcher } from "react-router";
import { toast } from "sonner";
import ActionButton from "~/components/actionButton";
import FormBox from "~/components/formBox";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { ticketFields } from "~/lib/constants";
import { CreateTicketSchema, type TicketData } from "~/lib/dataSchema";
import { getQueryClient } from "~/lib/queryClient";

export default function NewTicket({
  autoOpen = false,
  onOpenChange,
}: {
  autoOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(autoOpen);
  const fetcher = useFetcher();
  const queryClient = getQueryClient();
  const form = useForm<TicketData>({
    resolver: zodResolver(CreateTicketSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      priority: undefined,
      category: undefined,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen]);

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 201) {
      toast.success(
        fetcher.data?.body?.message || "Ticket created successfully",
      );
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setOpen(false);
    } else if (fetcher.data && fetcher.data?.status !== 201) {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
    }
  }, [fetcher.data, form]);

  const isSubmitting = fetcher.state === "submitting";

  const handleOpenChange = (newOpen: boolean) => {
    form.reset();
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const onSubmit = (data: TicketData) => {
    fetcher.submit(data as any, {
      method: "post",
      action: "/help-desk",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon-sm"
          className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white rounded-full cursor-pointer"
        >
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-sm p-0 dark:bg-deepBlue ">
        <DialogHeader>
          <DialogTitle className="p-4 font-semibold text-gray-900 dark:text-white">
            Create Support Ticket
          </DialogTitle>
          <Separator />
        </DialogHeader>
        <Form
          onSubmit={form.handleSubmit(onSubmit)}
          id="ticketForm"
          className="p-4"
        >
          <FormBox form={form} data={ticketFields} classname="mb-4 w-full" />
        </Form>
        <Separator />
        <div className="p-4 flex flex-col-reverse sm:flex-row justify-end items-center gap-4">
          <ActionButton
            type="button"
            text="Cancel"
            classname="w-full sm:w-auto text-xs font-medium py-4 border-blue-500 text-blue-500 hover:text-blue-500"
            onClick={() => handleOpenChange(false)}
            variant="outline"
          />
          <ActionButton
            text="Create ticket"
            type="submit"
            form="ticketForm"
            classname="w-full sm:w-auto bg-blue-500 py-4 hover:bg-blue-600 text-white hover:text-white"
            disabled={isSubmitting}
            loading={isSubmitting}
            children={<Loader className="animate-spin" />}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
