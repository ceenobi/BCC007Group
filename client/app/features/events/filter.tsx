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
import { eventStatus, eventTypes } from "~/lib/constants";
import { Input } from "~/components/ui/input";

export default function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    eventType: searchParams.get("eventType") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });
  const status = searchParams.get("status") || "";
  const eventType = searchParams.get("eventType") || "";

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
      eventType: "",
      startDate: "",
      endDate: "",
    });
    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("eventType");
    params.delete("startDate");
    params.delete("endDate");
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
            {eventStatus?.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className="capitalize"
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" />

        <Select
          value={filters.eventType}
          onValueChange={(value) => handleFilterChange("eventType", value)}
          defaultValue={eventType}
        >
          <SelectTrigger className="gap-2 w-fit rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes?.map((item) => (
              <SelectItem
                key={item.id}
                value={item.name}
                className="capitalize"
              >
                {item.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" />
        <div className="hidden md:block space-y-1">
          <label className="text-muted-foreground text-sm ml-3">
            Start date
          </label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500"
          />
        </div>
        <Separator orientation="vertical" />
        <div className="hidden md:block space-y-1">
          <label className="text-muted-foreground text-sm ml-3">End date</label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500"
          />
        </div>
      </form>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleClearFilters}
          variant="ghost"
          className="cursor-pointer"
          size="sm"
          disabled={
            !filters.status &&
            !filters.eventType &&
            !filters.startDate &&
            !filters.endDate
          }
        >
          <Eraser /> Clear all
        </Button>
        <Separator orientation="vertical" />
        <Button
          type="submit"
          form="filter"
          variant="link"
          className="cursor-pointer underline text-velvet hover:text-velvet"
          disabled={
            !filters.status &&
            !filters.eventType &&
            !filters.startDate &&
            !filters.endDate
          }
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
