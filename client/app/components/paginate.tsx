import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Props = {
  totalPages: number;
  hasMore: boolean;
  handlePageChange: (page: string) => void;
  onLimitChange?: (limit: string) => void;
  currentPage: number;
  limit: number;
};

export default function Paginate({
  totalPages,
  hasMore,
  handlePageChange,
  onLimitChange,
  currentPage,
  limit,
}: Props) {
  return (
    <div className="flex justify-end items-center py-4 gap-2 rounded-sm">
      <div className="flex items-center">
        <p className="text-muted-foreground text-sm font-medium">
          {currentPage}-{limit} of {totalPages}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Limit</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onLimitChange?.("10")}
              className="text-xs"
            >
              10 rows per page
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onLimitChange?.("20")}
              className="text-xs"
            >
              20 rows per page
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onLimitChange?.("50")}
              className="text-xs"
            >
              50 rows per page
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="border rounded-sm bg-background dark:bg-coolBlue/20 space-x-2">
        <Button
          onClick={() => handlePageChange("first")}
          variant="ghost"
          size="icon"
          className={`${
            currentPage === 1
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
          disabled={currentPage === 1}
        >
          <ChevronsLeft />
        </Button>
        <Button
          onClick={() => handlePageChange("prev")}
          variant="ghost"
          size="icon"
          className={` ${
            currentPage === 1
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
          disabled={currentPage === 1}
        >
          <ChevronLeft />
        </Button>
        <Button
          onClick={() => handlePageChange("next")}
          variant="ghost"
          size="icon"
          className={`hover:bg-indigo-500 hover:text-white ${
            !hasMore ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          disabled={!hasMore}
        >
          <ChevronRight className="hover:text-mainPurple" />
        </Button>
        <Button
          onClick={() => handlePageChange("last")}
          variant="ghost"
          size="icon"
          className={`${
            !hasMore ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          disabled={!hasMore}
        >
          <ChevronsRight className="hover:text-blue-500" />
        </Button>
      </div>
    </div>
  );
}
