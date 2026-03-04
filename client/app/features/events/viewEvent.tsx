import { Button } from "~/components/ui/button";
import { useState } from "react";
import { User } from "lucide-react";
import type { EventData } from "~/lib/dataSchema";
import Modal from "~/components/modal";
import { Separator } from "~/components/ui/separator";
import ImageComponent from "~/components/imageComponent";

export default function ViewEvent({ event }: { event: EventData }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer text-muted-foreground"
      >
        View
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {event.title}
          </h1>
          <p className="text-muted-foreground">Event details</p>
        </div>
        <Separator />
        <div className="p-4 space-y-4">
          <p className="text-muted-foreground">{event.description}</p>
          {event.featuredImage && (
            <div className="aspect-square w-full h-[250px] rounded-sm">
              <ImageComponent
                cellValue={event.featuredImage}
                alt={event.title}
                classname="rounded-sm"
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-1">
              <User className="h-3 w-3 shrink-0" />
              <span className="text-foreground">Host:</span>
              {event?.organizer?.map((organizer) => (
                <span className="truncate text-foreground">
                  {organizer.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
