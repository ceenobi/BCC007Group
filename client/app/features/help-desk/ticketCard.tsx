import type { FC } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Monitor,
  Smartphone,
  HelpCircle,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Link } from "react-router";
import type { TicketData } from "~/lib/dataSchema";
import { formatDate } from "~/lib/utils";
import { getTicketStatusColor, getTicketStatusIcon } from "~/lib/constants";

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "technical":
      return <Monitor className="h-4 w-4 text-blue-600" />;
    case "event":
      return <Calendar className="h-4 w-4 text-green-600" />;
    case "payment":
      return <CreditCard className="h-4 w-4 text-purple-600" />;
    case "other":
      return <Smartphone className="h-4 w-4 text-orange-600" />;
    case "general":
      return <HelpCircle className="h-4 w-4 text-gray-600" />;
    default:
      return <HelpCircle className="h-4 w-4 text-gray-600" />;
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-green-100 text-green-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "high":
      return "bg-orange-100 text-orange-700";
    case "critical":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const StatusIcon = ({ status }: { status: string | undefined }) => {
  const Icon = getTicketStatusIcon(status || "open");
  return <Icon className="h-4 w-4" />;
};

const TicketCard: FC<{
  ticket: TicketData;
  index?: number;
}> = ({ ticket, index = 0 }) => (
  <>
    <Card
      className="rounded-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-300 dark:bg-lightBlue/20"
      style={{ animationDelay: `${(index + 1) * 100}ms` }}
    >
      <CardContent className="px-4 py-2">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {getCategoryIcon(ticket.category)}
                <h3 className="font-medium truncate">{ticket.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                ID:{ticket.ticketId}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge
                className={`${getTicketStatusColor(ticket.status)} border text-xs`}
              >
                <div className="flex items-center gap-1">
                  <StatusIcon status={ticket.status || "open"} />
                  <span className="capitalize">{ticket.status}</span>
                </div>
              </Badge>
              <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                {ticket.priority.toUpperCase()}
              </Badge>
            </div>
          </div>

          <p className="text-sm line-clamp-2">{ticket.description}</p>

          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
            <span>
              Created {formatDate(ticket.createdAt as unknown as string)}
            </span>
            <Link
              to={`/members?query=${ticket?.userId?.name}`}
              className="hover:text-amber-600"
            >
              Ticket by {ticket?.userId?.name}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
            <span>
              Updated {formatDate(ticket.updatedAt as unknown as string)}
            </span>
            {ticket?.assignedTo && (
              <Link
                to={`/members?query=${ticket?.assignedTo?.name}`}
                className="hover:text-amber-600"
              >
                Assigned to {ticket?.assignedTo?.name}
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </>
);

export default TicketCard;
