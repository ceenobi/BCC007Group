import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export default function Modal({
  children,
  title,
  isOpen,
  setIsOpen,
  classname,
}: {
  children: React.ReactNode;
  title?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  classname?: string;
}) {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={`p-0 rounded-sm sm:max-w-md dark:bg-deepBlue ${classname}`}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription asChild>
              <div>{children}</div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
