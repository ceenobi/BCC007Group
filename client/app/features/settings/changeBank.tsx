import { PageSection } from "~/components/pageWrapper";
import { Card } from "~/components/ui/card";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useFetcher, Form } from "react-router";
import {
  createBankAccountSchema,
  type BankAccountData,
  type CreateBankAccountData,
} from "~/lib/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { authFields } from "~/lib/constants";
import FormBox from "~/components/formBox";
import { toast } from "sonner";
import { BadgeCheck, Loader } from "lucide-react";
import ActionButton from "~/components/actionButton";
import { getQueryClient } from "~/lib/queryClient";
import useBank from "~/hooks/useBank";
import { useEffect } from "react";

export default function ChangeBank({
  bankDetails,
}: {
  bankDetails: BankAccountData;
}) {
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
  const fetcher = useFetcher();
  const queryClient = getQueryClient();

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      const newData = fetcher.data.body.data;
      toast.success("Bank details updated successfully");
      form.reset({
        bankAccountNumber: newData.bankAccountNumber,
        bankAccountName: newData.bankAccountName,
        bank: newData.bank,
        bankCode: newData.bankCode,
      });
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error("Failed to change bank details!");
    }
  }, [fetcher.data, form, queryClient]);

  const isSubmitting = fetcher.state === "submitting";

  const filterFields = authFields.filter((field) =>
    ["bank", "bankAccountNumber", "bankAccountName"].includes(field.name),
  );

  const onSubmit: SubmitHandler<CreateBankAccountData> = (data) => {
    fetcher.submit(
      {
        ...data,
        bankCode,
      } as any,
      {
        method: "patch",
        action: `/settings?type=bank`,
      },
    );
  };

  return (
    <PageSection index={8}>
      <Card
        className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-0 transition-all duration-300 ease-in-out"
        style={{ animationDelay: "100ms" }}
      >
        <div className="bg-slate-50 dark:bg-lightBlue/20 p-4 border-b">
          <h1 className="font-semibold text-lg">Update Bank Details</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Update your bank details. This allows us to process your payments
            smoothly.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 py-6">
          <Form
            onSubmit={form.handleSubmit(onSubmit)}
            id="bankDetails"
            className="relative"
          >
            <FormBox
              form={form}
              data={filterFields}
              getSelectData={getBankData}
              classname="mb-4 w-full"
            />
            {mutation.isPending ? (
              <div className="absolute top-0 right-0 flex gap-2 items-center">
                <Loader className="h-4 w-4 animate-spin text-yellow-500" />
                <span className="text-xs">resolving...</span>
              </div>
            ) : mutation.isSuccess ? (
              <div className="absolute top-0 right-0 flex gap-2 items-center">
                <BadgeCheck className="h-4 w-4 text-green-500" />
                <span className="text-xs">resolved</span>
              </div>
            ) : null}
            <ActionButton
              text="Change Bank"
              type="submit"
              form="bankDetails"
              classname="btnBlue"
              disabled={isSubmitting}
              loading={isSubmitting}
              children={<Loader className="animate-spin" />}
            />
          </Form>
        </div>
      </Card>
    </PageSection>
  );
}
