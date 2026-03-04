import { useEffect } from "react";
import { toast } from "sonner";
import {
  useLocation,
  useOutletContext,
  useSearchParams,
  useNavigate,
  useFetcher,
} from "react-router";
import type { Route } from "./+types/settings";
import { PageSection, PageWrapper } from "~/components/pageWrapper";
import PageTitle from "~/components/pageTitle";
import { Outlet } from "react-router";
import EditAccount from "~/features/settings/editAccount";
import {
  ChangeEmailSchema,
  ChangePasswordSchema,
  createBankAccountSchema,
  type BankAccountData,
  type PaymentData,
  type UserData,
} from "~/lib/dataSchema";
import { hasPermission } from "~/lib/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card } from "~/components/ui/card";
import ChangeAvatar from "~/features/settings/changeAvatar";
import { getQueryClient } from "~/lib/queryClient";
import { getBankDetailsQuery } from "~/lib/queries/bankDetail";
import {
  dehydrate,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Field, FieldGroup } from "~/components/ui/field";
import { Switch } from "~/components/ui/switch";
import {
  changeEmail,
  changePassword,
  updateUser,
} from "~/lib/actions/auth.action";
import { Separator } from "~/components/ui/separator";
import { authClient } from "~/lib/better-authClient";
import { Button } from "~/components/ui/button";
import ChangePassword from "~/features/settings/changePassword";
import ChangeEmail from "~/features/settings/changeEmail";
import ChangeBank from "~/features/settings/changeBank";
import { updateBankAccount } from "~/lib/actions/bankDetail-action";
import DeleteAccount from "~/features/settings/deleteAccount";
import Subscription from "~/features/settings/subscription";
import { listUserPaymentsQuery } from "~/lib/queries/payments";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings - Manage your BCC007 Team information" },
    {
      name: "description",
      content: "Settings - Manage your BCC007 Team information",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const queryClient = getQueryClient();
  const cookie = request.headers.get("Cookie") || "";
  await Promise.all([
    queryClient.prefetchQuery(getBankDetailsQuery({ cookie })),
    queryClient.prefetchQuery(
      listUserPaymentsQuery({
        cookie,
        page: 1,
        limit: 10,
      }),
    ),
  ]);
  return { dehydratedState: dehydrate(queryClient) };
}

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const cookie = request.headers.get("Cookie") || "";
  const formData = await request.formData();
  const dataObject = Object.fromEntries(formData);
  const method = request.method;
  switch (method) {
    case "POST": {
      if (type === "password") {
        const response = await changePassword({
          validated: ChangePasswordSchema.parse(dataObject),
          cookie,
        });
        return response;
      }
      if (type === "email") {
        const response = await changeEmail({
          validated: ChangeEmailSchema.parse(dataObject),
          cookie,
        });
        return response;
      }
    }
    case "PATCH": {
      if (type === "bank") {
        const response = await updateBankAccount({
          validated: createBankAccountSchema.parse(dataObject),
          cookie,
        });
        return response;
      }
      const response = await updateUser({
        validated: dataObject,
        cookie,
      });
      return response;
    }
    default:
      return null;
  }
}

export default function Settings() {
  const { user } = useOutletContext() as { user: UserData };
  const location = useLocation();
  const path = location.pathname === "/settings";
  return (
    <PageWrapper>
      <PageSection index={0}>
        <div className="flex items-center justify-between">
          <PageTitle title="Settings" />
          <EditAccount user={user} />
        </div>
      </PageSection>
      {path ? <AccountSettings /> : <Outlet />}
    </PageWrapper>
  );
}

