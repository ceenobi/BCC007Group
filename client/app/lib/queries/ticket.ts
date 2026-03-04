import { getTickets } from "../actions/ticket.action";

export const getTicketsQuery = ({
  cookie,
  page,
  limit,
  query,
  status,
  priority,
  category,
}: {
  cookie?: string;
  page: number;
  limit: number;
  query?: string;
  status?: "open" | "in-progress" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "critical";
  category?: "technical" | "event" | "payment" | "other";
}) => ({
  queryKey: [
    "tickets",
    page,
    limit,
    query,
    status,
    priority,
    category,
  ],
  queryFn: () =>
    getTickets({
      cookie,
      page,
      limit,
      query,
      status,
      priority,
      category,
    }),
});