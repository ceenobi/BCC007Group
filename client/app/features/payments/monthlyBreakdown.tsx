import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "~/lib/utils";
import { PageSection } from "~/components/pageWrapper";

export default function MonthlyBreakdown({
  monthlyBreakdown,
  monthlySummary,
}: {
  monthlyBreakdown: any[];
  monthlySummary: any;
}) {
  const chartData =
    monthlyBreakdown?.map((month: any) => ({
      name: month.month.substring(0, 3),
      amount: month.total,
      count: month.count,
    })) || [];
  return (
    <PageSection index={2}>
      <Card
        className="rounded-sm animate-in fade-in slide-in-from-left-4 duration-500 dark:bg-lightBlue/20"
        style={{ animationDelay: "100ms" }}
      >
        <CardHeader>
          <CardTitle>Your Payment Flow</CardTitle>
          <div className="flex justify-between">
            <p className="text-base text-muted-foreground font-medium">
              Total: {formatCurrency(monthlySummary?.total || 0)}
            </p>
            <p className="text-sm text-muted-foreground">
              Year: {monthlySummary?.year || new Date().getFullYear()}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#8884d8" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--muted-foreground)" }}
                tickLine={{ stroke: "var(--muted)" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "var(--muted-foreground)" }}
                tickLine={{ stroke: "var(--muted)" }}
                tickFormatter={(value) => `₦${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: "12px",
                }}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="amount"
                name="Amount (₦)"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PageSection>
  );
}
