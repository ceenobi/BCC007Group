import { AlertTriangleIcon, Loader } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import ActionButton from "~/components/actionButton";
import Modal from "~/components/modal";
import { PageSection } from "~/components/pageWrapper";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

export default function DeleteAccount() {
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();
  return (
    <>
      <PageSection index={8}>
        <Card
          className="bg-slate-50/10 dark:bg-coolBlue/20 shadow rounded-sm p-0 transition-all duration-300 ease-in-out"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-slate-50 dark:bg-lightBlue/20 p-4 border-b">
            <h1 className="font-semibold text-lg">Danger Zone</h1>
          </div>
          <div className="p-4">
            <Button
              variant="outline"
              className="btnRed cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              Delete my account
            </Button>
          </div>
        </Card>
      </PageSection>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="py-4">
          <div className="flex flex-col items-center w-full">
            <AlertTriangleIcon size={20} className="text-red-500" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Confirm Delete
            </h1>
            <p className="text-center text-muted-foreground">
              Are you sure you want to delete your account?
            </p>
            <p className="font-semibold text-center text-gray-900 dark:text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>
          <Separator className="my-4" />
          <div className="px-4 mt-4 flex gap-4 justify-center">
            <ActionButton
              type="button"
              text="Cancel"
              classname="w-fit sm:w-auto text-xs font-medium py-4 border-blue-500 text-blue-500 hover:text-blue-500"
              onClick={() => setIsOpen(false)}
              variant="outline"
            />
            <ActionButton
              type="button"
              text="Delete"
              loading={fetcher.state === "submitting"}
              children={<Loader className="animate-spin" />}
              classname="w-fit sm:w-auto py-4 bg-red-500 hover:bg-red-600 text-white hover:text-white"
              //   onClick={() => {
              //     fetcher.submit(
              //       { id: item._id },
              //       {
              //         method: "delete",
              //         action: "/events?type=delete",
              //       },
              //     );
              //   }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
