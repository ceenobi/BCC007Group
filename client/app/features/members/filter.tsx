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
    gender: searchParams.get("gender") || "",
    role: searchParams.get("role") || "",
  });
  const gender = searchParams.get("gender") || "";
  const role = searchParams.get("role") || "";

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
      gender: "",
      role: "",
    });
    const params = new URLSearchParams(searchParams);
    params.delete("gender");
    params.delete("role");
    setSearchParams(params);
  };

  const getGender = ["male", "female", "other"];
  const getRoles = ["member", "admin", "super_admin"];

  return (
    <>
      <div className="flex items-center justify-between px-4">
        <form
          className="flex items-center gap-1"
          onSubmit={handleSubmit}
          id="filter"
        >
          <div>
            <Select
              value={filters.gender}
              onValueChange={(value) => handleFilterChange("gender", value)}
              defaultValue={gender}
            >
              <SelectTrigger className="gap-2 w-full rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {getGender?.map((item) => (
                  <SelectItem key={item} value={item} className="capitalize">
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator orientation="vertical" />
          <div>
            <Select
              value={filters.role}
              onValueChange={(value) => handleFilterChange("role", value)}
              defaultValue={role}
            >
              <SelectTrigger className="gap-2 w-full rounded-sm border-none focus:outline-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {getRoles?.map((item) => (
                  <SelectItem key={item} value={item} className="capitalize">
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleClearFilters}
            variant="ghost"
            className="cursor-pointer"
            size="sm"
            disabled={!filters.gender && !filters.role}
          >
            <Eraser /> Clear all
          </Button>
          <Separator orientation="vertical" />
          <Button
            type="submit"
            form="filter"
            variant="link"
            className="cursor-pointer underline text-velvet hover:text-velvet"
            disabled={!filters.gender && !filters.role}
          >
            Apply
          </Button>
        </div>
      </div>
    </>
  );
}
