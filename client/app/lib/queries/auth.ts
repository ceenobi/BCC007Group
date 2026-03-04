import { getUserSession } from "../actions/auth.action";

export const getUserQuery = ({ cookie }: { cookie?: string }) => ({
  queryKey: ["user"],
  queryFn: () => getUserSession({ cookie: cookie || "" }),
});
