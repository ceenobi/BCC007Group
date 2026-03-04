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
    paymentStatus: searchParams.get("paymentStatus") || "",
    paymentType: searchParams.get("paymentType") || "",
  });
  const paymentStatus = searchParams.get("paymentStatus") || "";
  const paymentType = searchParams.get("paymentType") || "";

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
      paymentStatus: "",
      paymentType: "",
    });
    const params = new URLSearchParams(searchParams);
    params.delete("paymentStatus");
    params.delete("paymentType");
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
          value={filters.paymentStatus}
          onValueChange={(value) => handleFilterChange("paymentStatus", value)}
          defaultValue={paymentStatus}
        >
          <SelectTrigger className="gap-2 w-fit rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {["pending", "completed", "failed", "cancelled"]?.map((item) => (
              <SelectItem key={item} value={item} className="capitalize">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Separator orientation="vertical" />
        <Select
          value={filters.paymentType}
          onValueChange={(value) => handleFilterChange("paymentType", value)}
          defaultValue={paymentType}
        >
          <SelectTrigger className="gap-2 w-fit rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {["donation", "event", "membership_dues"].map((item) => (
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
          disabled={!filters.paymentStatus && !filters.paymentType}
        >
          <Eraser /> Clear all
        </Button>
        <Separator orientation="vertical" />
        <Button
          type="submit"
          form="filter"
          variant="link"
          className="cursor-pointer underline text-velvet hover:text-velvet"
          disabled={!filters.paymentStatus && !filters.paymentType}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
