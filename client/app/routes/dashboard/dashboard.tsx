import { Link, useOutletContext } from "react-router";
import type { UserData } from "~/lib/dataSchema";
import { PageSection, PageWrapper } from "~/components/pageWrapper";
import PageTitle from "~/components/pageTitle";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/dashboard";
import { getQueryClient } from "~/lib/queryClient";
import {
  getAnnouncementsQuery,
  getActivityTrendsQuery,
  getStatsQuery,
  getRecentActivitiesQuery,
} from "~/lib/queries/dashboard";
import { dehydrate, useSuspenseQuery } from "@tanstack/react-query";
import Calendar from "~/features/dashboard/calendar";
import ActivityTrends from "~/features/dashboard/activityTrends";
import { StatCards } from "~/features/dashboard/statCards";
import { RecentActivities } from "~/features/dashboard/recentActivities";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - View summary of activities" },
    { name: "description", content: "View dashboard summary" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const queryClient = getQueryClient();
  const cookie = request.headers.get("Cookie") || "";
  await Promise.all([
    queryClient.prefetchQuery(getAnnouncementsQuery({ cookie })),
    queryClient.prefetchQuery(getActivityTrendsQuery({ cookie, days: 7 })),
    queryClient.prefetchQuery(getStatsQuery({ cookie })),
    queryClient.prefetchQuery(getRecentActivitiesQuery({ cookie, limit: 10 })),
  ]);
  return { dehydratedState: dehydrate(queryClient) };
}

export default function Dashboard() {
  const { user } = useOutletContext() as { user: UserData };
  const { data: announcementsResponse } = useSuspenseQuery(
    getAnnouncementsQuery({}),
  );
  const { data: activityTrendsResponse } = useSuspenseQuery(
    getActivityTrendsQuery({ days: 7 }),
  );
  const { data: statsResponse } = useSuspenseQuery(getStatsQuery({}));
  const { data: activitiesResponse } = useSuspenseQuery(
    getRecentActivitiesQuery({ limit: 10 }),
  );

  const { events, eventsCount, users, usersCount } =
    announcementsResponse?.body?.data || {};

  const activityTrends = activityTrendsResponse?.body?.data || [];
  const stats = statsResponse?.body?.data;
  const activities = activitiesResponse?.body?.data || [];

  return (
    <PageWrapper>
      <PageSection index={0} className="space-y-6">
        <PageTitle
          title="Dashboard"
          subtitle="View summary of payments, transfers, and more"
        />

        {stats && (
          <PageSection index={1}>
            <StatCards stats={stats} />
          </PageSection>
        )}

        {!user?.isOnboarded && (
          <Alert className="max-w-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50 rounded-sm">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <Info />
                <div>
                  <AlertTitle>Complete your onboarding</AlertTitle>
                  <AlertDescription>
                    You are yet to complete your onboarding process, please
                    ensure you do so to enjoy all the features of our platform.
                  </AlertDescription>
                </div>
              </div>
              <Button
                asChild
                className="rounded-sm bg-lightBlue hover:bg-coolBlue dark:bg-amber-200 dark:hover:bg-amber-300"
              >
                <Link to="/members/onboarding?step=1">Finish Onboarding</Link>
              </Button>
            </div>
          </Alert>
        )}
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-4 sm:space-y-6">
            <PageSection index={2}>
              <ActivityTrends activityTrends={activityTrends} />
            </PageSection>

            <PageSection index={3}>
              <RecentActivities activities={activities} />
            </PageSection>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="xl:sticky xl:top-20 space-y-4 sm:space-y-6">
              <PageSection index={4}>
                <Calendar
                  users={users}
                  usersCount={usersCount}
                  events={events}
                  eventsCount={eventsCount}
                />
              </PageSection>
            </div>
          </div>
        </div>
      </PageSection>
    </PageWrapper>
  );
}
