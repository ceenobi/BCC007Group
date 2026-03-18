import {
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useSearchParams,
  Await,
} from "react-router";
import type { Route } from "./+types/events";
import { PageSection, PageWrapper } from "~/components/pageWrapper";
import PageTitle from "~/components/pageTitle";
import {
  BatchDeleteEventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  type UserData,
} from "~/lib/dataSchema";
import { Suspense, useState } from "react";
import { hasPermission } from "~/lib/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card } from "~/components/ui/card";
import Search from "~/components/search";
import { Button } from "~/components/ui/button";
import { ListFilter } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { Can } from "~/components/rbac/Can";
import CreateEvent from "~/features/events/createEvent";
import Filter from "~/features/events/filter";
import { getQueryClient } from "~/lib/queryClient";
import { getMembersQuery } from "~/lib/queries/members";
import { dehydrate, useSuspenseQuery } from "@tanstack/react-query";
import {
  batchDeleteEvents,
  createEvent,
  deleteEvent,
  updateEvent,
} from "~/lib/actions/event.action";
import { deleteMedia, uploadMedia } from "~/lib/actions/upload.action";
import { getEventsQuery } from "~/lib/queries/events";
import Error from "~/components/error";
import usePaginate from "~/hooks/usePaginate";
import { SkeletonEventCard } from "~/components/skeleton";
import EventCard from "~/features/events/eventCard";
import Paginate from "~/components/paginate";
import AccessDenied from "~/components/rbac/AccessDenied";
import EventActions from "~/features/events/event-actions/eventActions";
import BatchDelete from "~/features/events/event-actions/batchDelete";
import ComingSoon from "~/components/comingSoon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Events - Manage BCC007 Team events" },
    {
      name: "description",
      content: "Events - Manage BCC007 Team events",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "";
  const id = url.searchParams.get("id") || "";
  const cookie = request.headers.get("Cookie") || "";
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const method = request.method;
  let imageUrl;
  let publicId;
  switch (method) {
    case "POST": {
      const featuredImage = data.featuredImage?.toString() || "";
      // Only upload if it's a new base64 image
      if (featuredImage.startsWith("data:")) {
        const uploadResponse = await uploadMedia({
          validated: {
            files: [featuredImage],
            folder: "BCCOO7Pay/events",
          },
          cookie,
        });
        if (uploadResponse.status !== 200) {
          return uploadResponse;
        }
        const uploadedImage = uploadResponse.body.data[0];
        imageUrl = uploadedImage.imageUrl;
        publicId = uploadedImage.publicId;
      }
      const response = await createEvent({
        cookie,
        validated: CreateEventSchema.parse({
          ...data,
          featuredImage: imageUrl,
          featuredImageId: publicId,
        }),
      });
      return response;
    }
    case "DELETE": {
      if (type === "delete") {
        const response = await deleteEvent({
          cookie,
          id: data.id as string,
        });
        return response;
      }
      if (type === "batchDelete") {
        const eventIds = JSON.parse(data.ids as string);
        const validated = BatchDeleteEventSchema.parse({ ids: eventIds });
        const response = await batchDeleteEvents({
          cookie,
          validated,
        });
        return response;
      }
    }
    case "PATCH": {
      const featuredImage = data.featuredImage?.toString() || "";
      const isBase64 = featuredImage.startsWith("data:");
      if (isBase64) {
        // Delete old featured image if it exists
        if (data.featuredImageId) {
          const deleteResponse = await deleteMedia({
            cookie,
            validated: { publicIds: [data.featuredImageId as string] },
          });
          if (deleteResponse.status !== 200) {
            return deleteResponse;
          }
        }
        // Upload new featured image
        const uploadResponse = await uploadMedia({
          validated: {
            files: [featuredImage],
            folder: "BCCOO7Pay/events",
          },
          cookie,
        });
        if (uploadResponse.status !== 200) {
          return uploadResponse;
        }
        const uploadedImage = uploadResponse.body.data[0];
        imageUrl = uploadedImage.imageUrl;
        publicId = uploadedImage.publicId;
      } else {
        // Keep existing image details if no new image was uploaded
        imageUrl = featuredImage;
        publicId = data.featuredImageId as string;
      }

      const response = await updateEvent({
        cookie,
        id: id as string,
        validated: UpdateEventSchema.parse({
          ...data,
          featuredImage: imageUrl,
          featuredImageId: publicId,
        }),
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
  const status = url.searchParams.get("status") as
    | "upcoming"
    | "ongoing"
    | "completed"
    | "cancelled"
    | undefined;
  const eventType = url.searchParams.get("eventType") as
    | "announcement"
    | "meeting"
    | "birthday"
    | "other"
    | undefined;
  const startDate = url.searchParams.get("startDate") || "";
  const endDate = url.searchParams.get("endDate") || "";
  const cookie = request.headers.get("Cookie") || "";
  await Promise.all([
    queryClient.prefetchQuery(
      getMembersQuery({
        cookie,
        page,
        limit: 100,
      }),
    ),
    queryClient.prefetchQuery(
      getEventsQuery({
        cookie,
        page,
        limit,
        query,
        status,
        eventType,
        startDate,
        endDate,
      }),
    ),
  ]);
  return { dehydratedState: dehydrate(queryClient) };
}

export default function Events() {
  const location = useLocation();
  const path = location.pathname === "/events";

  return (
    <PageWrapper>
      <PageSection index={0}>
        <PageTitle
          title="Events"
          subtitle="See and connect with BCC007 events"
        />
      </PageSection>
      {path ? <EventsLists /> : <Outlet />}
    </PageWrapper>
  );
}

function EventsLists() {
  const { data } = useSuspenseQuery(getMembersQuery({ page: 1, limit: 100 }));
  const { user } = useOutletContext() as { user: UserData };
  const [selected, setSelected] = useState<string[]>([]);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabQuery = searchParams.get("tab") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const query = searchParams.get("query") || "";
  const status = searchParams.get("status") as
    | "upcoming"
    | "ongoing"
    | "completed"
    | "cancelled"
    | undefined;
  const eventType = searchParams.get("eventType") as
    | "announcement"
    | "meeting"
    | "birthday"
    | "other"
    | undefined;
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const { data: eventsRes } = useSuspenseQuery(
    getEventsQuery({
      page,
      limit,
      query,
      status,
      eventType,
      startDate,
      endDate,
    }),
  );
  if (eventsRes.status !== 200) return <Error error={eventsRes?.body} />;
  const eventsData = eventsRes?.body?.data;
  const { events, pagination } = eventsData;
  const userRole = user?.role;
  //fetch members to use in create event
  const membersData = data?.body?.data;
  const { members } = membersData;
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
    if (hasPermission(userRole, "MANAGE_EVENTS")) {
      navigate(`/events?tab=${value}`);
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
              <TabsTrigger value="all" className="mr-6 cursor-pointer">
                All
              </TabsTrigger>
              <TabsTrigger value="actions" className="mr-6 cursor-pointer">
                Actions
              </TabsTrigger>
              <TabsTrigger value="options" className="mr-6 cursor-pointer">
                Options
              </TabsTrigger>
            </TabsList>
            <div className="absolute -bottom-px w-full mx-1 h-[2px] bg-gray-200 dark:bg-gray-600"></div>
          </div>
          <Card
            className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm py-2 transition-all duration-300 ease-in-out"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex gap-4 items-center px-2">
              <Search id="searchEvents" placeholder="Search events" />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="relative cursor-pointer rounded-sm"
                  onClick={() => setIsOpenFilter(!isOpenFilter)}
                >
                  <ListFilter /> Filter
                </Button>
                <Can user={user} permission="MANAGE_EVENTS">
                  <Separator orientation="vertical" />
                  <CreateEvent members={members} />
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
          {selected.length > 0 && (
            <BatchDelete selected={selected} setSelected={setSelected} />
          )}

          <TabsContent value={tabQuery} className="w-full">
            <Suspense fallback={<SkeletonEventCard />}>
              <Await
                resolve={events}
                children={(resolvedEvents) => (
                  <>
                    {tabQuery === "all" && (
                      <>
                        <EventCard eventsData={resolvedEvents} />
                      </>
                    )}
                    {tabQuery === "actions" && (
                      <>
                        <Can
                          user={user}
                          permission="MANAGE_EVENTS"
                          fallback={<AccessDenied />}
                        >
                          <EventActions
                            eventsData={resolvedEvents}
                            selected={selected}
                            setSelected={setSelected}
                            members={members}
                          />
                        </Can>
                      </>
                    )}
                    {tabQuery === "options" && <ComingSoon />}
                  </>
                )}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
        {events?.length > 0 && ["all", "actions"].includes(tabQuery) &&(
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
