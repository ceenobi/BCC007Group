import { Mail, Map, Phone } from "lucide-react";
import { Suspense } from "react";
import NotFound from "~/components/notFound";
import { PageSection } from "~/components/pageWrapper";
import { SkeletonMemberCard } from "~/components/skeleton";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { memberRoleColors } from "~/lib/constants";
import type { UserData } from "~/lib/dataSchema";

export default function CardView({ members }: { members: UserData[] }) {
  return (
    <Suspense fallback={<SkeletonMemberCard />}>
      {members?.length === 0 ? (
        <NotFound message="No data found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {members?.map((member, index) => (
            <PageSection key={member.id} index={index + 2}>
              <Card
                className="rounded-sm hover:shadow-md transition-shadow dark:bg-lightBlue/20"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      {member?.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-12 h-12 rounded-full bg-muted"
                        />
                      ) : (
                        <span className="w-12 h-12 rounded-full border-2 border-border hover:border-primary transition-colors flex items-center justify-center">
                          {member?.name
                            ?.split(" ")
                            .map((name) => name[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-medium truncate">
                            {member.name}
                          </h3>
                          <p className="font-semibold text-sm text-muted-foreground">
                            ID:{member.memberId}
                          </p>
                        </div>
                        <div>
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">
                              {member.phone || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Map className="h-3 w-3" />
                            <span className="truncate">
                              {member.location || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          {member.email && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2 text-xs"
                              onClick={() =>
                                window.open(`mailto:${member.email}`, "_blank")
                              }
                            >
                              <Mail className="h-3 w-3" />
                              Email
                            </Button>
                          )}
                          {member.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2 text-xs"
                              onClick={() =>
                                window.open(`tel:${member.phone}`, "_blank")
                              }
                            >
                              <Phone className="h-3 w-3" />
                              Call
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          ))}
        </div>
      )}
    </Suspense>
  );
}