function AccountSettings() {
  const { data: bankResponse } = useSuspenseQuery(getBankDetailsQuery({}));
  const { data: paymentResponse } = useSuspenseQuery(
    listUserPaymentsQuery({ page: 1, limit: 10 }),
  );
  const { user } = useOutletContext() as { user: UserData };
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabQuery = searchParams.get("tab") || "account";
  const userRole = user.role;
  const bankDetails = bankResponse?.body?.data || {};
  const paymentSub = paymentResponse?.body?.data || {};
  const payments = paymentSub.payments || [];
  const findSubscription = payments.find(
    (pay: PaymentData) =>
      pay.paymentType === "membership_dues" && pay.isRecurring === true,
  );

  const handleTabSwitch = (value: string) => {
    if (hasPermission(userRole, "MANAGE_SETTINGS")) {
      navigate(`/settings?tab=${value}`);
    } else {
      setSearchParams({ tab: value });
    }
  };

  return (
    <PageSection index={1}>
      <div className="mt-6">
        <Tabs
          value={tabQuery}
          className="space-y-3"
          onValueChange={(value) => handleTabSwitch(value)}
        >
          <div className="relative">
            <TabsList variant="line" className="font-semibold relative z-10">
              <TabsTrigger value="account" className="mr-6 cursor-pointer">
                Account
              </TabsTrigger>
              <TabsTrigger value="security" className="mr-6 cursor-pointer">
                Security
              </TabsTrigger>
              <TabsTrigger value="subscription" className="mr-6 cursor-pointer">
                Subscription
              </TabsTrigger>
            </TabsList>
            <div className="absolute -bottom-px w-full mx-1 h-[2px] bg-gray-200 dark:bg-gray-600"></div>
          </div>
          <TabsContent value={tabQuery} className="w-full">
            {tabQuery === "account" && (
              <AccountSettingsTab user={user} bankDetails={bankDetails} />
            )}
            {tabQuery === "security" && <SecuritySettingsTab />}
            {tabQuery === "subscription" && <Subscription sub={findSubscription}/>}
          </TabsContent>
        </Tabs>
      </div>
    </PageSection>
  );
}

function AccountSettingsTab({
  user,
  bankDetails,
}: {
  user: UserData;
  bankDetails: BankAccountData;
}) {
  const fetcher = useFetcher();
  const isUpdating = fetcher.state !== "idle" && fetcher.formData != null;

  const handleToggle = (name: string, value: boolean) => {
    fetcher.submit({ [name]: value }, { method: "patch" });
  };

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success("User preferences updated successfully");
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error("Failed to update user preferences!");
    }
  }, [fetcher.data]);

  const displayDisableBirthDate =
    isUpdating && fetcher.formData?.has("disableBirthDate")
      ? fetcher.formData.get("disableBirthDate") === "true"
      : user.disableBirthDate;

  const displayDisableEmail =
    isUpdating && fetcher.formData?.has("disableEmail")
      ? fetcher.formData.get("disableEmail") === "true"
      : user.disableEmail;

  return (
    <div className="space-y-6">
      <ChangeAvatar user={user} />
      <PageSection index={2}>
        <Card
          className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-0 transition-all duration-300 ease-in-out"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-slate-50 dark:bg-lightBlue/20 py-4 border-b">
            <h1 className="font-semibold text-lg px-4">Account Info</h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 px-4 py-6 text-gray-900 dark:text-white">
            <div>
              <h1 className="font-semibold">Profile name</h1>
              <p>{user.name}</p>
            </div>
            <div>
              <h1 className="font-semibold">Member ID</h1>
              <p>{user.memberId}</p>
            </div>
            <div>
              <h1 className="font-semibold">Role</h1>
              <p>{user.role}</p>
            </div>
            <div>
              <h1 className="font-semibold">Gender</h1>
              <p>{user.gender || "N/A"}</p>
            </div>
            <div>
              <h1 className="font-semibold">Birthday</h1>
              <p>{new Date(user.dateOfBirth || "").toDateString() || "N/A"}</p>
            </div>
            <div>
              <h1 className="font-semibold">Joined Date</h1>
              <p>{new Date(user.createdAt || "").toDateString()}</p>
            </div>
          </div>
        </Card>
      </PageSection>
      <PageSection index={3}>
        <Card
          className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-0 transition-all duration-300 ease-in-out"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-slate-50 dark:bg-lightBlue/20 py-4 border-b">
            <h1 className="font-semibold text-lg px-4">Contact information</h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-6 text-gray-900 dark:text-white">
            <div>
              <h1 className="font-semibold">Email</h1>
              <p>{user.email}</p>
            </div>
            <div>
              <h1 className="font-semibold">Phone</h1>
              <p>{user.phone || "N/A"}</p>
            </div>
            <div>
              <h1 className="font-semibold">Occupation</h1>
              <p>{user.occupation || "N/A"}</p>
            </div>
            <div>
              <h1 className="font-semibold">Location</h1>
              <p>{user.location || "N/A"}</p>
            </div>
          </div>
        </Card>
      </PageSection>
      <PageSection index={4}>
        <Card
          className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-0 transition-all duration-300 ease-in-out"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-slate-50 dark:bg-lightBlue/20 py-4 border-b">
            <h1 className="font-semibold text-lg px-4">Bank details</h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-6 text-gray-900 dark:text-white">
            <div>
              <h1 className="font-semibold">Bank name</h1>
              <p>{bankDetails.bank || "N/A"}</p>
            </div>
            <div>
              <h1 className="font-semibold">Account number</h1>
              <p>{bankDetails.bankAccountNumber || "N/A"}</p>
            </div>
            <div>
              <h1 className="font-semibold">Account name</h1>
              <p>{bankDetails.bankAccountName || "N/A"}</p>
            </div>
          </div>
        </Card>
      </PageSection>
      <PageSection index={5}>
        <Card
          className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-0 transition-all duration-300 ease-in-out"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-slate-50 dark:bg-lightBlue/20 py-4 border-b">
            <h1 className="font-semibold text-lg px-4">Privacy</h1>
          </div>
          <div className="flex justify-between gap-4 px-4 py-6 text-gray-900 dark:text-white">
            <div className="w-[80%]">
              <p className="font-semibold">Disable birth year</p>
              <p className="text-muted-foreground">
                This will hide your birth year from public view
              </p>
            </div>
            <div className="w-[10%]">
              <FieldGroup>
                <Field orientation="horizontal">
                  <Switch
                    className="text-lightBlue cursor-pointer"
                    id="disable-birth-year"
                    checked={displayDisableBirthDate}
                    onCheckedChange={(value) =>
                      handleToggle("disableBirthDate", value)
                    }
                  />
                </Field>
              </FieldGroup>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between gap-4 px-4 py-6 text-gray-900 dark:text-white">
            <div className="w-[80%]">
              <p className="font-semibold">Disable Email</p>
              <p className="text-muted-foreground">
                Disable your email to prevent it from receiving news and
                updates.
              </p>
            </div>
            <div className="w-[10%]">
              <FieldGroup>
                <Field orientation="horizontal">
                  <Switch
                    className="text-lightBlue cursor-pointer"
                    id="disable-email"
                    checked={displayDisableEmail}
                    onCheckedChange={(value) =>
                      handleToggle("disableEmail", value)
                    }
                  />
                </Field>
              </FieldGroup>
            </div>
          </div>
        </Card>
      </PageSection>
    </div>
  );
}

