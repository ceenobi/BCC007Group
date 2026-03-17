import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import {
  notificationStore,
  type AppNotification,
} from "~/context/notificationStore";
import { cn } from "~/lib/utils";
import { Link } from "react-router";
import { formatRelativeTime } from "~/lib/utils";

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setNotifications(notificationStore.getNotifications());
    const unsubscribe = notificationStore.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    notificationStore.markAsRead(id);
  };
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-sm relative h-8 w-8 cursor-pointer hovver:text-velvet"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge className="bg-velvet text-white absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">View notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 p-0 shadow-lg border rounded-sm"
      >
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-base">Notifications</h4>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer h-7 px-2 text-xs hover:bg-background"
                  onClick={() => notificationStore.clearAll()}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "p-4 border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer relative",
                  !n.isRead && "bg-gray-100 dark:bg-coolBlue/20",
                )}
                onClick={(e) => n.id && handleMarkAsRead(n.id, e)}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(new Date(n.timestamp))}
                    </span>
                  </div>
                  <Link
                    to={n.link || "/"}
                    className="text-xs text-muted-foreground line-clamp-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {n.link && n.description}
                  </Link>
                  {!n.isRead && (
                    <div className="absolute top-4 right-2 w-2 h-2 rounded-full bg-mainPurple animate-pulse" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
