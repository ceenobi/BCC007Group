import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFetcher, Form, Link, useNavigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { SignInSchema, type SigninFormData } from "~/lib/dataSchema";
import { authFields } from "~/lib/constants";
import ActionButton from "~/components/actionButton";
import { AlertCircleIcon, Loader } from "lucide-react";
import FormBox from "~/components/formBox";
import { signInWithEmail } from "~/lib/actions/auth.action";
import type { Route } from "./+types/login";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as Record<string, string>;
  const response = await signInWithEmail({
    validated: SignInSchema.parse(data),
    origin: window.location.origin,
  });
  return response;
}

export default function Login() {
  const [isVisible, setIsVisible] = useState(false);
  const form = useForm<SigninFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });
  const fetcher = useFetcher();
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success("Login successful, redirecting...");
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
      if (fetcher.data.body.message === "Email not verified") {
        navigate("/account/verify-email");
      }
    }
  }, [fetcher.data, navigate]);

  const isSubmitting = fetcher.state === "submitting";
  const toggleVisibility = () => setIsVisible?.((prev) => !prev);
  const filterFields = authFields.filter((field) =>
    ["email", "password"].includes(field.name),
  );

  const onSubmit: SubmitHandler<SigninFormData> = async (
    data: SigninFormData,
  ) => {
    fetcher.submit(data, {
      method: "post",
      action: `/account/login`,
    });
  };

  return (
    <div className="space-y-2 w-full max-w-[400px] mx-auto">
      <h1 className="uppercase text-2xl font-bold tracking-tight">
        Welcome back
      </h1>
      <p className="text-muted-foreground">
        Enter your email and password to login
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
          text={"Sign In"}
          type="submit"
          loading={isSubmitting}
          size="lg"
          children={<Loader className="animate-spin" />}
          classname="w-full font-medium uppercase bg-lightBlue py-4 hover:bg-coolBlue dark:bg-velvet dark:text-white"
        />
      </Form>
      <Button
        asChild
        variant="link"
        className="font-medium text-sm text-lightBlue hover:text-coolBlue dark:text-muted-foreground p-0"
      >
        <Link to="/account/forgot-password">Forgot password?</Link>
      </Button>
    </div>
  );
}
