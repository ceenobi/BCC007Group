import { Button } from "~/components/ui/button";
import { Download } from "lucide-react";
import { exportToPDF, formatCurrency, formatDate } from "~/lib/utils";
import type { PaymentData } from "~/lib/dataSchema";

export default function ExportData({
  payments,
  selected,
}: {
  payments: PaymentData[];
  selected: string[];
}) {
  const tableHeaders = [
    "Reference",
    "Payment Type",
    "Payment Status",
    "Amount",
    "Payment Date",
  ];
  const tableData =
    selected.length > 0
      ? payments
          .filter((payment: PaymentData) => selected.includes(payment._id))
          .map((payment: PaymentData) => [
            payment.reference || "N/A",
            payment.paymentType || "N/A",
            payment.paymentStatus || "N/A",
            formatCurrency(payment.amount, "NGN", "code"),
            formatDate(payment.createdAt as string) || "N/A",
          ])
      : payments.map((payment: PaymentData) => [
          payment.reference || "N/A",
          payment.paymentType || "N/A",
          payment.paymentStatus || "N/A",
          formatCurrency(payment.amount, "NGN", "code"),
          formatDate(payment.createdAt as string) || "N/A",
        ]);
  const title =
    selected.length > 0 ? "Selected Payments Report" : "Payments Report";

  const exportDataToPDF = () => {
    exportToPDF(tableData, title, tableHeaders);
  };

  return (
    <Button
      onClick={exportDataToPDF}
      variant="ghost"
      className="rounded-sm cursor-pointer"
      disabled={payments.length === 0 || selected.length === 0}
    >
      <Download className="h-4 w-4" />
      Export
    </Button>
  );
}
