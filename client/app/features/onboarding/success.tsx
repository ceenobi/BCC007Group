import type { UserData } from "~/lib/dataSchema";
import {
  useFetcher,
  type URLSearchParamsInit,
  useNavigate,
} from "react-router";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import ActionButton from "~/components/actionButton";
import { PageSection } from "~/components/pageWrapper";

export default function Success({
  user,
  setSearchParams,
}: {
  user: UserData;
  setSearchParams: (searchParams: URLSearchParamsInit) => void;
}) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.isOnboarded) return;
    fetcher.submit(
      {},
      { method: "patch", action: `/members/onboarding?step=4` },
    );
  }, [user.isOnboarded]);
  const isSubmitting = fetcher.state === "submitting";

  const goBack = () => {
    setSearchParams({ step: "3" });
  };

  return (
    <PageSection index={3}>
      <div className="flex items-center justify-center gap-2 w-full mb-8">
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <Loader className="animate-spin" />
            <p className="text-sm text-muted-foreground">
              Please wait while we complete your onboarding
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-8">
            {user?.isOnboarded ? (
              <div className="w-full h-[300px] mx-auto">
                <img
                  src="/Finishline.png"
                  alt="finish line by storeyset"
                  className="w-full h-full object-cover"
                />
                <p className="mt-2 text-muted-foreground text-center">
                  You're all set! You can now access all features of the app.
                </p>
              </div>
            ) : (
              <div className="w-full h-[200px] mx-auto">
                <img
                  src="/Finishline.png"
                  alt="finish line by storeyset"
                  className="w-full h-full object-cover"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Sorry, we couldn't complete your onboarding. Please try again
                  later.
                </p>
              </div>
            )}

            <div className="mt-12 md:mt-8 w-full flex flex-col-reverse sm:flex-row justify-center gap-4">
              <ActionButton
                text={"Back"}
                type="button"
                variant="outline"
                onClick={goBack}
                classname="w-full sm:w-auto rounded-sm text-xs font-medium py-4"
              />
              <ActionButton
                text={"Continue"}
                type="button"
                onClick={() => navigate("/dashboard")}
                classname="btnBlue"
              />
            </div>
          </div>
        )}
      </div>
    </PageSection>
  );
}
