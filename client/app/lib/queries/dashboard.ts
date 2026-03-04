import {
  getActivityTrends,
  getAnnouncements,
  getRecentActivities,
  getStats,
} from "../actions/dashboard.action";

export const getAnnouncementsQuery = ({ cookie }: { cookie?: string }) => ({
  queryKey: ["announcements"],
  queryFn: () => getAnnouncements({ cookie: cookie || "" }),
});

export const getActivityTrendsQuery = ({
  cookie,
  days,
}: {
  cookie?: string;
  days: number;
}) => ({
  queryKey: ["activity-trends", days],
  queryFn: () => getActivityTrends({ cookie: cookie || "", days }),
});

export const getStatsQuery = ({ cookie }: { cookie?: string }) => ({
  queryKey: ["dashboard-stats"],
  queryFn: () => getStats({ cookie: cookie || "" }),
});

export const getRecentActivitiesQuery = ({
  cookie,
  limit,
}: {
  cookie?: string;
  limit: number;
}) => ({
  queryKey: ["recent-activities", limit],
  queryFn: () => getRecentActivities({ cookie: cookie || "", limit }),
});
