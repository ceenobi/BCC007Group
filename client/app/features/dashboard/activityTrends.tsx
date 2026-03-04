"use client";

import { TrendingUp, Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import dayjs from "dayjs";

const chartConfig = {
  paymentCount: {
    label: "Payments",
    color: "var(--chart-1)",
  },
  eventCount: {
    label: "Events",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface ActivityTrend {
  date: string;
  totalAmount: number;
  transactionCount: number;
  paymentCount: number;
  eventCount: number;
  activityType: "payment" | "event" | "both";
}

export default function ActivityTrends({
  activityTrends,
}: {
  activityTrends: ActivityTrend[];
}) {
  // Calculate trend or summary info
  const totalPayments = activityTrends.reduce(
    (acc, curr) => acc + (curr.paymentCount || 0),
    0,
  );
  const totalEvents = activityTrends.reduce(
    (acc, curr) => acc + (curr.eventCount || 0),
    0,
  );

  return (
    <Card
      className="animate-in fade-in slide-in-from-left-4 duration-500 border-none shadow-none bg-transparent rounded-sm"
      style={{ animationDelay: "100ms" }}
    >
      <CardHeader className="px-4 pt-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">
              Activity Trends (7 days)
            </CardTitle>
            <CardDescription>
              Visualizing payments and events distribution over time
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <ChartContainer config={chartConfig} className="aspect-16/6 w-full">
          <AreaChart
            accessibilityLayer
            data={activityTrends}
            margin={{
              left: 0,
              right: 0,
              top: 40,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillPayment" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-paymentCount)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-paymentCount)"
                  stopOpacity={0.01}
                />
              </linearGradient>
              <linearGradient id="fillEvent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-eventCount)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-eventCount)"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted/50"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tickFormatter={(value) => dayjs(value).format("MMM DD")}
              className="text-muted-foreground font-medium"
            />
            <YAxis hide />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="eventCount"
              type="natural"
              fill="url(#fillEvent)"
              stroke="var(--color-eventCount)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="paymentCount"
              type="natural"
              fill="url(#fillPayment)"
              stroke="var(--color-paymentCount)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="p-4">
        <div className="flex w-full items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-1" />
              <span className="text-sm font-medium">
                {totalPayments} Payments
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-2" />
              <span className="text-sm font-medium">{totalEvents} Events</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            <span>Active Growth</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
