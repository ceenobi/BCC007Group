import {
  useSearchParams,
  useLocation,
  useOutletContext,
  useNavigate,
  Outlet,
} from "react-router";
import { ListFilter } from "lucide-react";
import type { Route } from "./+types/payments";
import { PageSection, PageWrapper } from "~/components/pageWrapper";
import PageTitle from "~/components/pageTitle";
import {
  cancelSubscriptionSchema,
  initializePaymentSchema,
  type UserData,
} from "~/lib/dataSchema";
import { hasPermission } from "~/lib/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import MakePayment from "~/features/payments/makePayment";
import { getQueryClient } from "~/lib/queryClient";
import { dehydrate, useSuspenseQuery } from "@tanstack/react-query";
import {
  cancelSubscription,
  initializePayment,
} from "~/lib/actions/paystack.action";
import {
  listUserPaymentsQuery,
  groupPaymentsQuery,
} from "~/lib/queries/payments";
import { Button } from "~/components/ui/button";
import { getEventsQuery } from "~/lib/queries/events";
import usePaginate from "~/hooks/usePaginate";
import { lazy, Suspense, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import Search from "~/components/search";
import userTableCell from "~/features/payments/userTableCell";
import { SkeletonTable } from "~/components/skeleton";
import { Await } from "react-router";
import { Separator } from "~/components/ui/separator";
import Filter from "~/features/payments/filter";
import Paginate from "~/components/paginate";
import ExportData from "~/features/payments/exportData";
import Error from "~/components/error";
const TableView = lazy(() => import("~/components/tableView"));
const CardView = lazy(() => import("~/features/payments/userCardView"));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Your Payments - Manage BCC007 Team payments" },
    {
      name: "description",
      content: "Your Payments - Manage BCC007 Team payments",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const cookie = request.headers.get("Cookie") || "";
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const method = request.method;
  const intent = formData.get("intent");

  switch (method) {
    case "POST": {
      if (intent === "cancel_subscription") {
        const response = await cancelSubscription({
          cookie,
          validated: cancelSubscriptionSchema.parse(data),
        });
        return response;
      }
      const response = await initializePayment({
        cookie,
        validated: initializePaymentSchema.parse(data),
      });
      return response;
    }
    default:
      return null;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const queryClient = getQueryClient();
  const cookie = request.headers.get("Cookie") || "";
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "user";
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const query = url.searchParams.get("query") || "";
  const paymentStatus = url.searchParams.get("paymentStatus") as
    | "pending"
    | "completed"
    | "failed"
    | "cancelled"
    | undefined;
  const paymentType = url.searchParams.get("paymentType") as
    | "donation"
    | "event"
    | "membership_dues"
    | undefined;
  await Promise.all([
    queryClient.prefetchQuery(
      getEventsQuery({
        cookie,
        page: 1,
        limit: 100,
        status: "upcoming",
      }),
    ),
    queryClient.prefetchQuery(
      tab === "user"
        ? listUserPaymentsQuery({
            cookie,
            page,
            limit,
            query,
            paymentStatus,
            paymentType,
          })
        : groupPaymentsQuery({
            cookie,
            page,
            limit,
            query,
            paymentStatus,
            paymentType,
          }),
    ),
  ]);
  return { dehydratedState: dehydrate(queryClient) };
}

export default function Payments() {
  const { user } = useOutletContext() as { user: UserData };
  const { data: eventsRes } = useSuspenseQuery(
    getEventsQuery({
      page: 1,
      limit: 100,
      status: "upcoming",
    }),
  );
  const location = useLocation();
  const path = location.pathname === "/payments";
  const eventsData = eventsRes?.body?.data || {};
  const { events } = eventsData;

  return (
    <PageWrapper>
      <PageSection index={0}>
        <div className="flex justify-between">
          <PageTitle
            title="Payments"
            subtitle="Manage and track your payments within the group"
          />
          <MakePayment events={events} />
        </div>
      </PageSection>
      {path ? <PaymentsList /> : <Outlet context={{ user }} />}
    </PageWrapper>
  );
}

function PaymentsList() {
  const [selected, setSelected] = useState<string[]>([]);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const { user } = useOutletContext() as { user: UserData };
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const userRole = user?.role;
  const tabQuery = searchParams.get("tab") || "user";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const query = searchParams.get("query") || "";
  const paymentStatus = searchParams.get("paymentStatus") as
    | "pending"
    | "completed"
    | "failed"
    | "cancelled"
    | undefined;
  const paymentType = searchParams.get("paymentType") as
    | "donation"
    | "event"
    | "membership_dues"
    | undefined;

  const { data: paymentsRes } = useSuspenseQuery(
    tabQuery === "user"
      ? listUserPaymentsQuery({
          page,
          limit,
          query,
          paymentStatus,
          paymentType,
        })
      : groupPaymentsQuery({
          page,
          limit,
          query,
          paymentStatus,
          paymentType,
        }),
  );
  if (paymentsRes.status !== 200) return <Error error={paymentsRes?.body} />;
  const paymentsData = (paymentsRes as any)?.body?.data || [];
  const { payments, pagination } = paymentsData;
  const {
    handlePageChange,
    handleLimitChange,
    totalPages,
    hasMore,
    currentPage,
    limit: pageLimit,
  } = usePaginate({
    totalPages: pagination?.totalPages || 1,
    hasMore: pagination?.hasMore || false,
    currentPage: pagination?.currentPage || 1,
  });
  const renderCell = userTableCell({ user, tabQuery });

  const handleTabSwitch = (value: string) => {
    if (hasPermission(userRole, "VIEW_PAYMENTS") && value === "group") {
      navigate(`/payments?tab=${value}`);
    } else if (
      hasPermission(userRole, "VIEW_PAYMENTS") &&
      value === "reports"
    ) {
      navigate(`/payments/${value}`);
    } else {
      setSearchParams({ tab: value });
    }
  };

  return (
    <PageSection index={1}>
      <div className="mt-6">
        <Tabs
          value={tabQuery}
          className="space-y-6"
          onValueChange={(value) => handleTabSwitch(value)}
        >
          <div className="relative">
            <TabsList variant="line" className="font-semibold relative z-10">
              <TabsTrigger value="user" className="mr-6 cursor-pointer">
                <span className="hidden md:inline">Payment</span> History
              </TabsTrigger>
              {hasPermission(userRole, "VIEW_PAYMENTS") && (
                <TabsTrigger value="group" className="mr-6 cursor-pointer">
                  Group Payments
                </TabsTrigger>
              )}
              <TabsTrigger value="reports" className="mr-6 cursor-pointer">
                Reports
              </TabsTrigger>
            </TabsList>
            <div className="absolute -bottom-px w-full mx-1 h-[2px] bg-gray-200 dark:bg-gray-600"></div>
          </div>
          <Card
            className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm py-3 transition-all duration-300 ease-in-out"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex gap-4 items-center px-4">
              <Search
                id="search reference"
                placeholder={
                  tabQuery === "user"
                    ? "Search reference"
                    : "Search members by name"
                }
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="relative cursor-pointer rounded-sm"
                  onClick={() => setIsOpenFilter(!isOpenFilter)}
                >
                  <ListFilter /> Filter
                </Button>
                <Separator orientation="vertical" />
                <ExportData payments={payments} selected={selected} />
              </div>
            </div>
            {isOpenFilter && (
              <>
                <Separator />
                <Filter />
              </>
            )}
          </Card>
          <Card className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-4">
            <CardContent className="p-0 text-start">
              <TabsContent value={tabQuery} className="w-full">
                <Suspense fallback={<SkeletonTable />}>
                  <Await
                    resolve={payments}
                    children={(resolvedPayments) => (
                      <>
                        <div className="hidden xl:block">
                          <TableView
                            tableColumns={[
                              { name: "REFERENCE", uid: "reference" },
                              { name: "TYPE", uid: "paymentType" },
                              { name: "AMOUNT", uid: "amount" },
                              { name: "STATUS", uid: "paymentStatus" },
                              { name: "DATE", uid: "createdAt" },
                              { name: "ACTION", uid: "action" },
                            ]}
                            tableData={resolvedPayments}
                            renderCell={renderCell}
                            batchAction={true}
                            selected={selected}
                            setSelected={setSelected}
                          />
                        </div>
                        <div className="xl:hidden">
                          <CardView
                            payments={resolvedPayments}
                            user={user}
                            tabQuery={tabQuery}
                          />
                        </div>
                      </>
                    )}
                  />
                </Suspense>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
        {payments?.length > 0 && (
          <Paginate
            totalPages={totalPages}
            hasMore={hasMore}
            handlePageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            currentPage={currentPage}
            limit={pageLimit}
          />
        )}
      </div>
    </PageSection>
  );
}
