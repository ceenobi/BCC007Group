import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Ticket,
  CreditCard,
} from "lucide-react";
import { cn } from "~/lib/utils";
import dayjs from "dayjs";

interface StatCardsProps {
  stats: {
    totalRevenue: number;
    revenueChange: number;
    activeSubscriptions: number;
    subscriptionsChange: number;
    openTickets: number;
    ticketsChange: number;
    pendingDues: number;
    duesChange: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const items = [
    {
      title: "Total Revenue",
      value: `₦${stats?.totalRevenue?.toLocaleString() || 0}`,
      description: "From this month's payments",
      icon: DollarSign,
      change: stats?.revenueChange,
      color: "text-emerald-500",
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions?.toString() || "0",
      description: "Members on recurring plans",
      icon: CreditCard,
      change: stats?.subscriptionsChange,
      color: "text-blue-500",
    },
    {
      title: "Open Tickets",
      value: stats?.openTickets?.toString() || "0",
      description: "Requiring attention",
      icon: Ticket,
      change: stats?.ticketsChange,
      color: "text-orange-500",
      inverse: true, // More tickets = bad
    },
    {
      title: `Pending Dues - ${dayjs().format("MMMM")}`,
      value: stats?.pendingDues?.toString() || "0",
      description: "Unpaid membership dues",
      icon: Users,
      change: stats?.duesChange,
      color: "text-rose-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <Card
          key={i}
          className="rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-500 dark:bg-lightBlue/20"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={cn("h-4 w-4", item.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="flex items-center space-x-2 mt-1">
              {item.change !== undefined && item.change !== 0 && (
                <span
                  className={cn(
                    "text-xs font-medium flex items-center",
                    item.change > 0
                      ? item.inverse
                        ? "text-rose-500"
                        : "text-emerald-500"
                      : item.inverse
                        ? "text-emerald-500"
                        : "text-rose-500",
                  )}
                >
                  {item.change > 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(item.change)}%
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {item.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
