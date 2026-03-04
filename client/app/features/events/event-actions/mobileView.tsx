import { Calendar, Clock } from "lucide-react";
import NotFound from "~/components/notFound";
import { PageSection } from "~/components/pageWrapper";
import { Card, CardContent } from "~/components/ui/card";
import { getBGColor, getProgressColor, updateProgress } from "~/lib/constants";
import type { EventData, UserData } from "~/lib/dataSchema";
import { formatDate, formatTime } from "~/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "~/components/ui/avatar";
import EditEvent from "./editEvent";
import DeleteEvent from "../deleteEvent";

export default function MobileView({
  eventsData,
  members,
}: {
  eventsData: EventData[];
  members: UserData[];
}) {
  return (
    <div className="lg:hidden">
      {eventsData.length === 0 ? (
        <NotFound message="No data found" />
      ) : (
        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventsData.map((event, index) => (
            <PageSection key={event._id} index={index + 3}>
              <Card
                className={`relative rounded-sm transition-shadow ${getBGColor(event.status)}`}
                style={{ animationDelay: "100ms" }}
              >
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold text-base truncate">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      Date: {formatDate(event.date as unknown as string)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      Time: {formatTime(event.time)}
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
                  <div className="flex justify-between items-center font-medium dark:text-white">
                    <AvatarGroup className="grayscale">
                      {event.organizer.slice(0, 2)?.map((organizer) => (
                        <Avatar key={organizer._id}>
                          <AvatarImage src={organizer.image} />
                          <AvatarFallback>
                            {organizer.name
                              .split(" ")
                              .map((name: string) => name[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {event.organizer.length > 2 && (
                        <AvatarGroupCount>
                          +{event.organizer.length - 2}
                        </AvatarGroupCount>
                      )}
                    </AvatarGroup>
                    <div className="flex gap-3 items-center">
                      <EditEvent item={event} members={members} />
                      <DeleteEvent item={event} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          ))}
        </div>
      )}
    </div>
  );
}
