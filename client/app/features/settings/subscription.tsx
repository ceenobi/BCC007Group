import { AlertTriangleIcon, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import ActionButton from "~/components/actionButton";
import Modal from "~/components/modal";
import { PageSection } from "~/components/pageWrapper";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { PaymentData } from "~/lib/dataSchema";

export default function Subscription({ sub }: { sub: PaymentData }) {
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();
  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.status === 200) {
      toast.success(
        fetcher.data?.body?.message || "Subscription cancelled successfully",
      );
    } else if (fetcher.data.status !== 200) {
      toast.error(
        fetcher.data?.body?.message ||
          "Something went wrong! Please try again.",
      );
    }
  }, [fetcher.data]);

  return (
    <>
      <div className="space-y-6">
        <PageSection index={7}>
          <Card
            className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-0 transition-all duration-300 ease-in-out"
            style={{ animationDelay: "100ms" }}
          >
            <div className="bg-slate-50 dark:bg-lightBlue/20 p-4 border-b">
              <h1 className="font-semibold text-lg">Membership Subscription</h1>
              <p className="text-muted-foreground">
                Cancel your membership dues monthly subscription.
              </p>
            </div>
            <div className="grid grid-cols-1 px-4 py-6 text-gray-900 dark:text-white">
              {!sub ? (
                <p>No subscription found</p>
              ) : (
                <div className="space-y-4">
                  <p>
                    You are currently subscribed to the monthly membership dues
                    levy.
                  </p>
                  <Button
                    variant="outline"
                    className="btnRed cursor-pointer"
                    onClick={() => setIsOpen(true)}
                  >
                    Unsubscribe
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </PageSection>
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="py-4">
          <div className="flex flex-col items-center w-full">
            <AlertTriangleIcon size={20} className="text-red-500" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Confirm Cancellation
            </h1>
            <p className="text-center text-muted-foreground">
              Your monthly levy fees will no longer be auto deducted
            </p>
            <p className="font-semibold text-center text-gray-900 dark:text-muted-foreground">
              Are you sure you want to continue?
            </p>
          </div>
          <Separator className="my-4" />
          <div className="px-4 mt-4 flex gap-4 justify-center">
            <ActionButton
              type="button"
              text="Cancel"
              classname="w-fit sm:w-auto text-xs font-medium py-4 border-blue-500 text-blue-500 hover:text-blue-500"
              onClick={() => setIsOpen(false)}
              variant="outline"
            />
            <ActionButton
              type="button"
              text="Unsubscribe"
              loading={fetcher.state === "submitting"}
              children={<Loader className="animate-spin" />}
              classname="w-fit sm:w-auto py-4 bg-red-500 hover:bg-red-600 text-white hover:text-white"
              onClick={() => {
                fetcher.submit(
                  {
                    intent: "cancel_subscription",
                    code: sub?.paystackSubscriptionId || "",
                    token: sub.paystackEmailToken || "",
                    reference: sub?.reference || "",
                  },
                  {
                    method: "post",
                    action: "/payments",
                  },
                );
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
