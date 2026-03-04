import { apiClient } from "../apiClient";
import type { CreateTicketData, UpdateTicketData } from "../dataSchema";

export async function createTicket({
  validated,
  cookie,
}: {
  validated: CreateTicketData;
  cookie: string;
}) {
  return await (apiClient.tickets.createTicket as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function getTickets({
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
}) {
  const queryParams: any = {
    page,
    limit,
  };
  if (query) {
    queryParams.query = query;
  }
  if (status) {
    queryParams.status = status;
  }
  if (priority) {
    queryParams.priority = priority;
  }
  if (category) {
    queryParams.category = category;
  }
  return await (apiClient.tickets.getTickets as any)({
    query: queryParams,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export const updateTicket = async ({
  id,
  validated,
  cookie,
}: {
  id: string;
  validated: UpdateTicketData;
  cookie: string;
}) => {
  return await (apiClient.tickets.updateTicket as any)({
    params: {
      id,
    },
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};
