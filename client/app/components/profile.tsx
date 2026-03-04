import type { UserData } from "~/lib/dataSchema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { NavLink, Form } from "react-router";
import { LogOut } from "lucide-react";

export default function Profile({ user }: { user: UserData }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="cursor-pointer relative h-10 w-10 rounded-full p-0 hover:bg-accent"
          aria-label="Profile menu"
        >
          {user?.image ? (
            <img
              className="h-10 w-10 rounded-full object-cover border-2 border-border hover:border-primary transition-colors"
              src={user?.image}
              alt={`${user?.name}'s avatar`}
            />
          ) : (
            <span className="w-10 h-10 rounded-full border-2 border-border hover:border-primary transition-colors flex items-center justify-center">
              {user?.name
                ?.split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="truncate text-sm font-semibold leading-none text-coolBlue dark:text-blue-500">
              {user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {["profile", "settings", "help-desk"].map((item) => (
          <DropdownMenuItem key={item}>
            <NavLink
              to={`/${item}`}
              key={item}
              className={({ isActive }) =>
                ` capitalize text-sm  ${isActive ? "text-velvet" : ""}`
              }
              viewTransition
              end
            >
              {item}
            </NavLink>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Form
            action="/logout"
            method="post"
            className="flex gap-2 items-center cursor-pointer text-velvet"
          >
            <LogOut />
            <button
              type="submit"
              className="cursor-pointer w-auto font-semibold"
            >
              Logout
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