function SecuritySettingsTab() {
  const { data: bankResponse } = useSuspenseQuery(getBankDetailsQuery({}));
  const queryClient = getQueryClient();
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await authClient.listSessions();
      return res.data;
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (token: string) => {
      return await authClient.revokeSession({ token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session revoked successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to revoke session");
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: async () => {
      return await authClient.revokeSessions();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("All sessions revoked successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to revoke all sessions");
    },
  });
  const bankDetails = bankResponse?.body?.data || {};

  return (
    <div className="space-y-6">
      <ChangeBank bankDetails={bankDetails} />
      <ChangePassword />
      <ChangeEmail />
      <PageSection index={6}>
        <Card
          className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-0 transition-all duration-300 ease-in-out"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-slate-50 dark:bg-lightBlue/20 p-4 border-b flex justify-between items-center">
            <h1 className="font-semibold text-lg">Sessions</h1>
            <Button
              variant="outline"
              className="btnRed cursor-pointer"
              size="sm"
              disabled={revokeAllSessionsMutation.isPending}
              onClick={() => revokeAllSessionsMutation.mutate()}
            >
              {revokeAllSessionsMutation.isPending
                ? "Revoking..."
                : "Revoke All"}
            </Button>
          </div>
          <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
            {sessionsLoading ? (
              <div className="flex justify-center p-4">
                <div className="loader"></div>
              </div>
            ) : (
              sessions?.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-wrap gap-4 justify-between items-center border-b last:border-0 pb-4 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {session.userAgent || "Unknown Device"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.ipAddress || "Unknown IP"} •{" "}
                      {new Date(session.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={revokeSessionMutation.isPending}
                    onClick={() => revokeSessionMutation.mutate(session.token)}
                  >
                    {revokeSessionMutation.isPending &&
                    revokeSessionMutation.variables === session.token
                      ? "Revoking..."
                      : "Revoke"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </PageSection>
      <DeleteAccount />
    </div>
  );
}
