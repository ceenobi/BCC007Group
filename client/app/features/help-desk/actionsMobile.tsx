import NotFound from "~/components/notFound";
import { PageSection } from "~/components/pageWrapper";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { getTicketStatusColor } from "~/lib/constants";
import type { TicketData, UserData } from "~/lib/dataSchema";
import { getPriorityColor } from "./ticketCard";
import { Separator } from "~/components/ui/separator";
import { hasPermission } from "~/lib/rbac";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Lock } from "lucide-react";
import { useFetcher } from "react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { getQueryClient } from "~/lib/queryClient";

export default function ActionsMobile({
  tickets,
  userRole,
  getMembers,
}: {
  tickets: TicketData[];
  userRole: string;
  getMembers: Partial<UserData>[];
}) {
  const fetcher = useFetcher();
  const queryClient = getQueryClient();
  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success(fetcher.data?.body?.message || "Ticket update successful");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
    }
  }, [fetcher.data]);

  const canManageTickets = hasPermission(userRole, "ASSIGN_TICKET");
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

  return (
    <>
      {tickets?.length === 0 ? (
        <NotFound message="No data found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets?.map((ticket, index) => (
            <PageSection key={ticket._id} index={index + 3}>
              <Card
                className={`relative rounded-sm hover:shadow-md transition-shadow dark:bg-lightBlue/20`}
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <CardContent className="p-4 sm:p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{ticket.ticketId}</h3>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getTicketStatusColor(ticket.status)} rounded-sm`}
                    >
                      {ticket.status.replace("-", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate">
                      {ticket.title}
                    </p>
                    <Badge
                      className={`text-xs ${getPriorityColor(ticket.priority)} rounded-sm`}
                    >
                      {ticket.priority.replace("-", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <h1 className="text-sm text-muted-foreground truncate">
                      Assigned To
                    </h1>
                    <p className="text-sm text-muted-foreground truncate">
                      {ticket.assignedTo?.name || "N/A"}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-4">
                    <Select
                      value={ticket.status}
                      onValueChange={(value) =>
                        handleStatusChange(value, ticket._id)
                      }
                    >
                      <SelectTrigger className="capitalize gap-2 w-full rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Update ticket status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-sm">
                        {["open", "in-progress", "resolved", "closed"]?.map(
                          (item) => (
                            <SelectItem
                              key={item}
                              value={item}
                              className="capitalize rounded-sm"
                            >
                              {item}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    {getMembers?.length > 0 && (
                      <>
                        {canManageTickets ? (
                          <Select
                            value={ticket.assignedTo?.id}
                            onValueChange={(value) =>
                              handleAssignedToChange(value, ticket._id)
                            }
                          >
                            <SelectTrigger className="gap-2 w-full rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
                              <SelectValue
                                placeholder={
                                  ticket.assignedTo?.name
                                    ? "Reassign"
                                    : "Assign issue"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="rounded-sm">
                              {getMembers?.map((item) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.id}
                                  className="capitalize rounded-sm"
                                >
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Lock />
                        )}
                      </>
                    )}
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
