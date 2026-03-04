import { apiClient } from "../apiClient";
import type { AssignRoleData } from "../dataSchema";

export const getMembers = async ({
  cookie,
  page,
  limit,
  query,
  gender,
  role,
}: {
  cookie?: string;
  page: number;
  limit: number;
  query?: string;
  gender?: string;
  role?: string;
}) => {
  const queryParams: any = {
    page,
    limit,
  };
  if (query) {
    queryParams.query = query;
  }
  if (gender) {
    queryParams.gender = gender;
  }
  if (role) {
    queryParams.role = role;
  }
  return await (apiClient.members.getMembers as any)({
    query: queryParams,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const getAMember = async ({
  cookie,
  id,
}: {
  cookie?: string;
  id: string;
}) => {
  return await (apiClient.members.getAMember as any)({
    params: {
      id,
    },
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const assignRole = async ({
  cookie,
  id,
  validated,
}: {
  cookie?: string;
  id: string;
  validated: AssignRoleData;
}) => {
  return await (apiClient.members.assignRole as any)({
    params: {
      id,
    },
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};
