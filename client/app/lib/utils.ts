import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PaymentData } from "~/lib/dataSchema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCloudinaryImage = (
  url: string,
  width: number,
  height: number,
) => {
  if (!url) return url;
  if (!url.includes("res.cloudinary.com")) return url;
  const pathParts = url.split("upload/");
  if (pathParts.length !== 2) return url;
  return `${
    pathParts[0]
  }upload/c_fill,w_${width},h_${height},f_auto,q_auto/${pathParts[1]}`;
};

export const formatCurrency = (
  amount: number,
  currency = "NGN",
  display: "symbol" | "narrowSymbol" | "code" | "name" = "symbol",
) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    currencyDisplay: display,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDayMonth = (date: string) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

export const getTimeOfDay = (name: string): string => {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return `Good morning☀️ ${name}`;
  } else if (currentHour >= 12 && currentHour < 18) {
    return `Good afternoon🌤️ ${name}`;
  } else {
    return `Good evening🌙 ${name}`;
  }
};

export const sortMembersMethods = {
  "name(A-Z)": {
    method: (a: any, b: any) => {
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    },
  },
  "name(Z-A)": {
    method: (a: any, b: any) => {
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
    },
  },
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${formattedHours}:${minutes < 10 ? "0" : ""}${minutes} ${ampm}`;
};

export function mapPaystackPlanToEnum(planCode: string): string | null {
  const planMapping: { [key: string]: string } = {
    PLN_m70z1675dnrdgeq: "levy_plan",
  };
  return planMapping[planCode] || null;
}

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60),
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
};

export const exportToPDF = (
  tableData: any[][],
  title: string,
  headers: string[],
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 35,
    theme: "striped",
    headStyles: {
      fillColor: [0, 62, 125],
      halign: "left",
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
    },
  });

  // Save the PDF
  doc.save(`${title}-${new Date().toISOString().split("T")[0]}.pdf`);
};

export const receiptInvoice = (payment: PaymentData) => {
  if (!payment || payment.paymentStatus !== "completed") return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;

  const createdAt = payment.createdAt
    ? new Date(payment.createdAt as any)
    : new Date();
  const paymentDate = Number.isNaN(createdAt.getTime())
    ? new Date()
    : createdAt;

  const humanPaymentType = payment.paymentType
    ? payment.paymentType.replace(/_/g, " ")
    : "N/A";
  const reference = payment.reference || "N/A";
  const memberName = (payment as any)?.userId?.name;

  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text("BCC007 Team payments", marginX, 60);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text("Payment Receipt", marginX, 80);
  doc.text(
    `Date: ${paymentDate.toLocaleDateString("en-GB")}`,
    pageWidth - marginX,
    80,
    { align: "right" },
  );

  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, 92, pageWidth - marginX, 92);

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(`Reference: ${reference}`, marginX, 112);
  doc.text(`Status: ${payment.paymentStatus}`, pageWidth - marginX, 112, {
    align: "right",
  });

  if (memberName) {
    doc.text(`Member: ${memberName}`, marginX, 130);
  }

  const detailsRows: Array<[string, string]> = [
    ["Payment Type", humanPaymentType],
    ["Amount", formatCurrency(payment.amount, "NGN", "code")],
    ["Payment Date", paymentDate.toLocaleString("en-GB")],
    ["Recurring", payment.isRecurring ? "Yes" : "No"],
  ];
  if (payment.note) detailsRows.push(["Note", payment.note]);

  autoTable(doc, {
    head: [["Field", "Value"]],
    body: detailsRows,
    startY: memberName ? 150 : 140,
    theme: "striped",
    headStyles: {
      fillColor: [0, 62, 125],
      halign: "left",
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 6,
      overflow: "linebreak",
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: marginX, right: marginX },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 260;
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text(
    `Total Paid: ${formatCurrency(payment.amount, "NGN", "code")}`,
    pageWidth - marginX,
    finalY + 30,
    { align: "right" },
  );

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "Thank you for your payment. This receipt is system-generated.",
    marginX,
    doc.internal.pageSize.getHeight() - 40,
  );

  doc.save(`receipt-${reference}.pdf`);
};
