import { ArrowRight, Calendar1 } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { formatTime } from "~/lib/utils";

interface calendarProps {
  events: {
    description?: string;
    date?: string;
    _id?: string;
    daysUntilEvent?: number;
    eventType?: string;
    title?: string;
  }[];
  eventsCount: number;
  users: {
    name: string;
    dateOfBirth: string;
    image: string;
    _id: string;
    daysUntilBirthday: number;
  }[];
  usersCount: number;
}

export default function Calendar({
  events,
  eventsCount,
  users,
  usersCount,
}: calendarProps) {
  const calendarEvents = events?.length > 0 ? [...users, ...events] : [];

  const getEventBgColor = (type: string) => {
    switch (type) {
      case "event":
        return "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/10 dark:border-blue-500/30";
      case "birthday":
        return "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/10 dark:border-rose-500/30";
      case "announcement":
        return "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10 dark:border-amber-500/30";
      case "meeting":
        return "bg-violet-500/5 dark:bg-violet-500/10 border-violet-500/10 dark:border-violet-500/30";
      default:
        return "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/10 dark:border-rose-500/30";
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "event":
        return "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-300 dark:bg-blue-100 dark:text-blue-800";
      case "birthday":
        return "border-rose-600 bg-rose-50 text-rose-700 dark:border-rose-300 dark:bg-rose-100 dark:text-rose-800";
      case "announcement":
        return "border-amber-600 bg-amber-50 text-amber-700 dark:border-amber-300 dark:bg-amber-100 dark:text-amber-800";
      case "meeting":
        return "border-violet-600 bg-violet-50 text-violet-700 dark:border-violet-300 dark:bg-violet-100 dark:text-violet-800";
      default:
        return "border-rose-600 bg-rose-50 text-rose-700 dark:border-rose-300 dark:bg-rose-100 dark:text-rose-800";
    }
  };
  return (
    <>
      <div className="overflow-y-auto h-auto border rounded-sm">
        <Card
          className="rounded-sm animate-in fade-in slide-in-from-left-4 duration-500 dark:bg-lightBlue/20"
          style={{ animationDelay: "100ms" }}
        >
          <CardHeader className="flex flex-col flex-wrap sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0 pb-2">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar1 className="h-5 w-5" />
                Group Calendar
              </CardTitle>
              <Link to="/events" className="w-fit sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-fit sm:w-auto cursor-pointer"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              Upcoming events, birthdays, and anniversaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calendarEvents?.length > 0 ? (
              <>
                {calendarEvents?.map((item: any) => (
                  <div
                    key={item._id}
                    className={`my-2 p-3 rounded-sm border ${getEventBgColor(item.eventType)}`}
                  >
                    {item?.name ? (
                      <div className="flex items-start">
                        <div className="flex flex-1 items-center gap-2">
                          {item?.image ? (
                            <img
                              src={item?.image}
                              alt={item?.name}
                              className="w-9 h-9 rounded-full"
                            />
                          ) : (
                            <span className="w-9 h-9 rounded-full border-2 border-border transition-colors flex items-center justify-center">
                              {item?.name
                                ?.split(" ")
                                .map((name: string) => name[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          )}
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold">
                              {item?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item?.daysUntilBirthday === 1
                                ? "Tomorrow"
                                : item?.daysUntilBirthday === 0
                                  ? "Today"
                                  : `In ${item?.daysUntilBirthday} days`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={getEventBadgeColor(item.eventType)}
                          >
                            {item?.eventType || "Birthday"}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <div className="flex flex-1 items-center gap-2">
                          {item?.organizerInfo?.image ? (
                            <img
                              src={item?.organizerInfo?.image}
                              alt={item?.organizerInfo?.name}
                              className="w-9 h-9 rounded-full"
                            />
                          ) : (
                            <span className="w-9 h-9 rounded-full border-2 border-border transition-colors flex items-center justify-center">
                              {item?.organizerInfo?.name
                                ?.split(" ")
                                .map((name: string) => name[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          )}
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold">
                              {item?.title}
                            </p>
                            <p className="text-sm font-semibold">
                              {formatTime(item?.time)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item?.daysUntilEvent === 1
                                ? "Tomorrow"
                                : item?.daysUntilEvent === 0
                                  ? "Today"
                                  : `In ${item?.daysUntilEvent} days`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={getEventBadgeColor(item.eventType)}
                          >
                            {item?.eventType}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <p className="text-center text-muted-foreground text-sm">
                No upcoming events found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
