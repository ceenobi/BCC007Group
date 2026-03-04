import { PageSection } from "~/components/pageWrapper";
import { Card } from "~/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetcher } from "react-router";
import { z } from "zod";
import { authFields } from "~/lib/constants";
import { useEffect, useState } from "react";
import FormBox from "~/components/formBox";
import ActionButton from "~/components/actionButton";
import { Loader } from "lucide-react";
import { ChangePasswordSchema } from "~/lib/dataSchema";
import { toast } from "sonner";
import { getQueryClient } from "~/lib/queryClient";

export default function ChangePassword() {
  const [isVisible, setIsVisible] = useState(false);
  const fetcher = useFetcher();
  const queryClient = getQueryClient();
  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      newPassword: "",
      currentPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success("Password changed successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error("Failed to change password!");
    }
  }, [fetcher.data, form]);

  const filterFields = authFields.filter((field) =>
    ["newPassword", "currentPassword"].includes(field.name),
  );
  const isSubmitting = fetcher.state === "submitting";
  const toggleVisibility = () => setIsVisible?.((prev) => !prev);

  const onSubmit = (data: z.infer<typeof ChangePasswordSchema>) => {
    fetcher.submit(data, {
      method: "post",
      action: "/settings?type=password",
    });
  };

  return (
    <PageSection index={7}>
      <Card
        className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-0 transition-all duration-300 ease-in-out"
        style={{ animationDelay: "100ms" }}
      >
        <div className="bg-slate-50 dark:bg-lightBlue/20 p-4 border-b">
          <h1 className="font-semibold text-lg">Change Password</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 py-6">
          <form onSubmit={form.handleSubmit(onSubmit)} id="changePasswordForm">
            <FormBox
              form={form}
              toggleVisibility={toggleVisibility}
              isVisible={isVisible}
              data={filterFields}
              classname="mb-4 w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              You will be logged out of all sessions after changing your
              password.
            </p>
            <ActionButton
              text="Change Password"
              type="submit"
              form="changePasswordForm"
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
