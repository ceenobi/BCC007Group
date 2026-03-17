import { useCallback } from "react";
import TableView from "~/components/tableView";
import { type EventData } from "~/lib/dataSchema";
import { formatDate, formatTime } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { getEventTypeColor, getStatusColor } from "~/lib/constants";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "~/components/ui/avatar";
import DeleteEvent from "../deleteEvent";
import EditEvent from "./editEvent";
import MobileView from "./mobileView";
import { type UserData } from "~/lib/dataSchema";
import { Card } from "~/components/ui/card";

interface EventActionProps {
  eventsData: EventData[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  members: UserData[];
}

export default function EventActions({
  eventsData,
  selected,
  setSelected,
  members,
}: EventActionProps) {
  return (
    <>
      <div className="hidden lg:block">
        <Card
          className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-4 transition-all duration-300 ease-in-out"
          style={{ animationDelay: "100ms" }}
        >
          <TableView
            tableColumns={[
              { name: "TITLE", uid: "title" },
              { name: "DATE", uid: "date" },
              { name: "TIME", uid: "time" },
              { name: "STATUS", uid: "status" },
              { name: "TYPE", uid: "eventType" },
              { name: "HOST", uid: "organizer" },
              { name: "ACTIONS", uid: "actions" },
            ]}
            tableData={eventsData}
            renderCell={renderCell({ selected, members })}
            selected={selected}
            setSelected={setSelected}
            batchAction={true}
          />
        </Card>
      </div>
      <MobileView eventsData={eventsData} members={members} />
    </>
  );
}

export function renderCell({
  selected,
  members,
}: {
  selected: string[];
  members: UserData[];
}) {
  return useCallback(
    (item: EventData, columnKey: React.Key) => {
      const cellValue = item[columnKey as keyof EventData];
      switch (columnKey) {
        case "title":
          return <div className="dark:text-white truncate">{cellValue}</div>;
        case "date":
          return (
            <div className=" dark:text-white">
              {formatDate(cellValue as string)}
            </div>
          );
        case "time":
          return (
            <div className="dark:text-white">
              {formatTime(cellValue as string)}
            </div>
          );
        case "status":
          return (
            <Badge
              variant="outline"
              className={`text-xs rounded-sm ${getStatusColor(cellValue)}`}
            >
              {cellValue.replace("-", " ").toUpperCase()}
            </Badge>
          );
        case "eventType":
          return (
            <Badge
              variant="outline"
              className={`text-xs rounded-sm ${getEventTypeColor(cellValue).replace("text-", "border-").replace("600", "200")} ${getEventTypeColor(cellValue).replace("text-", "bg-").replace("600", "50")} ${getEventTypeColor(cellValue)}`}
            >
              {cellValue.toUpperCase()}
            </Badge>
          );
        case "organizer":
          return (
            <div className="dark:text-white">
              <AvatarGroup className="grayscale">
                {item.organizer.slice(0, 2)?.map((organizer) => (
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
                {item.organizer.length > 2 && (
                  <AvatarGroupCount>
                    +{item.organizer.length - 2}
                  </AvatarGroupCount>
                )}
              </AvatarGroup>
            </div>
          );
        case "actions":
          return (
            <div className="flex gap-3 items-center">
              <EditEvent item={item} members={members} />
              <DeleteEvent item={item} selected={selected} />
            </div>
          );
        default:
          return cellValue as React.ReactNode;
      }
    },
    [selected, members],
  );
}
