import { listBanks, resolveAccount } from "../actions/paystack.action";

export const listBanksQuery = ({ cookie }: { cookie?: string }) => ({
  queryKey: ["listBanks"],
  queryFn: () => listBanks({ cookie }),
});

export const resolveAccountQuery = ({
  accountNumber,
  bankCode,
  cookie,
}: {
  accountNumber: string;
  bankCode: string;
  cookie?: string;
}) => ({
  queryKey: ["resolveAccount", accountNumber, bankCode],
  queryFn: () => resolveAccount({ accountNumber, bankCode, cookie }),
});
