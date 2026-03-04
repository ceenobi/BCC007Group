import { useNavigate, useSearchParams, Await } from "react-router";
import type { Route } from "./+types/help-desk";
import { lazy, Suspense, useEffect, useState } from "react";
import { PageSection, PageWrapper } from "~/components/pageWrapper";
import PageTitle from "~/components/pageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card } from "~/components/ui/card";
import Search from "~/components/search";
import { getQueryClient } from "~/lib/queryClient";
import { getTicketsQuery } from "~/lib/queries/ticket";
import { dehydrate, useSuspenseQuery } from "@tanstack/react-query";
import Error from "~/components/error";
import StatsCard from "~/features/help-desk/statsCard";
import NotFound from "~/components/notFound";
import { SkeletonTicketCard } from "~/components/skeleton";
import {
  CreateTicketSchema,
  UpdateTicketSchema,
  type TicketData,
  type UserData,
} from "~/lib/dataSchema";
import { useOutletContext } from "react-router";
import { hasPermission } from "~/lib/rbac";
import { Button } from "~/components/ui/button";
import { ListFilter } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { Can } from "~/components/rbac/Can";
import Filter from "~/features/help-desk/filter";
import Paginate from "~/components/paginate";
import usePaginate from "~/hooks/usePaginate";
import NewTicket from "~/features/help-desk/newTicket";
import { createTicket, updateTicket } from "~/lib/actions/ticket.action";
import Actions from "~/features/help-desk/actions";
import { getMembersQuery } from "~/lib/queries/members";
import Articles from "~/features/help-desk/articles";
const TicketCard = lazy(() => import("~/features/help-desk/ticketCard"));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "View and manage issues regarding payments and events" },
    { name: "description", content: "Help Desk! - Contact support" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const cookie = request.headers.get("Cookie") || "";
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const method = request.method;
  switch (method) {
    case "POST": {
      const response = await createTicket({
        cookie,
        validated: CreateTicketSchema.parse(data),
      });
      return response;
    }
    case "PATCH": {
      const response = await updateTicket({
        id,
        cookie,
        validated: UpdateTicketSchema.parse(data),
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
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const query = url.searchParams.get("query") || "";
  const status = url.searchParams.get("status") as
    | "open"
    | "closed"
    | "in-progress"
    | "resolved"
    | undefined;
  const category = url.searchParams.get("category") as
    | "payment"
    | "event"
    | "other"
    | undefined;
  const priority = url.searchParams.get("priority") as
    | "low"
    | "medium"
    | "high"
    | undefined;

  await Promise.all([
    await queryClient.prefetchQuery(
      getTicketsQuery({
        cookie,
        page,
        limit,
        query,
        status,
        category,
        priority,
      }),
    ),
    queryClient.prefetchQuery(
      getMembersQuery({
        cookie,
        page,
        limit: 100,
      }),
    ),
  ]);
  return { dehydratedState: dehydrate(queryClient) };
}

export default function HelpDesk() {
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const query = searchParams.get("query") || "";
  const status = searchParams.get("status") as
    | "open"
    | "closed"
    | "in-progress"
    | "resolved"
    | undefined;
  const category = searchParams.get("category") as
    | "payment"
    | "event"
    | "other"
    | undefined;
  const priority = searchParams.get("priority") as
    | "low"
    | "medium"
    | "high"
    | undefined;
  const { data } = useSuspenseQuery(
    getTicketsQuery({
      page,
      limit,
      query,
      status,
      category,
      priority,
    }),
  );
  if (data.status !== 200) return <Error error={data?.body} />;
  const ticketsData = data?.body?.data;
  const { tickets, summary, pagination } = ticketsData;
  const tabQuery = searchParams.get("tab") || "tickets";
  const [autoOpenNewTicket, setAutoOpenNewTicket] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useOutletContext() as { user: UserData };
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

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "create") {
      setAutoOpenNewTicket(true);
    }
  }, [searchParams]);

  const userRole = user.role;

  const handleTabSwitch = (value: string) => {
    if (hasPermission(userRole, "MANAGE_TICKETS")) {
      navigate(`/help-desk?tab=${value}`);
    } else {
      setSearchParams({ tab: value });
    }
  };

  return (
    <>
      <PageWrapper>
        <PageSection index={0}>
          <PageTitle
            title="Help Desk & Support"
            subtitle="Get assistance with payment issues, submit tickets, and access
                support resources"
          />
        </PageSection>
        <PageSection index={1}>
          <div className="mt-6">
            <StatsCard summary={summary} />
            <Tabs
              value={tabQuery}
              className="space-y-6"
              onValueChange={(value) => handleTabSwitch(value)}
            >
              <div className="relative">
                <TabsList
                  variant="line"
                  className="font-semibold relative z-10"
                >
                  <TabsTrigger value="tickets" className="mr-6 cursor-pointer">
                    Tickets
                  </TabsTrigger>
                  <TabsTrigger value="support" className="mr-6 cursor-pointer">
                    Support articles
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="mr-6 cursor-pointer">
                    Actions
                  </TabsTrigger>
                </TabsList>
                <div className="absolute -bottom-px w-full mx-1 h-[2px] bg-gray-200 dark:bg-gray-600"></div>
              </div>
              <Card
                className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm py-3 transition-all duration-300 ease-in-out"
                style={{ animationDelay: "100ms" }}
              >
                <div className="flex gap-4 items-center px-4">
                  <Search id="searchTickets" placeholder="Search tickets" />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="relative cursor-pointer rounded-sm"
                      onClick={() => setIsOpenFilter(!isOpenFilter)}
                    >
                      <ListFilter /> Filter
                    </Button>
                    <Separator orientation="vertical" />
                    <NewTicket
                      autoOpen={autoOpenNewTicket}
                      onOpenChange={(open) => {
                        if (!open) {
                          setAutoOpenNewTicket(false);
                        }
                      }}
                    />
                  </div>
                </div>
                {isOpenFilter && (
                  <>
                    <Separator />
                    <Filter />
                  </>
                )}
              </Card>
              <PageSection index={2}>
                <TabsContent value={tabQuery} className="w-full">
                  {tabQuery === "tickets" && (
                    <>
                      {tickets.length === 0 ? (
                        <NotFound message="No tickets found" />
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Suspense fallback={<SkeletonTicketCard />}>
                            <Await
                              resolve={tickets}
                              children={(resolvedTickets) => {
                                return resolvedTickets.map(
                                  (ticket: TicketData, index: number) => (
                                    <TicketCard
                                      key={ticket._id}
                                      ticket={ticket}
                                      index={index}
                                    />
                                  ),
                                );
                              }}
                            />
                          </Suspense>
                        </div>
                      )}
                    </>
                  )}
                  {tabQuery === "actions" && (
                    <>
                      <Can user={user} permission="MANAGE_TICKETS">
                        <Actions tickets={tickets} userRole={userRole} />
                      </Can>
                    </>
                  )}
                  {tabQuery === "support" && <Articles />}
                </TabsContent>
              </PageSection>
            </Tabs>
            {tickets?.length > 0 && tabQuery !== "support" && (
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
      </PageWrapper>
    </>
  );
}
