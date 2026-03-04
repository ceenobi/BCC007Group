import { Suspense, useCallback, useEffect, useMemo } from "react";
import { SkeletonTable } from "~/components/skeleton";
import TableView from "~/components/tableView";
import { Badge } from "~/components/ui/badge";
import { getTicketStatusColor } from "~/lib/constants";
import type { TicketData, UserData } from "~/lib/dataSchema";
import { formatDate } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getPriorityColor } from "./ticketCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { CheckCircle2Icon, Lock } from "lucide-react";
import { getMembersQuery } from "~/lib/queries/members";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { getQueryClient } from "~/lib/queryClient";
import { hasPermission } from "~/lib/rbac";
import ActionsMobile from "./actionsMobile";
import { Card, CardContent } from "~/components/ui/card";

export default function Actions({
  tickets,
  userRole,
}: {
  tickets: TicketData[];
  userRole: string;
}) {
  const { data } = useSuspenseQuery(getMembersQuery({ page: 1, limit: 100 }));
  const membersData = data?.body?.data;
  const members = membersData?.members;
  const getMembers = useMemo(() => {
    if (!Array.isArray(members)) return [];
    return members
      .filter((item) => item.role === "admin")
      .map((member: any) => ({
        name: member?.name,
        id: member?.id,
      }));
  }, [members]);

  return (
    <Suspense fallback={<SkeletonTable />}>
      <>
        <div className="hidden xl:block space-y-4">
          <Alert className="rounded-sm border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <CheckCircle2Icon />
            <AlertTitle>Toggle status to update ticket issue</AlertTitle>
          </Alert>
          <Card className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-4">
            <CardContent className="p-0 text-start">
              <TableView
                tableColumns={[
                  { name: "TICKET ID", uid: "ticketId" },
                  { name: "TITLE", uid: "title" },
                  { name: "DATE", uid: "createdAt" },
                  { name: "PRIORITY", uid: "priority" },
                  { name: "STATUS", uid: "status" },
                  { name: "CATEGORY", uid: "category" },
                  { name: "ASSIGNED TO", uid: "assignedTo" },
                  { name: "ACTION", uid: "action" },
                ]}
                tableData={tickets}
                renderCell={RenderCell({ getMembers, userRole })}
              />
            </CardContent>
          </Card>
        </div>
        <div className="xl:hidden">
          <ActionsMobile
            tickets={tickets}
            userRole={userRole}
            getMembers={getMembers}
          />
        </div>
      </>
    </Suspense>
  );
}

function RenderCell({
  getMembers,
  userRole,
}: {
  getMembers: Partial<UserData>[];
  userRole: string;
}) {
  const fetcher = useFetcher();
  const queryClient = getQueryClient();
  const canManageTickets = hasPermission(userRole, "ASSIGN_TICKET");

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success(fetcher.data?.body?.message || "Ticket update successful");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
    }
  }, [fetcher.data]);

  const isSubmitting = fetcher.state === "submitting";

  const handleAssignedToChange = (value: string, id: string) => {
    fetcher.submit(
      {
        assignedTo: value,
      },
      {
        method: "patch",
        action: `/help-desk?id=${id}`,
      },
    );
  };

  const handleStatusChange = (status: string, id: string) => {
    fetcher.submit(
      {
        status,
      },
      {
        method: "patch",
        action: `/help-desk?id=${id}`,
      },
    );
  };

  return useCallback(
    (item: TicketData, columnKey: React.Key) => {
      const cellValue = item[columnKey as keyof TicketData];
      switch (columnKey) {
        case "ticketId":
          return (
            <div className="font-medium dark:text-white truncate">
              {cellValue}
            </div>
          );
        case "title":
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-medium dark:text-white truncate">
                  <p>{cellValue}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        case "createdAt":
          return (
            <div className="font-medium dark:text-white">
              {formatDate(cellValue as string)}
            </div>
          );
        case "priority":
          return (
            <Badge className={`text-xs ${getPriorityColor(cellValue)}`}>
              {cellValue.replace("-", " ").toUpperCase()}
            </Badge>
          );
        case "status":
          return (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      variant="outline"
                      className={`cursor-pointer text-xs ${getTicketStatusColor(cellValue)}`}
                    >
                      {cellValue.replace("-", " ").toUpperCase()}
                    </Badge>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to update status</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent>
                <DropdownMenuLabel>Update status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={cellValue === "open"}
                  onClick={() => handleStatusChange("open", item._id)}
                >
                  Open
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cellValue === "in-progress"}
                  onClick={() => handleStatusChange("in-progress", item._id)}
                >
                  In Progress
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cellValue === "resolved"}
                  onClick={() => handleStatusChange("resolved", item._id)}
                >
                  Resolved
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cellValue === "closed"}
                  onClick={() => handleStatusChange("closed", item._id)}
                >
                  Closed
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        case "category":
          return (
            <div className="capitalize font-medium dark:text-white">
              {cellValue.replace("-", " ")}
            </div>
          );
        case "assignedTo":
          return (
            <div className="font-medium dark:text-white truncate">
              {item.assignedTo?.name || "N/A"}
            </div>
          );
        case "action":
          return (
            <div className="flex gap-3 items-center">
              {canManageTickets ? (
                <Select
                  value={item.assignedTo?.id}
                  onValueChange={(value) =>
                    handleAssignedToChange(value, item._id)
                  }
                >
                  <SelectTrigger className="gap-2 w-fit rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
                    <SelectValue
                      placeholder={
                        item.assignedTo?.name ? "Reassign" : "Assign issue"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getMembers?.map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.id}
                        className="capitalize"
                      >
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Lock />
              )}
            </div>
          );
        default:
          return cellValue as React.ReactNode;
      }
    },
    [getMembers],
  );
}
