import { apiClient } from "../apiClient";

export async function getAnnouncements({ cookie }: { cookie: string }) {
  return await (apiClient.dashboard.getAnnouncements as any)({
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function getActivityTrends({
  cookie,
  days,
}: {
  cookie: string;
  days: number;
}) {
  return await (apiClient.dashboard.getActivityTrends as any)({
    query: { days },
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function getStats({ cookie }: { cookie: string }) {
  return await (apiClient.dashboard.getStats as any)({
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function getRecentActivities({
  cookie,
  limit,
}: {
  cookie: string;
  limit: number;
}) {
  return await (apiClient.dashboard.getRecentActivities as any)({
    query: { limit },
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}
