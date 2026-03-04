import type { Route } from "./+types/layout";
import { Await, Outlet } from "react-router";
import { Suspense } from "react";
import SuspenseUi from "~/components/suspenseUi";
import useSidebar from "~/hooks/useSidebar";
import Sidebar from "~/components/sidebar";
import type { UserData } from "~/lib/dataSchema";
import Header from "~/components/header";
import { getQueryClient } from "~/lib/queryClient";
import { getTicketsQuery } from "~/lib/queries/ticket";
import { dehydrate, useSuspenseQuery } from "@tanstack/react-query";
import FloatMenu from "~/features/help-desk/floatMenu";
import { useSSE } from "~/hooks/useSSE";

import {
  authenticatedMiddleware,
  type RouterContext,
} from "~/middleware/auth.middleware";

export const middleware = [authenticatedMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const { user, cookie } = context as unknown as Required<
    Pick<RouterContext, "user" | "cookie">
  >;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    getTicketsQuery({
      cookie,
      page: 1,
      limit: 10,
    }),
  );

  return { user, dehydratedState: dehydrate(queryClient) };
}

export default function DashboardLayout({ loaderData }: Route.ComponentProps) {
  useSSE();
  const { user } = loaderData;
  const { data } = useSuspenseQuery(
    getTicketsQuery({
      page: 1,
      limit: 10,
    }),
  );
  const { isOpenSidebar, setIsOpenSidebar } = useSidebar();
  const ticketsData = data?.body?.data || {};
  const { summary } = ticketsData;
  return (
    <>
      <Suspense fallback={<SuspenseUi />}>
        <Await
          resolve={user}
          children={(user: UserData) => (
            <section className="min-h-dvh">
              <Sidebar
                isOpenSidebar={isOpenSidebar}
                setIsOpenSidebar={setIsOpenSidebar}
                userRole={user?.role as "member" | "admin" | "super_admin"}
              />
              <div
                className={`transition-all ease-in-out duration-500 ${isOpenSidebar ? "lg:ml-[200px]" : "lg:ml-[60px]"}`}
              >
                <Header user={user} isOpenSidebar={isOpenSidebar} />
                <Outlet context={{ user }} />
              </div>
            </section>
          )}
        />
      </Suspense>
      <FloatMenu summary={summary} />
    </>
  );
}
