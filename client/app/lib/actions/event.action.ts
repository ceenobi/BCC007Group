import { apiClient } from "../apiClient";
import type {
  BatchDeleteEventData,
  CreateEventData,
  UpdateEventData,
} from "../dataSchema";

export async function createEvent({
  validated,
  cookie,
}: {
  validated: CreateEventData;
  cookie: string;
}) {
  return await (apiClient.events.createEvent as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export async function getEvents({
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
  if (eventType) {
    queryParams.eventType = eventType;
  }
  if (startDate) {
    queryParams.startDate = startDate;
  }
  if (endDate) {
    queryParams.endDate = endDate;
  }
  return await (apiClient.events.getEvents as any)({
    query: queryParams,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}

export const deleteEvent = async ({
  id,
  cookie,
}: {
  id: string;
  cookie?: string;
}) => {
  return await (apiClient.events.deleteEvent as any)({
    params: {
      id,
    },
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const batchDeleteEvents = async ({
  cookie,
  validated,
}: {
  cookie?: string;
  validated: BatchDeleteEventData;
}) => {
  return await (apiClient.events.batchDeleteEvents as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const updateEvent = async ({
  id,
  validated,
  cookie,
}: {
  id: string;
  validated: UpdateEventData;
  cookie: string;
}) => {
  return await (apiClient.events.updateEvent as any)({
    params: {
      id,
    },
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};
