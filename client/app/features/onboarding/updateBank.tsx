import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useFetcher, type URLSearchParamsInit, Form } from "react-router";
import {
  createBankAccountSchema,
  type BankAccountData,
  type CreateBankAccountData,
} from "~/lib/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageSection } from "~/components/pageWrapper";
import { Card, CardContent } from "~/components/ui/card";
import { authFields } from "~/lib/constants";
import FormBox from "~/components/formBox";
import { toast } from "sonner";
import { BadgeCheck, Loader } from "lucide-react";
import ActionButton from "~/components/actionButton";
import { getQueryClient } from "~/lib/queryClient";
import useBank from "~/hooks/useBank";

interface UpdateBankData {
  setSearchParams: (searchParams: URLSearchParamsInit) => void;
  bankDetails: BankAccountData;
}

export default function UpdateBank({
  setSearchParams,
  bankDetails,
}: UpdateBankData) {
  const fetcher = useFetcher();
  const form = useForm<CreateBankAccountData>({
    resolver: zodResolver(createBankAccountSchema) as any,
    defaultValues: {
      bankAccountNumber: bankDetails?.bankAccountNumber || "",
      bankAccountName: bankDetails?.bankAccountName || "",
      bank: bankDetails?.bank || "",
      bankCode: bankDetails?.bankCode || "",
    },
    mode: "onBlur",
  });
  const { bankCode, mutation, getBankData } = useBank({ form });
  const queryClient = getQueryClient();
  const step = "3";

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 201 && step === "3") {
      toast.success(
        fetcher.data?.body?.message || "Bank details updated successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
      setSearchParams({ step: "4" });
    } else if (fetcher.data && fetcher.data?.status !== 201 && step === "3") {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
    }
  }, [fetcher.data, setSearchParams]);

  const isSubmitting = fetcher.state === "submitting";

  const filterFields = authFields.filter((field) =>
    ["bank", "bankAccountNumber", "bankAccountName"].includes(field.name),
  );

  const goBack = () => {
    setSearchParams({ step: "2" });
  };

  const onSubmit: SubmitHandler<CreateBankAccountData> = (data) => {
    fetcher.submit(
      {
        ...data,
        bankCode,
      } as any,
      {
        method: "post",
        action: `/members/onboarding?step=3`,
      },
    );
  };

  return (
    <PageSection index={3}>
      <div className="space-y-4">
        <div>
          <h1 className="font-semibold">Update Bank Details</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Update your bank details. This allows us to process your payments
            smoothly.
          </p>
        </div>
        <Card
          className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm"
          style={{ animationDelay: "100ms" }}
        >
          <CardContent className="p-4 text-start">
            <Form onSubmit={form.handleSubmit(onSubmit)} id="bankDetails">
              <FormBox
                form={form}
                data={filterFields}
                getSelectData={getBankData}
                classname="mb-4 w-full"
              />
              {mutation.isPending ? (
                <div className="flex gap-2 items-center">
                  <Loader className="h-4 w-4 animate-spin text-yellow-500" />
                  <span className="text-xs">resolving...</span>
                </div>
              ) : mutation.isSuccess ? (
                <div className="flex gap-2 items-center">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span className="text-xs">resolved</span>
                </div>
              ) : null}
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
            text={"Update bank details"}
            type="submit"
            form="bankDetails"
            loading={isSubmitting}
            children={<Loader className="animate-spin" />}
            classname="btnBlue"
          />
        </div>
      </div>
    </PageSection>
  );
}
