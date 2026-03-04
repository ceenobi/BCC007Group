import { getEvents } from "../actions/event.action";

export const getEventsQuery = ({
  cookie,
  page,
  limit,
  query,
  status,
  eventType,
  startDate,
  endDate,
}: {
  cookie?: string;
  page: number;
  limit: number;
  query?: string;
  status?: "upcoming" | "ongoing" | "completed" | "cancelled";
  eventType?: "announcement" | "meeting" | "birthday" | "other";
  startDate?: string;
  endDate?: string;
}) => ({
  queryKey: [
    "events",
    page,
    limit,
    query,
    status,
    eventType,
    startDate,
    endDate,
  ],
  queryFn: () =>
    getEvents({
      cookie,
      page,
      limit,
      query,
      status,
      eventType,
      startDate,
      endDate,
    }),
});
