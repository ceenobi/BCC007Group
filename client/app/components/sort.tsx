import { Button } from "~/components/ui/button";
import { ArrowDownZA, ArrowUpAZ } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface SortProps {
  handleSortChange: (value: string) => void;
  sort: "name(A-Z)" | "name(Z-A)" | "total(H-L)" | "total(L-H)" | undefined;
}

export default function Sort({ handleSortChange, sort }: SortProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {sort === "name(A-Z)" || sort === "total(H-L)" ? (
          <Button
            variant="ghost"
            className="rounded-sm cursor-pointer"
            onClick={() =>
              handleSortChange(
                sort === "name(A-Z)" ? "name(Z-A)" : "total(L-H)",
              )
            }
          >
            <ArrowUpAZ /> Sort
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="rounded-sm cursor-pointer"
            onClick={() =>
              handleSortChange(
                sort === "name(Z-A)" ? "name(A-Z)" : "total(H-L)",
              )
            }
          >
            <ArrowDownZA /> Sort
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p>Toggle sort direction</p>
      </TooltipContent>
    </Tooltip>
  );
}
