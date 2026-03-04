import { useLocation, NavLink } from "react-router";
import { cn } from "~/lib/utils";
import Logo from "./logo";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sideBarLinks } from "~/lib/constants";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { hasPermission } from "~/lib/rbac";

interface SidebarProps {
  isOpenSidebar: boolean;
  setIsOpenSidebar: (value: boolean) => void;
  userRole: "member" | "admin" | "super_admin";
}
export default function Sidebar({
  isOpenSidebar,
  setIsOpenSidebar,
  userRole,
}: SidebarProps) {
  const location = useLocation();
  const path = location.pathname;
  const toggleSidebar = () => setIsOpenSidebar(!isOpenSidebar);
  const isAuthorized = hasPermission(userRole, "MANAGE_MEMBERS");
  return (
    <aside
      className={cn(
        `hidden lg:block bg-slate-50 dark:bg-coolBlue/20 min-h-screen top-0 fixed z-50 transition-all duration-300 ease-in-out border-r`,
        isOpenSidebar ? "lg:w-[200px]" : "lg:w-[60px]",
      )}
    >
      <div className="flex flex-col h-[calc(100vh-60px)]">
        <div
          className={cn(
            "flex items-center py-[14px]",
            isOpenSidebar ? "px-2" : "justify-center",
          )}
        >
          <Logo
            classname={isOpenSidebar ? "text-2xl" : "text-lg mt-1"}
            isOpenSidebar={isOpenSidebar}
          />
        </div>
        <button
          onClick={toggleSidebar}
          className={cn(
            "cursor-pointer text-muted-foreground transition-all duration-300 ease-in-out absolute top-[20px] translate-x-1/2",
            isOpenSidebar ? "right-4 " : "right-[-3px] rounded-full border",
          )}
        >
          {isOpenSidebar ? (
            <ChevronLeft size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>
        <div className="flex-1 overflow-y-auto">
          {sideBarLinks.map((item) => (
            <div key={item.title} className="my-1 mb-4">
              <div className="flex flex-col gap-2 border-t pt-4">
                {item.children
                  .filter((path) => {
                    if (path.href === "/transfers") {
                      return isAuthorized;
                    }
                    return true;
                  })
                  .map((child: any) => (
                    <div key={child.name}>
                      <NavLink
                        to={child.href}
                        key={child.name}
                        className={({ isActive }) =>
                          `transition ease-in-out duration-300 w-full p-2 flex items-center gap-2 text-sm font-medium ${
                            isActive ||
                            path.split("/")[1] === child.href.split("/")[1]
                              ? "font-bold w-full border-l-4 border-b-2 border-velvet text-velvet"
                              : "hover:bg-velvet/80 hover:text-white"
                          } ${isOpenSidebar ? "" : "justify-center"}`
                        }
                        viewTransition
                        end
                        prefetch="intent"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={`flex items-center gap-2 cursor-pointer px-2`}
                            >
                              <child.icon size={20} />
                              <span
                                className={`text-sm cursor-pointer transition ease-in-out duration-300 ${isOpenSidebar ? "hidden md:block" : "hidden"}`}
                              >
                                {child.name}
                              </span>
                            </span>
                          </TooltipTrigger>
                          {!isOpenSidebar ? (
                            <TooltipContent side="right">
                              <p className="text-xs">{child.name}</p>
                            </TooltipContent>
                          ) : null}
                        </Tooltip>
                      </NavLink>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
