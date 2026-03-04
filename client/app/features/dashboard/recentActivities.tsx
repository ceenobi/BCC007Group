import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CreditCard, Calendar, UserPlus, Ticket, Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

dayjs.extend(relativeTime);

interface RecentActivitiesProps {
  activities: any[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "payment":
        return CreditCard;
      case "event":
        return Calendar;
      case "member":
        return UserPlus;
      case "ticket":
        return Ticket;
      default:
        return Clock;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "payment":
        return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "event":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "member":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "ticket":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Card className="rounded-sm col-span-1 animate-in fade-in slide-in-from-right-4 duration-700 h-[450px] overflow-y-auto dark:bg-lightBlue/20">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions from across the group</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {activities?.map((activity) => {
          const Icon = getIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`p-2 rounded-full ${getColor(activity.type)}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <div className="flex items-center pt-1">
                  <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {dayjs(activity.timestamp).fromNow()}
                  </span>
                </div>
              </div>
              {activity.user && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.image} />
                  <AvatarFallback>
                    {activity.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        {(!activities || activities.length === 0) && (
          <div className="text-center py-10 text-muted-foreground">
            No recent activity found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
