import { useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import NotFound from "~/components/notFound";
import { PageSection } from "~/components/pageWrapper";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { paymentStatusColors } from "~/lib/constants";
import type { PaymentData, UserData } from "~/lib/dataSchema";
import { formatCurrency, formatDate } from "~/lib/utils";
import ViewPayment from "./viewPayment";

export default function UserCardView({
  payments,
  user,
  tabQuery,
}: {
  payments: PaymentData[];
  user: UserData;
  tabQuery: string;
}) {
  const fetcher = useFetcher();
  const isPending = fetcher.state !== "idle";

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
      {payments.length === 0 ? (
        <NotFound message="No payments found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {payments?.map((payment, index) => (
            <PageSection key={payment._id} index={index + 3}>
              <Card
                className={`relative rounded-sm hover:shadow-md transition-shadow dark:bg-lightBlue/20`}
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <CardContent className="p-4 sm:p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      <p className="dark:text-white">Reference:</p>
                      <p className="text-muted-foreground">
                        {payment.reference}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`px-2 py-0.5 rounded-sm text-[12px] font-medium border ${paymentStatusColors[payment.paymentStatus] || "bg-gray-100"}`}
                    >
                      {payment.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      <p className="dark:text-white">Payment Type:</p>
                      <p className="text-muted-foreground">
                        {payment.paymentType.replace("_", " ")}
                      </p>
                      {payment.isRecurring && (
                        <Badge
                          variant="outline"
                          className="capitalize ml-2 text-[10px] py-0 h-4 border-primary/20 text-primary"
                        >
                          Recurring
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">Amount:</p>
                      <p className="font-medium text-muted-foreground">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      <p className="dark:text-white">Date:</p>
                      <p className="text-muted-foreground">
                        {formatDate(payment.createdAt as string)}
                      </p>
                    </div>
                    {user.id === payment.userId && tabQuery === "user" && (
                      <>
                        {payment.isRecurring &&
                          payment.paymentStatus === "completed" && (
                            <fetcher.Form method="post">
                              <input
                                type="hidden"
                                name="intent"
                                value="cancel_subscription"
                              />
                              <input
                                type="hidden"
                                name="code"
                                value={payment.paystackSubscriptionId || ""}
                              />
                              <input
                                type="hidden"
                                name="token"
                                value={payment.paystackEmailToken || ""}
                              />
                              <input
                                type="hidden"
                                name="reference"
                                value={payment.reference}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-8"
                                disabled={isPending}
                              >
                                {isPending ? "Cancelling..." : "Cancel Plan"}
                              </Button>
                            </fetcher.Form>
                          )}
                      </>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <ViewPayment payment={payment} tabQuery={tabQuery} />
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          ))}
        </div>
      )}
    </>
  );
}
