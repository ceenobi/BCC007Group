import { PageSection, PageWrapper } from "~/components/pageWrapper";
import type { Route } from "./+types/profile";
import PageTitle from "~/components/pageTitle";
import type { UserData } from "~/lib/dataSchema";
import { useNavigate, useOutletContext } from "react-router";
import { User } from "lucide-react";
import ImageComponent from "~/components/imageComponent";
import { formatDate } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Your Profile - Manage BCC007 Team profile" },
    {
      name: "description",
      content: "Your Profile - Manage BCC007 Team profile",
    },
  ];
}

export default function Profile() {
  const { user } = useOutletContext() as { user: UserData };
  const navigate = useNavigate();

  const redirect = () => {
    navigate("/payments?action=makePayment");
  };

  return (
    <PageWrapper>
      <PageSection index={0}>
        <div className="flex justify-between">
          <PageTitle title="Profile" subtitle="Your profile information" />
          <Button
            onClick={redirect}
            size="lg"
            className="rounded-sm bg-blue-500 hover:bg-blue-600 text-white hover:text-white cursor-pointer"
          >
            Make Payment
          </Button>
        </div>
      </PageSection>
      <PageSection index={1}>
        <div className="mt-6 space-y-4">
          <div>
            <h1 className="inline-flex items-center gap-1 text-lg font-medium text-gray-900 dark:text-white">
              <User />
              {user?.name}
            </h1>
            <p className="text-muted-foreground">Member ID: {user?.memberId}</p>
          </div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4 space-y-6">
              <PageSection index={2}>
                {user?.image ? (
                  <div className="aspect-square w-full h-[400px] rounded-sm">
                    <ImageComponent
                      cellValue={user?.image}
                      alt={user?.name}
                      classname="rounded-sm"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full h-[400px] rounded-sm border border-border">
                    <span className="w-full h-full rounded-sm flex items-center justify-center text-[100px]">
                      {user?.name
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
              <PageSection index={3}>
                <h1 className="text-lg font-semibold">Personal Information</h1>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-base font-medium">{user?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="text-base font-medium">
                      {user?.gender || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-base font-medium">
                      {user?.phone || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="text-base font-medium">
                      {user?.occupation || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Location
                    </p>
                    <p className="text-base font-medium">
                      {user?.location || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="text-base font-medium">{user?.role}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Birth Date</p>
                    <p className="text-base font-medium">
                      <span>
                        {user?.dateOfBirth
                          ? formatDate(user?.dateOfBirth as unknown as string)
                          : "N/A"}
                      </span>
                      {user?.disableBirthDate && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Birth year is hidden from other users
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </PageSection>
            </div>
          </div>
        </div>
      </PageSection>
    </PageWrapper>
  );
}
