import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Eraser } from "lucide-react";
import { Separator } from "~/components/ui/separator";

export default function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    priority: searchParams.get("priority") || "",
  });
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const priority = searchParams.get("priority") || "";

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedSearchParams = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        updatedSearchParams.set(key, value);
      } else {
        updatedSearchParams.delete(key);
      }
    });
    setSearchParams(updatedSearchParams);
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      category: "",
      priority: "",
    });
    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("category");
    params.delete("priority");
    setSearchParams(params);
  };

  return (
    <div className="flex items-center justify-between px-4">
      <form
        className="flex flex-wrap lg:flex-nowrap items-center gap-1"
        onSubmit={handleSubmit}
        id="filter"
      >
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
          defaultValue={status}
        >
          <SelectTrigger className="gap-2 w-fit rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {["open", "in-progress", "resolved", "closed"]?.map((item) => (
              <SelectItem key={item} value={item} className="capitalize">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Separator orientation="vertical" />
        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange("category", value)}
          defaultValue={category}
        >
          <SelectTrigger className="gap-2 w-fit rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {["technical", "event", "payment", "other"].map((item) => (
              <SelectItem key={item} value={item} className="capitalize">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Separator orientation="vertical" />
        <Select
          value={filters.priority}
          onValueChange={(value) => handleFilterChange("priority", value)}
          defaultValue={priority}
        >
          <SelectTrigger className="gap-2 w-fit rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {["low", "medium", "high", "critical"].map((item) => (
              <SelectItem key={item} value={item} className="capitalize">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleClearFilters}
          variant="ghost"
          className="cursor-pointer"
          size="sm"
          disabled={!filters.status && !filters.category && !filters.priority}
        >
          <Eraser /> Clear all
        </Button>
        <Separator orientation="vertical" />
        <Button
          type="submit"
          form="filter"
          variant="link"
          className="cursor-pointer underline text-velvet hover:text-velvet"
          disabled={!filters.status && !filters.category && !filters.priority}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
