import { useFetcher, useSearchParams, Link } from "react-router";
import type { Route } from "./+types/verify";
import { useEffect } from "react";
import { toast } from "sonner";
import { PageSection } from "~/components/pageWrapper";
import { verifyPayment } from "~/lib/actions/paystack.action";
import { verifyPaymentSchema } from "~/lib/dataSchema";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  CreditCard,
  Loader,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Payment Verification - BCC007 Team" },
    {
      name: "description",
      content: "Verifying your payment status with BCC007",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const cookie = request.headers.get("Cookie") || "";
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const response = await verifyPayment({
      cookie,
      validated: verifyPaymentSchema.parse(data),
    });
    return response;
  } catch (error: any) {
    return { status: 400, body: { message: error.message } };
  }
}

export default function Verify() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const fetcher = useFetcher();
  const isSubmitting =
    fetcher.state === "submitting" || fetcher.state === "loading";
  const data = fetcher.data;

  useEffect(() => {
    if (reference && !data && !isSubmitting) {
      fetcher.submit(
        { reference },
        { method: "POST", action: "/payments/verify" },
      );
    }
  }, [reference, data, isSubmitting]);

  useEffect(() => {
    if (!data) return;
    if (data?.status === 200) {
      toast.success(data?.body?.message || "Payment verified successfully");
    } else if (data?.status >= 400) {
      toast.error(data?.body?.message || "Verification failed");
    }
  }, [data]);

  const paymentData = data?.body?.data;

  return (
    <PageSection
      index={0}
      className="mt-6 flex items-center justify-center h-full"
    >
      {isSubmitting ? (
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-4 h-4" />
          <p className="text-muted-foreground animate-pulse font-medium">
            Verifying your transaction...
          </p>
        </div>
      ) : (
        <div className="w-full max-w-lg mx-auto p-4">
          {!data ? (
            <PageSection index={1}>
              <Card className="border-dashed border-2 bg-muted/30 rounded-sm">
                <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                  <h2 className="text-xl font-semibold mb-2">
                    No Reference Found
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find a payment reference to verify.
                  </p>
                  <Button asChild variant="outline" className="rounded-sm">
                    <Link to="/payments">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Payments
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </PageSection>
          ) : data.status === 200 ? (
            <PageSection index={2}>
              <Card className="overflow-hidden border-none shadow bg-white/80 dark:bg-deepBlue/80 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 p-0 rounded-sm">
                <div className="h-2 bg-linear-to-r from-emerald-400 to-cyan-400" />
                <CardHeader className="text-center pt-4">
                  <div className="mx-auto w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50/50 dark:ring-emerald-500/5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
                    Payment Successful
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Your transaction has been confirmed
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 px-8">
                  <div className="rounded-sm bg-muted/50 p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-mono font-medium">
                        {paymentData?.reference}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-bold text-lg">
                        ₦{paymentData?.amount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Completed
                      </span>
                    </div>
                    {paymentData?.paymentType && (
                      <div className="flex justify-between text-sm capitalize">
                        <span className="text-muted-foreground">
                          Payment Type
                        </span>
                        <span className="font-medium">
                          {paymentData.paymentType.replace("_", " ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                      A confirmation email has been sent to your inbox.
                    </p>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-3 p-4">
                    <Button
                      asChild
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow shadow-emerald-500/20 py-4 rounded-sm"
                    >
                      <Link to="/payments">View Payment History</Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground rounded-sm"
                    >
                      <Link to="/help-desk">Need help? Contact Support</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          ) : (
            <PageSection index={3}>
              <Card className="overflow-hidden border-none shadow bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 p-0 rounded-sm">
                <div className="h-2 bg-velvet" />
                <CardHeader className="text-center pt-4">
                  <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50 dark:ring-red-500/5">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                    Verification Failed
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {data.body?.message ||
                      "There was an issue verifying your payment."}
                  </p>
                  <Separator />
                  <div className="flex flex-col gap-3 p-4">
                    <Button
                      asChild
                      className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 py-4 rounded-sm"
                    >
                      <Link to="/payments">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Payments
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </PageSection>
          )}
        </div>
      )}
    </PageSection>
  );
}
