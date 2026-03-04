import { UserKey } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { PageSection } from "~/components/pageWrapper";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  canModifyRole,
  isRoleVisible,
  memberRoleColors,
} from "~/lib/constants";
import type { UserData } from "~/lib/dataSchema";
import { getQueryClient } from "~/lib/queryClient";

export default function AssignRole({
  members,
  user,
}: {
  members: UserData[];
  user: UserData;
}) {
  const [active, setActive] = useState(0);
  const fetcher = useFetcher();
  const queryClient = getQueryClient();

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === 200) {
      toast.success(
        fetcher.data?.body?.message || "Role assigned successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } else if (fetcher.data && fetcher.data?.status !== 200) {
      toast.error(fetcher.data?.body?.message || "Something went wrong!");
    }
  }, [fetcher.data]);

  const isSubmitting = fetcher.state === "submitting";

  const handleRoleChange = (id: string, role: string, index: number) => {
    setActive(index);
    fetcher.submit(
      { role },
      {
        method: "patch",
        action: `/members?id=${id}`,
      },
    );
  };
  return (
    <>
      <PageSection index={3}>
        <Card className="hidden md:block rounded-sm transition-shadow bg-transparent">
          <CardContent className="p-4 text-start space-y-2">
            <div className="grid grid-cols-12 gap-4 uppercase">
              <h1 className="font-semibold col-span-1">S/N</h1>
              <h1 className="font-semibold col-span-5">Member</h1>
              <h1 className="font-semibold col-span-4">Role</h1>
              <h1 className="font-semibold col-span-2">Action</h1>
            </div>
            {members?.map((member, index) => (
              <div
                key={member.id}
                className="grid grid-cols-12 gap-4 py-2 border-b hover:bg-slate-50/70 hover:dark:bg-lightBlue/20 transition-colors"
              >
                <p className="col-span-1">{index + 1}</p>
                <p className="truncate col-span-5">{member.name}</p>
                <div className="col-span-4">
                  <Badge
                    variant="outline"
                    className={
                      memberRoleColors[
                        member.role as keyof typeof memberRoleColors
                      ]
                    }
                  >
                    {member.role}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="cursor-pointer">
                        <UserKey className="mr-1" />
                        {isSubmitting && active === index
                          ? "Assigning..."
                          : "Assign Role"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]">
                      <DropdownMenuLabel>Select role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {isRoleVisible(user, "member") && (
                        <DropdownMenuCheckboxItem
                          checked={member.role === "member"}
                          onCheckedChange={(checked) =>
                            checked &&
                            handleRoleChange(member.id, "member", index)
                          }
                          disabled={!canModifyRole(user, "member", member)}
                          className="cursor-pointer"
                        >
                          Member
                        </DropdownMenuCheckboxItem>
                      )}
                      {isRoleVisible(user, "admin") && (
                        <DropdownMenuCheckboxItem
                          checked={member.role === "admin"}
                          onCheckedChange={(checked) =>
                            checked &&
                            handleRoleChange(member.id, "admin", index)
                          }
                          disabled={!canModifyRole(user, "admin", member)}
                          className="cursor-pointer"
                        >
                          Admin
                        </DropdownMenuCheckboxItem>
                      )}
                      {isRoleVisible(user, "super_admin") && (
                        <DropdownMenuCheckboxItem
                          checked={member.role === "super_admin"}
                          onCheckedChange={(checked) =>
                            checked &&
                            handleRoleChange(member.id, "super_admin", index)
                          }
                          disabled={!canModifyRole(user, "super_admin", member)}
                          className="cursor-pointer"
                        >
                          Super Admin
                        </DropdownMenuCheckboxItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="md:hidden">
          {members?.map((member, index) => (
            <Card className="my-4 rounded-sm transition-shadow" key={member.id}>
              <CardContent className="p-4 md:hidden">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <p className="font-semibold">{member.name}</p>
                    <Badge
                      variant="outline"
                      className={
                        memberRoleColors[
                          member.role as keyof typeof memberRoleColors
                        ]
                      }
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="cursor-pointer w-full text-start"
                      >
                        <UserKey className="mr-1" />
                        {isSubmitting && active === index
                          ? "Assigning..."
                          : "Assign Role"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px]">
                      <DropdownMenuLabel>Select role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {isRoleVisible(user, "member") && (
                        <DropdownMenuCheckboxItem
                          checked={member.role === "member"}
                          onCheckedChange={(checked) =>
                            checked &&
                            handleRoleChange(member.id, "member", index)
                          }
                          disabled={!canModifyRole(user, "member", member)}
                          className="cursor-pointer"
                        >
                          Member
                        </DropdownMenuCheckboxItem>
                      )}
                      {isRoleVisible(user, "admin") && (
                        <DropdownMenuCheckboxItem
                          checked={member.role === "admin"}
                          onCheckedChange={(checked) =>
                            checked &&
                            handleRoleChange(member.id, "admin", index)
                          }
                          disabled={!canModifyRole(user, "admin", member)}
                          className="cursor-pointer"
                        >
                          Admin
                        </DropdownMenuCheckboxItem>
                      )}
                      {isRoleVisible(user, "super_admin") && (
                        <DropdownMenuCheckboxItem
                          checked={member.role === "super_admin"}
                          onCheckedChange={(checked) =>
                            checked &&
                            handleRoleChange(member.id, "super_admin", index)
                          }
                          disabled={!canModifyRole(user, "super_admin", member)}
                          className="cursor-pointer"
                        >
                          Super Admin
                        </DropdownMenuCheckboxItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>
    </>
  );
}
