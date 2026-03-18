import { Loader, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useFetcher, Form } from "react-router";
import Modal from "~/components/modal";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { SignUpSchema, type SignupFormData } from "~/lib/dataSchema";
import { getQueryClient } from "~/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { authFields } from "~/lib/constants";
import FormBox from "~/components/formBox";
import ActionButton from "~/components/actionButton";
import { toast } from "sonner";

export default function AddNew() {
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();
  const queryClient = getQueryClient();
  const form = useForm<SignupFormData>({
    resolver: zodResolver(SignUpSchema) as any,
    defaultValues: {
      name: "",
      email: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 201) {
      toast.success(
        fetcher.data?.body?.message || "New member addded successfully",
      );
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setIsOpen(false);
    } else if (fetcher.data && fetcher.data?.status !== 201) {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
    }
  }, [fetcher.data, form]);

  const filterFields = authFields.filter((field) =>
    ["name", "email"].includes(field.name),
  );
  const isSubmitting = fetcher.state === "submitting";

  const handleClose = () => {
    form.reset();
    setIsOpen(false);
  };

  const onSubmit = (data: SignupFormData) => {
    fetcher.submit(data, {
      method: "post",
      action: "/members",
    });
  };

  return (
    <>
      <Button
        size="icon-sm"
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white rounded-full cursor-pointer"
      >
        <Plus />
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-4 text-gray-900 dark:text-white">
          <h1 className="text-xl font-bold">Add Member</h1>
          <p className="text-muted-foreground">Add a new member to your team</p>
        </div>
        <Separator />
        <div className="p-4">
          <Form onSubmit={form.handleSubmit(onSubmit)} id="memberForm">
            <FormBox form={form} data={filterFields} classname="mb-4 w-full" />
          </Form>
          <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-4">
            <ActionButton
              type="button"
              text="Cancel"
              classname="w-full sm:w-auto text-xs font-medium py-4 border-blue-500 text-blue-500 hover:text-blue-500"
              onClick={handleClose}
              variant="outline"
            />
            <ActionButton
              text="Add Member"
              type="submit"
              form="memberForm"
              classname="w-full sm:w-auto py-4 bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
              disabled={isSubmitting}
              loading={isSubmitting}
              children={<Loader className="animate-spin" />}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
