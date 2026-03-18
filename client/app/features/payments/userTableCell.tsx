import { useCallback } from "react";
import { Badge } from "~/components/ui/badge";
import { paymentStatusColors } from "~/lib/constants";
import type { PaymentData } from "~/lib/dataSchema";
import { formatCurrency, formatDate } from "~/lib/utils";
import type { UserData } from "~/lib/dataSchema";
import ViewPayment from "./viewPayment";

export default function userTableCell({
  user,
  tabQuery,
}: {
  user: UserData;
  tabQuery: string;
}) {
  // const fetcher = useFetcher();
  // const isPending = fetcher.state !== "idle";

  // useEffect(() => {
  //   if (!fetcher.data) return;
  //   if (fetcher.data.status === 200) {
  //     toast.success(
  //       fetcher.data?.body?.message || "Subscription cancelled successfully",
  //     );
  //   } else if (fetcher.data.status !== 200) {
  //     toast.error(
  //       fetcher.data?.body?.message ||
  //         "Something went wrong! Please try again.",
  //     );
  //   }
  // }, [fetcher.data]);

  return useCallback(
    (item: PaymentData, columnKey: React.Key) => {
      const cellValue = item[columnKey as keyof PaymentData];
      switch (columnKey) {
        case "reference":
          return (
            <div className="dark:text-white flex flex-col">
              {cellValue as string}
              {tabQuery === "group" && (
                <span className="text-xs text-white/80">{item.userId.name}</span>
              )}
            </div>
          );
        case "paymentType":
          return (
            <div className="dark:text-white">
              {item.paymentType.replace("_", " ")}
              {item.isRecurring && (
                <Badge
                  variant="outline"
                  className="capitalize ml-2 text-[10px] py-0 h-4 border-primary/20 text-primary"
                >
                  Recurring
                </Badge>
              )}
            </div>
          );
        case "paymentStatus":
          return (
            <div className="dark:text-white">
              <Badge
                variant="secondary"
                className={`px-2 py-0.5 rounded-sm text-[12px] font-medium border ${paymentStatusColors[item.paymentStatus] || "bg-gray-100"}`}
              >
                {item.paymentStatus}
              </Badge>
            </div>
          );
        case "amount":
          return (
            <div className=" dark:text-white">
              {formatCurrency(cellValue as number)}
            </div>
          );
        case "createdAt":
          return (
            <div className="dark:text-white">
              {formatDate(cellValue as string)}
            </div>
          );
        case "action":
          return (
            <div className="flex items-center gap-2">
              <ViewPayment payment={item} tabQuery={tabQuery} />
              {/* {user?.id === item.userId && tabQuery === "user" && (
                <>
                  {item.isRecurring && item.paymentStatus === "completed" && (
                    <fetcher.Form method="post" action="/payments">
                      <input
                        type="hidden"
                        name="intent"
                        value="cancel_subscription"
                      />
                      <input
                        type="hidden"
                        name="code"
                        value={item.paystackSubscriptionId || ""}
                      />
                      <input
                        type="hidden"
                        name="token"
                        value={item.paystackEmailToken || ""}
                      />
                     
                      <input
                        type="hidden"
                        name="reference"
                        value={item.reference || ""}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-8"
                        disabled={isPending}
                        type="submit"
                      >
                        {isPending ? "Cancelling..." : "Cancel Plan"}
                      </Button>
                    </fetcher.Form>
                  )}
                </>
              )} */}
            </div>
          );
        default:
          return cellValue as React.ReactNode;
      }
    },
    [user, tabQuery],
  );
}
