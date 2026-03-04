import type { UserData } from "~/lib/dataSchema";
import { cn, getTimeOfDay } from "~/lib/utils";
import ThemeToggle from "./themeToggle";
import Notification from "./notification";
import Profile from "./profile";
import MobileDrawer from "./mobileDrawer";
import Logo from "./logo";
import GlobalSearch from "./globalSearch";

interface headerProps {
  user: UserData;
  isOpenSidebar: boolean;
}

export default function Header({ user, isOpenSidebar }: headerProps) {
  return (
    <header
      suppressHydrationWarning
      className={cn(
        "fixed top-0 z-40 border-b bg-background/50 backdrop-blur supports-backdrop-filter:bg-background/50 w-full",
        isOpenSidebar ? "lg:w-[calc(100%-200px)]" : "lg:w-[calc(100%-60px)]",
      )}
    >
      <div className="lg:max-w-full mx-auto flex justify-between items-center py-3 px-4 lg:px-8">
        <h1 className="hidden md:block text-lg font-bold text-foreground truncate">
          {getTimeOfDay(user?.name.split(" ")[0] || "")}
        </h1>
        <div className="md:hidden">
          <Logo classname="text-2xl" />
        </div>
        <div className="flex gap-4 items-center">
          <GlobalSearch />
          <ThemeToggle />
          <Notification />
          <Profile user={user} />
          <MobileDrawer />
        </div>
      </div>
    </header>
  );
}
