import { getAMember, getMembers } from "../actions/member.action";

export const getMembersQuery = ({
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
}) => ({
  queryKey: ["members", page, limit, query, gender, role],
  queryFn: () => getMembers({ cookie, page, limit, query, gender, role }),
});

export const getAMemberQuery = ({
  cookie,
  id,
}: {
  cookie?: string;
  id: string;
}) => ({
  queryKey: ["member", id],
  queryFn: () => getAMember({ cookie, id }),
});
