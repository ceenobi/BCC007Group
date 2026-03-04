import { dehydrate, useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useOutletContext } from "react-router";
import Error from "~/components/error";
import { getAMemberQuery } from "~/lib/queries/members";
import { getQueryClient } from "~/lib/queryClient";
import type { Route } from "./+types/member";
import { Suspense } from "react";
import SuspenseUi from "~/components/suspenseUi";
import { Button } from "~/components/ui/button";
import { User } from "lucide-react";
import { PageSection } from "~/components/pageWrapper";
import ImageComponent from "~/components/imageComponent";
import { formatDate, formatDayMonth } from "~/lib/utils";
import type { UserData } from "~/lib/dataSchema";

export function meta({ params }: Route.MetaArgs) {
  const { name } = params;
  return [
    { title: `Member: ${name || "Member"}` },
    { name: "description", content: "View member details" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { id } = params;
  const queryClient = getQueryClient();
  const cookie = request.headers.get("Cookie") || "";
  await queryClient.prefetchQuery(getAMemberQuery({ cookie, id }));
  return { dehydratedState: dehydrate(queryClient) };
}
export default function Member() {
  const { user } = useOutletContext() as { user: UserData };
  const { id, name } = useParams();
  const { data } = useSuspenseQuery(getAMemberQuery({ id: id || "" }));
  if (data.status !== 200) return <Error error={data?.body} />;
  const memberData = data?.body?.data || {};

  return (
    <Suspense fallback={<SuspenseUi />}>
      <PageSection index={0} className="my-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User />
            <h2 className="text-xl font-bold">{name}</h2>
          </div>
          {user.id !== id && memberData?.phone && (
            <Button
              variant="link"
              className="text-green-600 hover:text-green-700"
              asChild
            >
              <a
                href={`https://wa.me/${memberData?.phone?.slice(1)}?text=Hello ${memberData?.name}, This is ${user.name} from BCC007Team.`}
                target="_blank"
                className="hover:underline"
              >
                Chat on WhatsApp
              </a>
            </Button>
          )}
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 space-y-6">
            <PageSection index={1}>
              {memberData?.image ? (
                <div className="aspect-square w-full h-[400px] rounded-sm">
                  <ImageComponent
                    cellValue={memberData?.image}
                    alt={memberData?.name}
                    classname="rounded-sm"
                  />
                </div>
              ) : (
                <div className="aspect-square w-full h-[400px] rounded-sm border border-border">
                  <span className="w-full h-full rounded-sm flex items-center justify-center text-[100px]">
                    {memberData?.name
                      ?.split(" ")
                      .map((name: string) => name[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
              )}
            </PageSection>
          </div>
          <div className="col-span-12 md:col-span-8 space-y-6 border border-border rounded-sm p-4 bg-slate-50/40 dark:bg-coolBlue/40">
            <PageSection index={2}>
              <h1 className="text-lg font-semibold">Personal Information</h1>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-base font-medium">{memberData?.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="text-base font-medium">
                    {memberData?.gender || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base font-medium">{memberData?.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-base font-medium">
                    {memberData?.phone || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Occupation</p>
                  <p className="text-base font-medium">
                    {memberData?.occupation || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Location
                  </p>
                  <p className="text-base font-medium">
                    {memberData?.location || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="text-base font-medium">{memberData?.role}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Birth Date</p>
                  <p className="text-base font-medium">
                    <>
                      {memberData?.disableBirthDate && (
                        <span>
                          {memberData?.dateOfBirth
                            ? formatDayMonth(memberData?.dateOfBirth)
                            : "N/A"}
                        </span>
                      )}
                      {!memberData?.disableBirthDate && (
                        <span>
                          {memberData?.dateOfBirth
                            ? formatDate(memberData?.dateOfBirth)
                            : "N/A"}
                        </span>
                      )}
                    </>
                  </p>
                </div>
              </div>
            </PageSection>
          </div>
        </div>
      </PageSection>
    </Suspense>
  );
}
