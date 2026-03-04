import { PageSection } from "~/components/pageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { formatCurrency, formatDate } from "~/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  TrendingUp,
} from "lucide-react";

export default function MemberDues({
  levyStats,
  view,
}: {
  levyStats: any;
  view: "user" | "group";
}) {
  if (!levyStats) return null;
  const {
    yearlyDues = 0,
    totalPaidThisYear = 0,
    monthsPaid = 0,
    paymentPercentage = 0,
    isUpToDate = false,
    cycleStart,
    cycleEnd,
    lastMonthlyDuesPaid,
  } = levyStats;

  return (
    <PageSection index={3}>
      <Card
        className="rounded-sm animate-in fade-in slide-in-from-left-4 duration-500 dark:bg-lightBlue/20 overflow-hidden"
        style={{ animationDelay: "150ms" }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {view === "user" ? "Member Dues Statistics" : "Group Dues Statistics"}
            </CardTitle>
            <Badge
              variant={isUpToDate ? "default" : "destructive"}
              className="px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            >
              {isUpToDate ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Up to Date
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Behind
                </span>
              )}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 italic">
            Rolling 12-month membership dues cycle
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                Payment Progress
              </span>
              <span className="text-2xl font-bold text-primary">
                {Math.round(paymentPercentage)}%
              </span>
            </div>
            <Progress
              value={paymentPercentage}
              className="h-3 rounded-full bg-muted/50"
              indicatorClassName={isUpToDate ? "bg-primary" : "bg-yellow-500"}
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Total Paid
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-500">
                {formatCurrency(totalPaidThisYear)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                of {formatCurrency(yearlyDues)} target
              </p>
            </div>

            <div className="p-4 rounded-lg bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Months Covered
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold">{monthsPaid}</p>
                <p className="text-sm text-muted-foreground">/ 12</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">
                Completed Payments
              </p>
            </div>

            <div className="p-4 rounded-lg bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Current Cycle
              </p>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                {cycleStart ? formatDate(cycleStart) : "N/A"}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Ending: {cycleEnd ? formatDate(cycleEnd) : "N/A"}
              </p>
            </div>
          </div>

          {/* Footer Info */}
          {lastMonthlyDuesPaid && (
            <div className="pt-2 flex items-center justify-end text-[11px] text-muted-foreground">
              <span className="px-2 py-0.5 rounded-full bg-muted/30">
                Last dues payment on{" "}
                {formatDate(lastMonthlyDuesPaid?.createdAt || lastMonthlyDuesPaid)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </PageSection>
  );
}
