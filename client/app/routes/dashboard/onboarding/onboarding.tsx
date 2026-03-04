import { useOutletContext, useSearchParams } from "react-router";
import {
  createBankAccountSchema,
  UpdateUserSchema,
  type UserData,
} from "~/lib/dataSchema";
import { PageSection, PageWrapper } from "~/components/pageWrapper";
import PageTitle from "~/components/pageTitle";
import UploadAvatar from "~/features/onboarding/uploadAvatar";
import UpdateProfile from "~/features/onboarding/updateProfile";
import { useEffect, useState } from "react";
import type { Route } from "./+types/onboarding";
import { completeOnboarding, updateUser } from "~/lib/actions/auth.action";
import { getQueryClient } from "~/lib/queryClient";
import { dehydrate, useSuspenseQuery } from "@tanstack/react-query";
import UpdateBank from "~/features/onboarding/updateBank";
import { getBankDetailsQuery } from "~/lib/queries/bankDetail";
import { listBanksQuery } from "~/lib/queries/paystack";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { AlertTriangleIcon, BadgeCheck } from "lucide-react";
import { addBankAccount } from "~/lib/actions/bankDetail-action";
import Success from "~/features/onboarding/success";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Onboarding | BCC007 Pay" },
    { name: "description", content: `Onboarding | BCC007 Pay` },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const step = url.searchParams.get("step") || "";
  const cookie = request.headers.get("Cookie") || "";
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const method = request.method;
  switch (method) {
    case "PATCH":
      if (step === "2") {
        const response = await updateUser({
          validated: UpdateUserSchema.parse(data),
          cookie,
        });
        return response;
      }
      if (step === "4") {
        const response = await completeOnboarding({ cookie });
        return response;
      }
    case "POST":
      if (step === "3") {
        const response = await addBankAccount({
          validated: createBankAccountSchema.parse(data),
          cookie,
        });
        return response;
      }
    default:
      return null;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const queryClient = getQueryClient();
  const cookie = request.headers.get("Cookie") || "";
  await Promise.all([
    queryClient.prefetchQuery(getBankDetailsQuery({ cookie })),
    queryClient.prefetchQuery(listBanksQuery({ cookie })),
  ]);
  return { dehydratedState: dehydrate(queryClient) };
}

export default function Onboarding() {
  const { data } = useSuspenseQuery(getBankDetailsQuery({}));
  const { user } = useOutletContext() as { user: UserData };
  const [searchParams, setSearchParams] = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [progressColor, setProgressColor] = useState("bg-gray-500");
  const step = searchParams.get("step") || "1";
  const bankDetails = data?.body?.data;

  const avatarCompleted = user?.image ? true : false;
  const userProfileCompleted =
    user?.phone && user?.occupation && user?.location ? true : false;

  const bankAccountCompleted =
    bankDetails?.bankAccountName && bankDetails?.bankAccountNumber
      ? true
      : false;
  const onboardingCompleted = user?.isOnboarded ? true : false;

  useEffect(() => {
    if (
      avatarCompleted &&
      !userProfileCompleted &&
      !bankAccountCompleted &&
      !onboardingCompleted
    ) {
      setProgress(25);
      setProgressColor("bg-yellow-500");
    } else if (
      avatarCompleted &&
      userProfileCompleted &&
      !onboardingCompleted
    ) {
      setProgress(50);
      setProgressColor("bg-amber-500");
    } else if (
      avatarCompleted &&
      bankAccountCompleted &&
      !onboardingCompleted
    ) {
      setProgress(75);
      setProgressColor("bg-green-300");
    } else if (onboardingCompleted) {
      setProgress(100);
      setProgressColor("bg-green-500");
    }
  }, [
    avatarCompleted,
    onboardingCompleted,
    userProfileCompleted,
    bankAccountCompleted,
  ]);

  return (
    <PageWrapper>
      <PageSection index={0}>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <PageTitle
              title="Welcome aboard!"
              subtitle="We are thrilled to have you on our platform. This app is your go-to place for all important BCC007 team information."
            />
            <div>
              <h1 className="text-lg font-semibold">Step {step}</h1>
              <p className="text-muted-foreground font-medium">
                Follow the steps below to get started with our platform.
              </p>
            </div>
            <div className="space-y-6">
              {step === "1" && (
                <UploadAvatar user={user} setSearchParams={setSearchParams} />
              )}
              {step === "2" && (
                <UpdateProfile user={user} setSearchParams={setSearchParams} />
              )}
              {step === "3" && (
                <UpdateBank
                  setSearchParams={setSearchParams}
                  bankDetails={bankDetails}
                />
              )}
              {step === "4" && (
                <Success user={user} setSearchParams={setSearchParams} />
              )}
            </div>
            <Alert className="mt-6 rounded-sm border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
              <AlertTriangleIcon />
              <AlertTitle>Security Alert</AlertTitle>
              <AlertDescription>
                Prevent attacks on your account. Ensure you update your password
                to keep it secure. Kindly head to settings to do so.
              </AlertDescription>
            </Alert>
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <PageSection index={1} className="lg:sticky lg:top-20">
              <Card className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm">
                <CardContent className="p-4 text-start space-y-4">
                  <h3 className="text-lg font-semibold">Your progress</h3>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={progress}
                      className="h-1.5 rounded-sm"
                      indicatorClassName={progressColor}
                    />
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <BadgeCheck
                        className={
                          avatarCompleted ? "h-4 w-4 text-green-500" : "h-4 w-4"
                        }
                      />
                      <span className="text-sm font-medium">Upload photo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck
                        className={
                          userProfileCompleted
                            ? "h-4 w-4 text-green-500"
                            : "h-4 w-4"
                        }
                      />
                      <span className="text-sm font-medium">
                        Update profile
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck
                        className={
                          bankAccountCompleted
                            ? "h-4 w-4 text-green-500"
                            : "h-4 w-4"
                        }
                      />
                      <span className="text-sm font-medium">
                        Update bank details
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck
                        className={
                          onboardingCompleted
                            ? "h-4 w-4 text-green-500"
                            : "h-4 w-4"
                        }
                      />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          </div>
        </div>
      </PageSection>
    </PageWrapper>
  );
}
