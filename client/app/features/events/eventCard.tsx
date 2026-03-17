import { Calendar, Clock, Map, User } from "lucide-react";
import { PageSection } from "~/components/pageWrapper";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import {
  getBGColor,
  getEventTypeColor,
  getPriorityColor,
  getProgressColor,
  getStatusColor,
  getStatusIcon,
  updateProgress,
} from "~/lib/constants";
import type { EventData } from "~/lib/dataSchema";
import { formatDate, formatTime } from "~/lib/utils";
import ViewEvent from "./viewEvent";
import NotFound from "~/components/notFound";

export default function EventCard({ eventsData }: { eventsData: EventData[] }) {
  return (
    <>
      {eventsData?.length === 0 ? (
        <NotFound message="No data found" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {eventsData?.map((event, index) => {
            const StatusIcon = getStatusIcon(event.status);
            return (
              <PageSection key={event._id} index={index + 3}>
                <Card
                  className={`relative h-[330px] rounded-sm hover:shadow-md transition-shadow ${getBGColor(event.status)}`}
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <CardContent className="p-4 sm:p-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`mt-1 shrink-0 ${getPriorityColor(event.status)}`}
                      >
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap flex-col justify-between gap-2 sm:gap-3">
                              <h3 className="font-semibold text-base truncate">
                                {event.title}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getStatusColor(event.status)}`}
                                >
                                  {event.status.replace("-", " ").toUpperCase()}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getEventTypeColor(event.eventType).replace("text-", "border-").replace("600", "200")} ${getEventTypeColor(event.eventType).replace("text-", "bg-").replace("600", "50")} ${getEventTypeColor(event.eventType)}`}
                                >
                                  {event.eventType.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {event?.description?.length > 100
                                ? event.description.slice(0, 100) + "..."
                                : event.description}
                            </p>
                          </div>
                        </div>
                        {/* progress bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Progress</span>
                            <span className="font-medium">
                              {updateProgress(event.status)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(event.status)}`}
                              style={{
                                width: `${updateProgress(event.status)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        {/* meta info */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              Date:{" "}
                              {formatDate(event.date as unknown as string)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              Time: {formatTime(event.time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Map className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              Location: {event.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="text-foreground">Host:</span>
                            {event?.organizer?.slice(0, 2)?.map((organizer) => (
                              <span
                                className="truncate text-foreground"
                                key={organizer._id}
                              >
                                {organizer.name}
                              </span>
                            ))}
                            {event?.organizer?.length > 2 && (
                              <span className="truncate text-foreground">
                                +{event?.organizer?.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 absolute bottom-6 right-2">
                          <ViewEvent event={event} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </PageSection>
            );
          })}
        </div>
      )}
    </>
  );
}
