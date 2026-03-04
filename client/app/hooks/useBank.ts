import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { listBanksQuery } from "~/lib/queries/paystack";
import { resolveAccount } from "~/lib/actions/paystack.action";
import { useDebouncedCallback } from "use-debounce";
import type { CreateBankAccountData } from "~/lib/dataSchema";
import type { UseFormReturn } from "react-hook-form";

export default function useBank({
  form,
}: {
  form: UseFormReturn<CreateBankAccountData>;
}) {
  const { data } = useSuspenseQuery(listBanksQuery({}));
  const [bankCode, setBankCode] = useState<string>("");
  const bankLists = data?.status === 200 ? data.body.data : [];
  const getBankData = useMemo(() => {
    if (!Array.isArray(bankLists)) return [];
    return bankLists.map((bank: any) => ({
      name: bank?.name || "Unknown Bank",
      id: bank?.name?.toString() || "",
      code: bank?.code?.toString() || "",
    }));
  }, [bankLists]);
  const lastState = useRef({
    accountNumber: form.getValues("bankAccountNumber") || "",
    bankCode: "",
    bank: form.getValues("bank") || "",
  });

  // watch for bank change and set bank code
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // If name is undefined, it's a reset. We should still sync the bankCode if bank exists.
      if (!name || name === "bank") {
        const bank = value.bank;
        if (bank) {
          const bankData = getBankData?.find(
            (b: any) => b.name && b.name.toLowerCase() === bank.toLowerCase(),
          );
          if (bankData) {
            setBankCode(bankData.code);
          }
        } else {
          setBankCode("");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, getBankData]);

  const mutation = useMutation({
    mutationFn: resolveAccount,
    onSuccess: (data) => {
      if (data?.status === 200) {
        toast.success("Bank account found");
        form.setValue("bankAccountName", data.body.data.account_name);
      } else {
        const errorData = data.body as any;
        toast.error(errorData?.message || "Failed to resolve account");
        form.setValue("bankAccountName", "");
      }
    },
    onError: (error: any) => {
      import.meta.env.DEV && console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to resolve account",
      );
      form.setValue("bankAccountName", "");
    },
  });

  const debouncedResolveAccount = useDebouncedCallback(
    async (accountNumber: string, bankCode: string) => {
      if (accountNumber.length === 10 && bankCode) {
        mutation.mutate({ accountNumber, bankCode });
      }
    },
    1000,
  );

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      const accountNumber = value.bankAccountNumber || "";
      const bank = value.bank || "";

      // Only resolve if the field is dirty (user modified)
      // This prevents resolution on mount or after form.reset()
      const isAccountNumberDirty =
        form.getFieldState("bankAccountNumber").isDirty;
      const isBankDirty = form.getFieldState("bank").isDirty;

      if (!isAccountNumberDirty && !isBankDirty) {
        return;
      }

      if (
        accountNumber !== lastState.current.accountNumber ||
        bankCode !== lastState.current.bankCode ||
        bank !== lastState.current.bank
      ) {
        lastState.current = {
          accountNumber,
          bankCode,
          bank,
        };
        if (bank && bankCode && accountNumber && accountNumber.length === 10) {
          debouncedResolveAccount(accountNumber, bankCode);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      debouncedResolveAccount.cancel();
    };
  }, [form.watch, bankCode, debouncedResolveAccount, form.setValue]);

  return {
    bankLists,
    bankCode,
    setBankCode,
    mutation,
    debouncedResolveAccount,
    getBankData,
  };
}
