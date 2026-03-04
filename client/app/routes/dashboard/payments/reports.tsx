import { PageSection } from "~/components/pageWrapper";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Route } from "./+types/reports";
import { useNavigate, useOutletContext, useLocation } from "react-router";
import { hasPermission } from "~/lib/rbac";
import type { UserData } from "~/lib/dataSchema";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  paymentReportsQuery,
  paymentReportsUserQuery,
} from "~/lib/queries/payments";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import NotFound from "~/components/notFound";
import MonthlyBreakdown from "~/features/payments/monthlyBreakdown";
import MemberDues from "~/features/payments/memberDues";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Payment reports - Manage BCC007 Team payments" },
    {
      name: "description",
      content: "Payment reports - Manage BCC007 Team payments",
    },
  ];
}

export default function PaymentReports() {
  const { user } = useOutletContext() as { user: UserData };
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = user?.role;
  const tabQuery = location.pathname.split("/")[2] || "reports";
  const [period, setPeriod] = useState<"1w" | "1m" | "6m" | "1y" | "all">("1m");
  const [view, setView] = useState<"user" | "group">("user");
  const { data, isLoading, isError } = useQuery(
    view === "user"
      ? paymentReportsUserQuery({ period })
      : paymentReportsQuery({ period }),
  );

  const reportData = data?.body?.data || {};

  const handleReportView = (value: string) => {
    if (hasPermission(userRole, "VIEW_PAYMENTS") && value === "group") {
      setView("group");
    } else {
      setView("user");
    }
  };

  const handleTabSwitch = (value: string) => {
    if (value) {
      navigate(`/payments?tab=${value}`);
    }
  };

  return (
    <PageSection index={2} className="mt-6">
      <Tabs
        value={tabQuery}
        className="space-y-6"
        onValueChange={(value) => handleTabSwitch(value)}
      >
        <div className="relative">
          <TabsList variant="line" className="font-semibold relative z-10">
            <TabsTrigger value="user" className="mr-6 cursor-pointer">
              <span className="hidden md:inline">Payment</span> History
            </TabsTrigger>
            {hasPermission(userRole, "VIEW_PAYMENTS") && (
              <TabsTrigger value="group" className="mr-6 cursor-pointer">
                Group Payments
              </TabsTrigger>
            )}
            <TabsTrigger value="reports" className="mr-6 cursor-pointer">
              Reports
            </TabsTrigger>
          </TabsList>
          <div className="absolute -bottom-px w-full mx-1 h-[2px] bg-gray-200 dark:bg-gray-600"></div>
        </div>
      </Tabs>

      <div className="mt-4 flex flex-wrap justify-between gap-4 md:gap-0 my-4">
        <div className="flex gap-2">
          {["user", "group"].map((p) => (
            <button
              key={p}
              onClick={() => handleReportView(p)}
              className={`px-3 py-1 text-sm rounded transition-colors cursor-pointer ${view === p ? "bg-primary text-primary-foreground font-medium" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
            >
              {p === "user" ? "User" : "Group"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["1w", "1m", "6m", "1y", "all"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-3 py-1 text-sm rounded transition-colors cursor-pointer ${
                period === p
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {p === "1w"
                ? "1 Week"
                : p === "1m"
                  ? "1 Month"
                  : p === "6m"
                    ? "6 Months"
                    : p === "1y"
                      ? "1 Year"
                      : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError || !reportData ? (
        <>
          <NotFound message="No data found" />
        </>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              className="rounded-sm dark:bg-lightBlue/20"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reportData?.stats?.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData?.stats?.totalCount} total transactions
                </p>
              </CardContent>
            </Card>
            <Card
              className="rounded-sm dark:bg-lightBlue/20"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Successful Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                  {formatCurrency(reportData?.stats?.completedRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData?.stats?.completedCount} completed transactions
                </p>
              </CardContent>
            </Card>
            <Card
              className="rounded-sm dark:bg-lightBlue/20"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                  {formatCurrency(reportData?.stats?.pendingRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData?.stats?.pendingCount} pending transactions
                </p>
              </CardContent>
            </Card>
            <Card
              className="rounded-sm dark:bg-lightBlue/20"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData?.stats?.totalCount > 0
                    ? Math.round(
                        (reportData?.stats?.completedCount /
                          reportData?.stats?.totalCount) *
                          100,
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Of all initialized transactions
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card
              className="lg:col-span-2 rounded-sm dark:bg-lightBlue/20"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={reportData?.trends}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888888", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888888", fontSize: 12 }}
                      tickFormatter={(value) => `₦${value.toLocaleString()}`}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                      formatter={(value: any) => [
                        formatCurrency(Number(value)),
                        "Revenue",
                      ]}
                      labelStyle={{ color: "black" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#003e7d"
                      // className="fill-primary"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card
              className="rounded-sm dark:bg-lightBlue/20"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader>
                <CardTitle>By Payment Type</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex flex-col justify-center">
                {reportData?.typeBreakdown?.length > 0 ? (
                  <div className="w-full h-full min-w-0">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={0}
                    >
                      <PieChart>
                        <Pie
                          data={reportData?.typeBreakdown.map((d: any) => ({
                            name: d._id.replace("_", " "),
                            value: d.revenue,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {reportData?.typeBreakdown.map(
                            (entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ),
                          )}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) =>
                            formatCurrency(Number(value))
                          }
                        />
                        <Legend className="capitalize" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <MonthlyBreakdown
            monthlyBreakdown={reportData?.monthlyBreakdown}
            monthlySummary={reportData?.monthlySummary}
          />
          <MemberDues levyStats={reportData?.paymentStats} view={view}/>
        </div>
      )}
    </PageSection>
  );
}
