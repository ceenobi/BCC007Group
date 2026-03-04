import { Button } from "~/components/ui/button";
import { Eye, FileText } from "lucide-react";
import type { PaymentData } from "~/lib/dataSchema";
import { useState } from "react";
import Modal from "~/components/modal";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { paymentStatusColors } from "~/lib/constants";
import { formatCurrency, formatDate, receiptInvoice } from "~/lib/utils";

export default function ViewPayment({
  payment,
  tabQuery,
}: {
  payment: PaymentData;
  tabQuery: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer hidden xl:block"
      >
        <Eye />
      </Button>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer text-muted-foreground xl:hidden"
      >
        View
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Payment details
          </h1>
          <p className="text-muted-foreground"> Ref:{payment.reference}</p>
        </div>
        <Separator />
        <div className="p-4 space-y-4">
          {tabQuery === "group" && (
            <div className="font-medium flex justify-between items-center gap-4">
              <p className="text-gray-900 dark:text-white ">Member:</p>
              <div className="dark:text-muted-foreground">
                {payment.userId?.name}
              </div>
            </div>
          )}
          <div className="font-medium flex justify-between items-center gap-4">
            <p className="text-gray-900 dark:text-white ">Payment Type:</p>
            <div className="flex items-center gap-2">
              {payment.paymentType.replace("_", " ")}
              {payment.isRecurring && (
                <Badge
                  variant="outline"
                  className="capitalize ml-2 text-[10px] py-0 h-4 border-primary/20 text-primary"
                >
                  Recurring
                </Badge>
              )}
            </div>
          </div>
          <div className="font-medium flex justify-between items-center gap-4">
            <p className="text-gray-900 dark:text-white ">Payment Status:</p>
            <div className="dark:text-white">
              <Badge
                variant="secondary"
                className={`px-2 py-0.5 rounded-sm text-[12px] font-medium border ${paymentStatusColors[payment.paymentStatus] || "bg-gray-100"}`}
              >
                {payment.paymentStatus}
              </Badge>
            </div>
          </div>
          <div className="font-medium flex justify-between items-center gap-4">
            <p className="text-gray-900 dark:text-white">Amount:</p>
            <div className="dark:text-muted-foreground">
              {formatCurrency(payment.amount)}
            </div>
          </div>
          <div className="font-medium flex justify-between items-center gap-4">
            <p className="text-gray-900 dark:text-white">Date:</p>
            <div className="dark:text-muted-foreground">
              {formatDate(payment.createdAt as string)}
            </div>
          </div>
          <div className="font-medium flex justify-between items-center gap-4">
            <p className="text-gray-900 dark:text-white">Note:</p>
            <div className="dark:text-muted-foreground">
              {payment.note || "N/A"}
            </div>
          </div>
          <div className="font-medium flex justify-end items-center gap-4">
            <Button
              className="flex items-center gap-2 rounded-sm cursor-pointer"
              onClick={() => receiptInvoice(payment)}
              disabled={payment.paymentStatus !== "completed"}
            >
              <FileText /> Download Receipt
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
