import { PageSection } from "~/components/pageWrapper";
import {
  UpdateUserSchema,
  type UpdateUserData,
  type UserData,
} from "~/lib/dataSchema";
import { type URLSearchParamsInit, useFetcher, Form } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authFields, genderData } from "~/lib/constants";
import { toast } from "sonner";
import { useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import FormBox from "~/components/formBox";
import ActionButton from "~/components/actionButton";
import { Loader } from "lucide-react";

export default function UpdateProfile({
  user,
  setSearchParams,
}: {
  user: UserData;
  setSearchParams: (searchParams: URLSearchParamsInit) => void;
}) {
  const form = useForm<UpdateUserData>({
    resolver: zodResolver(UpdateUserSchema) as any,
    defaultValues: {
      phone: user.phone,
      occupation: user.occupation,
      location: user.location,
      gender: user.gender,
      dateOfBirth: (user?.dateOfBirth
        ? new Date(user?.dateOfBirth as Date).toISOString().split("T")[0]
        : "") as any,
    },
    mode: "onBlur",
  });
  const fetcher = useFetcher();
  const step = "2";

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200 && step === "2") {
      toast.success(
        fetcher.data?.body?.message || "User information updated successfully",
      );
      setSearchParams({ step: "3" });
    } else if (fetcher.data && fetcher.data?.status !== 200 && step === "2") {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
    }
  }, [fetcher.data, setSearchParams]);

  const isSubmitting = fetcher.state === "submitting";

  const filterFields = authFields.filter((field) =>
    ["phone", "occupation", "location", "gender", "dateOfBirth"].includes(
      field.name,
    ),
  );

  const goBack = () => {
    setSearchParams({ step: "1" });
  };

  const onSubmit: SubmitHandler<Partial<UpdateUserData>> = async (data) => {
    fetcher.submit(
      {
        ...data,
        dateOfBirth: data.dateOfBirth?.toISOString(),
      } as any,
      {
        method: "patch",
        action: `/members/onboarding?step=2`,
        encType: "application/json",
      },
    );
  };

  return (
    <PageSection index={2}>
      <div className="space-y-4">
        <div>
          <h1 className="font-semibold">Update Profile</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Update your profile information
          </p>
        </div>
        <Card
          className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm"
          style={{ animationDelay: "100ms" }}
        >
          <CardContent className="p-4 text-start">
            <Form onSubmit={form.handleSubmit(onSubmit)} id="profile">
              <FormBox
                form={form}
                data={filterFields}
                getSelectData={genderData}
                classname="mb-4 w-full"
              />
            </Form>
          </CardContent>
        </Card>
        <div className="mt-4 flex flex-col-reverse sm:flex-row justify-end gap-4">
          <ActionButton
            text={"Back"}
            type="button"
            variant="outline"
            onClick={goBack}
            classname="w-full sm:w-auto rounded-sm text-xs font-medium py-4"
          />
          <ActionButton
            text={"Update profile"}
            type="submit"
            form="profile"
            loading={isSubmitting}
            children={<Loader className="animate-spin" />}
            classname="btnBlue"
          />
        </div>
      </div>
    </PageSection>
  );
}
