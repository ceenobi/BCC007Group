import { CircleAlert } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export default function NotFound({ message }: { message: string }) {
  return (
    <>
      <Card className="hover:shadow transition-shadow rounded-sm dark:bg-lightBlue/30">
        <CardContent className="p-4 sm:p-6 space-y-2 flex flex-col items-center">
          <CircleAlert className="h-8 w-8 text-yellow-500" />
          <p className="text-center text-sm text-muted-foreground italic">
            {message}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
