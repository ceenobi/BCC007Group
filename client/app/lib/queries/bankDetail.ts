import { getBankAccount } from "../actions/bankDetail-action";

export const getBankDetailsQuery = ({ cookie }: { cookie?: string }) => ({
  queryKey: ["bankDetails"],
  queryFn: () => getBankAccount({ cookie }),
});
