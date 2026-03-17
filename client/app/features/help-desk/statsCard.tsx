import { Card, CardContent } from "~/components/ui/card";
import { PageSection } from "~/components/pageWrapper";

interface Summary {
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
}

export default function StatsCard({ summary }: { summary: Summary }) {
  const { openTickets, inProgressTickets, resolvedTickets } = summary;
  return (
    <PageSection
      index={1}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      <Card
        className="rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-300 dark:bg-lightBlue/20"
        style={{ animationDelay: "100ms" }}
      >
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{openTickets}</div>
          <p className="text-sm text-muted-foreground">Open Tickets</p>
        </CardContent>
      </Card>
      <Card
        className="rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-300 dark:bg-lightBlue/20"
        style={{ animationDelay: "200ms" }}
      >
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {inProgressTickets}
          </div>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </CardContent>
      </Card>
      <Card
        className="rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-300 dark:bg-lightBlue/20"
        style={{ animationDelay: "300ms" }}
      >
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {resolvedTickets}
          </div>
          <p className="text-sm text-muted-foreground">Resolved Tickets</p>
        </CardContent>
      </Card>
    </PageSection>
  );
}
