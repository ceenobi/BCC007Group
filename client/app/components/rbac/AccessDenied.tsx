import { Card, CardContent } from "~/components/ui/card";
import { Lock } from "lucide-react";

export default function AccessDenied() {
  return (
    <>
      <Card className="rounded-sm">
        <CardContent className="flex flex-col items-center gap-2">
          <Lock className="h-8 w-8" />
          <p className="text-sm text-muted-foreground text-center">
            You do not have permission to view this tab
          </p>
        </CardContent>
      </Card>
    </>
  );
}
