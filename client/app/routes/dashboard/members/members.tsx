import {
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useSearchParams,
  Await,
} from "react-router";
import type { Route } from "./+types/members";
import { PageSection, PageWrapper } from "~/components/pageWrapper";
import PageTitle from "~/components/pageTitle";
import {
  AssignRoleSchema,
  SignUpSchema,
  type UserData,
} from "~/lib/dataSchema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent } from "~/components/ui/card";
import Search from "~/components/search";
import AddNew from "~/features/members/addNew";
import { hasPermission } from "~/lib/rbac";
import { Can } from "~/components/rbac/Can";
import { signUpWithEmail } from "~/lib/actions/auth.action";
import { getQueryClient } from "~/lib/queryClient";
import { getMembersQuery } from "~/lib/queries/members";
import { dehydrate, useSuspenseQuery } from "@tanstack/react-query";
import Error from "~/components/error";
import { lazy, Suspense, useState } from "react";
import { SkeletonTable } from "~/components/skeleton";
import { sortMembersMethods } from "~/lib/utils";
import useTableCell from "~/features/members/tableCell";
import Sort from "~/components/sort";
import { Button } from "~/components/ui/button";
import { ListFilter } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import Filter from "~/features/members/filter";
import usePaginate from "~/hooks/usePaginate";
import Paginate from "~/components/paginate";
import AssignRole from "~/features/members/assignRole";
import { assignRole } from "~/lib/actions/member.action";
import AccessDenied from "~/components/rbac/AccessDenied";
const TableView = lazy(() => import("~/components/tableView"));
const CardView = lazy(() => import("~/features/members/cardView"));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Members - Manage BCC007 Pay members" },
    {
      name: "description",
      content: "Members - Manage BCC007 Pay members",
    },
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
      const response = await signUpWithEmail({
        cookie,
        validated: SignUpSchema.parse(data),
      });
      return response;
    }
    case "PATCH": {
      const response = await assignRole({
        id,
        cookie,
        validated: AssignRoleSchema.parse(data),
      });
      return response;
    }
    default:
      return null;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const queryClient = getQueryClient();
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const query = url.searchParams.get("query") || "";
  const gender = url.searchParams.get("gender") || undefined;
  const role = url.searchParams.get("role") || undefined;
  const cookie = request.headers.get("Cookie") || "";
  await queryClient.prefetchQuery(
    getMembersQuery({ cookie, page, limit, query, gender, role }),
  );
  return { dehydratedState: dehydrate(queryClient) };
}

export default function Members() {
  const { user } = useOutletContext() as { user: UserData };
  const location = useLocation();
  const path = location.pathname === "/members";
  return (
    <PageWrapper>
      <PageSection index={0}>
        <PageTitle
          title="Members"
          subtitle="Find, connect with BCC007 members"
        />
      </PageSection>
      {path ? <MembersLists /> : <Outlet context={{ user }} />}
    </PageWrapper>
  );
}

function MembersLists() {
  const { user } = useOutletContext() as { user: UserData };
  const [sort, setSort] = useState<"name(A-Z)" | "name(Z-A)">("name(A-Z)");
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabQuery = searchParams.get("tab") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const query = searchParams.get("query") || "";
  const gender = searchParams.get("gender") || undefined;
  const role = searchParams.get("role") || undefined;
  const { data } = useSuspenseQuery(
    getMembersQuery({ page, limit, query, gender, role }),
  );
  if (data.status !== 200) return <Error error={data?.body} />;
  const membersData = data?.body?.data || {};
  const { members, pagination } = membersData;
  const userRole = user?.role;
  const sortedMembers = sort
    ? members.sort(sortMembersMethods[sort].method)
    : members;
  const renderCell = useTableCell();
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

  const handleTabSwitch = (value: string) => {
    if (hasPermission(userRole, "MANAGE_MEMBERS")) {
      navigate(`/members?tab=${value}`);
    } else {
      setSearchParams({ tab: value });
    }
  };
  const handleSortChange = (value: string) => {
    setSort(value as "name(A-Z)" | "name(Z-A)");
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
              <TabsTrigger value="all" className="mr-6 cursor-pointer">
                All
              </TabsTrigger>
              <TabsTrigger value="roles" className="mr-6 cursor-pointer">
                Roles
              </TabsTrigger>
              <TabsTrigger value="options" className="mr-6 cursor-pointer">
                Options
              </TabsTrigger>
            </TabsList>
            <div className="absolute -bottom-px w-full mx-1 h-[2px] bg-gray-200 dark:bg-gray-600"></div>
          </div>
          <Card className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm py-3 transition-all duration-300 ease-in-out">
            <div className="flex gap-4 items-center px-4">
              <Search id="searchMember" placeholder="Search member name" />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="relative cursor-pointer rounded-sm"
                  onClick={() => setIsOpenFilter(!isOpenFilter)}
                >
                  <ListFilter /> Filter
                </Button>
                <Separator orientation="vertical" />
                <Sort handleSortChange={handleSortChange} sort={sort} />
                <Can user={user} permission="MANAGE_MEMBERS">
                  <Separator orientation="vertical" />
                  <AddNew />
                </Can>
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
                    resolve={sortedMembers}
                    children={(resolvedMembers) => (
                      <>
                        {tabQuery === "all" && (
                          <>
                            <div className="hidden xl:block">
                              <TableView
                                tableColumns={[
                                  { name: "NAME", uid: "name" },
                                  { name: "EMAIL", uid: "email" },
                                  { name: "PHONE", uid: "phone" },
                                  { name: "OCCUPATION", uid: "occupation" },
                                  { name: "LOCATION", uid: "location" },
                                  { name: "JOINED", uid: "createdAt" },
                                  { name: "ROLE", uid: "role" },
                                  { name: "ACTION", uid: "action" },
                                ]}
                                tableData={resolvedMembers}
                                renderCell={renderCell}
                              />
                            </div>
                            <div className="xl:hidden">
                              <CardView members={resolvedMembers} />
                            </div>
                          </>
                        )}
                        {tabQuery === "roles" && (
                          <Can
                            user={user}
                            permission="MANAGE_MEMBERS"
                            fallback={<AccessDenied />}
                          >
                            <AssignRole members={resolvedMembers} user={user} />
                          </Can>
                        )}
                      </>
                    )}
                  />
                </Suspense>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
        {members?.length > 0 && (
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
