import { useEffect } from "react";
import { Form, useFetcher } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  ForgotPasswordSchema,
  type ForgotPasswordData,
} from "~/lib/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { authFields } from "~/lib/constants";
import FormBox from "~/components/formBox";
import { toast } from "sonner";
import ActionButton from "~/components/actionButton";
import { AlertCircleIcon, Loader } from "lucide-react";
import type { Route } from "./+types/verify-email";
import { resendEmailVerification } from "~/lib/actions/auth.action";
import { Alert, AlertTitle } from "~/components/ui/alert";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verify email" },
    { name: "description", content: `Verify email` },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as Record<string, string>;
  const response = await resendEmailVerification({
    validated: ForgotPasswordSchema.parse(data),
  });
  return response;
}

export default function VerifyEmail() {
  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success(
        fetcher.data?.body?.message ||
          "Email verification link has been sent to your email",
      );
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
    }
  }, [fetcher.data]);

  const isSubmitting = fetcher.state === "submitting";

  const filterFields = authFields.filter((field) =>
    ["email"].includes(field.name),
  );

  const onSubmit: SubmitHandler<ForgotPasswordData> = async (data) => {
    fetcher.submit(data, {
      method: "post",
      action: `/account/verify-email`,
    });
  };

  return (
    <div className="space-y-2 w-full max-w-[400px] mx-auto">
      <h1 className="uppercase text-2xl font-bold tracking-tight">
        Verify email
      </h1>
      <p className="text-muted-foreground">
        Enter your email address associated with your account. We'll send you a
        link to verify your email.
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
        <FormBox form={form} data={filterFields} classname="mb-4 w-full" />
        <ActionButton
          text={"Send Verification Link"}
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
