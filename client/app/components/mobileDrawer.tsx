import { useState } from "react";
import { useLocation, NavLink, Form } from "react-router";
import { Button } from "./ui/button";
import { LogOut, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { sideBarLinks } from "~/lib/constants";

export default function MobileDrawer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const location = useLocation();
  const path = location.pathname;
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-8 w-8 cursor-pointer lg:hidden rounded-sm"
        >
          <Menu size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="dark:bg-gray-900">
        <SheetHeader>
          <SheetTitle>
            <p className="text-2xl font-bold text-lightBlue dark:text-velvet">
              BCC007PAY
            </p>
          </SheetTitle>
        </SheetHeader>
        <SheetDescription asChild>
          <div>
            <div className="flex-1 overflow-y-auto">
              {sideBarLinks.map((item) => (
                <div key={item.title} className="my-1 mb-4">
                  <div className="flex flex-col gap-2 border-t pt-4">
                    {item.children.map((child: any) => (
                      <div key={child.name}>
                        <NavLink
                          to={child.href}
                          key={child.name}
                          className={({ isActive }) =>
                            `transition ease-in-out duration-300 w-full p-2 flex items-center gap-2 text-sm font-medium ${
                              isActive ||
                              path.split("/")[1] === child.href.split("/")[1]
                                ? "font-bold w-full border-l-4 border-b-2 border-velvet text-velvet"
                                : "hover:bg-velvet/10"
                            } `
                          }
                          viewTransition
                          end
                          prefetch="intent"
                        >
                          <span
                            className={`flex items-center gap-2 cursor-pointer px-2`}
                            onClick={() => setIsOpen(false)}
                          >
                            <child.icon size={20} />
                            <span
                              className={`text-sm cursor-pointer transition ease-in-out duration-300`}
                            >
                              {child.name}
                            </span>
                          </span>
                        </NavLink>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-4 px-3">
                <Form
                  action="/logout"
                  method="post"
                  className="flex gap-2 cursor-pointer text-velvet p-2"
                >
                  <LogOut />
                  <button
                    type="submit"
                    className="cursor-pointer w-fit font-semibold"
                  >
                    Logout
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </SheetDescription>
      </SheetContent>
    </Sheet>
  );
}
