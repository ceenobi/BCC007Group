import { Eye } from "lucide-react";
import { useCallback } from "react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { memberRoleColors } from "~/lib/constants";
import type { UserData } from "~/lib/dataSchema";
import { formatDate } from "~/lib/utils";

export default function useTableCell() {
  return useCallback((item: UserData, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof UserData];
    switch (columnKey) {
      case "name":
        return (
          <div className="flex gap-2 items-center">
            <div className="cursor-pointer">
              <div className="shrink-0">
                {item?.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-full bg-muted"
                  />
                ) : (
                  <span className="w-10 h-10 rounded-full border-2 border-border hover:border-primary transition-colors flex items-center justify-center">
                    {item?.name
                      ?.split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="dark:text-white">
              <p>{item.name}</p>
              <p className="text-xs dark:text-gray-400">ID: {item.memberId}</p>
            </div>
          </div>
        );
      case "email":
        return (
          <div className="dark:text-white">
            <p
              onClick={() => window.open(`mailto:${item.email}`, "_blank")}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.open(`mailto:${item.email}`, "_blank");
                }
              }}
              title={`Send email to ${item.email}`}
            >
              {item.email}
            </p>
          </div>
        );
      case "phone":
        return (
          <div className="dark:text-white">
            <p
              onClick={() => window.open(`tel:${item.phone}`, "_blank")}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.open(`tel:${item.phone}`, "_blank");
                }
              }}
              title={`Call ${item.phone}`}
            >
              {item.phone || "N/A"}
            </p>
          </div>
        );
      case "createdAt":
        return (
          <div className="dark:text-white">
            {formatDate(cellValue as string)}
          </div>
        );
      case "occupation":
        return (
          <div className="dark:text-white truncate">
            <p>{cellValue || "N/A"}</p>
          </div>
        );
      case "location":
        return (
          <div className="dark:text-white truncate">
            <p>{cellValue || "N/A"}</p>
          </div>
        );
      case "role":
        return (
          <Badge
            variant="outline"
            className={`rounded-sm ${
              memberRoleColors[item.role as keyof typeof memberRoleColors]
            }`}
          >
            {item.role}
          </Badge>
        );
      case "action":
        return (
          <div className="flex gap-4 items-center">
            <Button
              asChild
              variant="ghost"
              size="icon"
              title={`View ${item.name}`}
            >
              <Link
                to={`/members/${item.name}/${item.id}`}
                prefetch="intent"
              >
                <Eye className="dark:text-white"/>
              </Link>
            </Button>
          </div>
        );
      default:
        return cellValue as React.ReactNode;
    }
  }, []);
}
