import { PageSection } from "~/components/pageWrapper";
import { Card } from "~/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetcher } from "react-router";
import { z } from "zod";
import { authFields } from "~/lib/constants";
import { useEffect } from "react";
import FormBox from "~/components/formBox";
import ActionButton from "~/components/actionButton";
import { Loader } from "lucide-react";
import { ChangeEmailSchema } from "~/lib/dataSchema";
import { toast } from "sonner";

export default function ChangeEmail() {
  const fetcher = useFetcher();
  const form = useForm<z.infer<typeof ChangeEmailSchema>>({
    resolver: zodResolver(ChangeEmailSchema),
    defaultValues: {
      newEmail: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success("Instruction sent to your email");
      form.reset();
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error("Failed to change email!");
    }
  }, [fetcher.data, form]);

  const filterFields = authFields.filter((field) =>
    ["newEmail"].includes(field.name),
  );
  const isSubmitting = fetcher.state === "submitting";

  const onSubmit = (data: z.infer<typeof ChangeEmailSchema>) => {
    fetcher.submit(data, {
      method: "post",
      action: "/settings?type=email",
    });
  };

  return (
    <PageSection index={7}>
      <Card
        className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-0 transition-all duration-300 ease-in-out"
        style={{ animationDelay: "100ms" }}
      >
        <div className="bg-slate-50 dark:bg-lightBlue/20 p-4 border-b">
          <h1 className="font-semibold text-lg">Change Email</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 py-6">
          <form onSubmit={form.handleSubmit(onSubmit)} id="changeEmailForm">
            <FormBox form={form} data={filterFields} classname="mb-4 w-full" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              You will receive an email with a link to verify your new email
              address.
            </p>
            <ActionButton
              text="Change Email"
              type="submit"
              form="changeEmailForm"
              classname="btnBlue"
              disabled={isSubmitting}
              loading={isSubmitting}
              children={<Loader className="animate-spin" />}
            />
          </form>
        </div>
      </Card>
    </PageSection>
  );
}
