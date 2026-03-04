import { resetPassword } from "~/lib/actions/auth.action";
import type { Route } from "./+types/reset-password";
import { ResetPasswordSchema, type ResetPasswordData } from "~/lib/dataSchema";
import { useEffect, useState } from "react";
import { useSearchParams, useFetcher, useNavigate, Form } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authFields } from "~/lib/constants";
import { Loader, AlertCircleIcon } from "lucide-react";
import FormBox from "~/components/formBox";
import ActionButton from "~/components/actionButton";
import { Alert, AlertTitle } from "~/components/ui/alert";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Reset Password" },
    { name: "description", content: "Reset Password" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as Record<string, string>;
  const response = await resetPassword({
    validated: ResetPasswordSchema.parse(data),
    token: token as string,
  });
  return response;
}

export default function ResetPassword() {
  const [isVisible, setIsVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { newPassword: "" },
    mode: "onBlur",
  });
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const isSubmitting = fetcher.state === "submitting";
  const toggleVisibility = () => setIsVisible?.((prev) => !prev);

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success(
        "Your password has been reset successfully. Please login to continue",
      );
      navigate("/account/login");
      form.reset();
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
    }
  }, [fetcher.data]);

  const filterFields = authFields.filter(
    (field) => field.name === "newPassword",
  );

  const onSubmit: SubmitHandler<ResetPasswordData> = async (data) => {
    if (!token) {
      toast.error("Token not provided", {
        id: "passwordReset",
      });
      return;
    }
    fetcher.submit(data, {
      method: "post",
      action: `/account/reset-password?token=${token}`,
    });
  };

  return (
    <div className="space-y-2 w-full max-w-[400px] mx-auto">
      <h1 className="uppercase text-2xl font-bold tracking-tight">
        Reset password
      </h1>
      <p className="text-muted-foreground">
        Enter your new password to reset your password
      </p>
      {fetcher.data?.status !== 200 && fetcher.data?.body?.message && (
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50"
        >
          <AlertCircleIcon />
          <AlertTitle>{fetcher.data?.body?.message}</AlertTitle>
        </Alert>
      )}
      <Form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
        <FormBox
          form={form}
          toggleVisibility={toggleVisibility}
          isVisible={isVisible}
          data={filterFields}
          classname="mb-4 w-full"
        />
        <ActionButton
          text={"Reset Password"}
          type="submit"
          loading={isSubmitting}
          size="lg"
          children={<Loader className="animate-spin" />}
          classname="w-full font-medium uppercase bg-lightBlue py-4 hover:bg-coolBlue dark:bg-velvet dark:text-white"
        />
      </Form>
    </div>
  );
}
