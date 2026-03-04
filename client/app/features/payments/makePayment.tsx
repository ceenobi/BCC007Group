import { Button } from "~/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import Modal from "~/components/modal";
import { Separator } from "~/components/ui/separator";
import {
  initializePaymentSchema,
  type EventData,
  type InitializePaymentData,
} from "~/lib/dataSchema";
import { Form, useFetcher, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authFields } from "~/lib/constants";
import FormBox from "~/components/formBox";
import ActionButton from "~/components/actionButton";
import { Loader } from "lucide-react";
import { toast } from "sonner";

export default function MakePayment({ events }: { events: EventData[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const openPaymentModal = searchParams.get("action") === "makePayment";
  const fetcher = useFetcher();
  const form = useForm<InitializePaymentData>({
    resolver: zodResolver(initializePaymentSchema) as any,
    defaultValues: {
      amount: 0,
      paymentType: "donation",
      eventId: "",
      note: "",
      isRecurring: false,
    },
    mode: "onBlur",
  });
  const eventList = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.map((event: any) => ({
      name: event?.title,
      id: event?._id,
    }));
  }, [events]);

  useEffect(() => {
    if (form.watch("paymentType") === "membership_dues") {
      form.setValue("amount", 2000);
      form.setValue(
        "note",
        `Membership Dues - ${new Date().toLocaleString("default", {
          month: "long",
        })} ${new Date().getFullYear()}`,
      );
    } else {
      form.setValue("amount", 2000);
      form.setValue("note", "");
    }
  }, [form.watch("paymentType")]);

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.status === 200) {
      if (fetcher.data?.body?.data?.authorization_url) {
        toast.success("Redirecting to payment portal...");
        window.location.href = fetcher.data.body.data.authorization_url;
      }
    } else {
      toast.error(
        fetcher.data?.body?.message ||
          "Something went wrong! Please try again.",
      );
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (openPaymentModal) {
      setIsOpen(true);
    }
  }, [openPaymentModal]);

  const filterFields = authFields.filter((field) => {
    if (form.watch("paymentType") === "event") {
      return ["amount", "paymentType", "eventId", "note"].includes(field.name);
    }
    if (form.watch("paymentType") === "donation") {
      return ["amount", "paymentType", "note"].includes(field.name);
    }
    return ["amount", "paymentType", "note", "isRecurring"].includes(
      field.name,
    );
  });
  const isSubmitting = fetcher.state === "submitting";

  const handleClose = () => {
    form.reset();
    setIsOpen(false);
  };

  const onSubmit = (data: InitializePaymentData) => {
    fetcher.submit(data, {
      method: "post",
      action: "/payments",
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="rounded-sm bg-blue-500 hover:bg-blue-600 text-white hover:text-white cursor-pointer"
      >
        New Payment
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Make a payment
          </h1>
        </div>
        <Separator />
        <div className="p-4">
          <Form onSubmit={form.handleSubmit(onSubmit)} id="memberForm">
            <FormBox
              form={form}
              data={filterFields}
              getSelectData={eventList}
              disabledMap={{
                amount: form.watch("paymentType") === "membership_dues",
              }}
              classname="mb-4 w-full"
            />
          </Form>
        </div>
        <Separator />
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-4 p-4">
          <ActionButton
            type="button"
            text="Cancel"
            classname="w-full sm:w-auto text-xs font-medium py-4 border-blue-500 text-blue-500 hover:text-blue-500"
            onClick={handleClose}
            variant="outline"
          />
          <ActionButton
            text="Proceed to Pay"
            type="submit"
            form="memberForm"
            classname="w-full sm:w-auto py-4 bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
            disabled={isSubmitting}
            loading={isSubmitting}
            children={<Loader className="animate-spin" />}
          />
        </div>
      </Modal>
    </>
  );
}
