import { Printer } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { generateReceiptContent } from "@/backend/lib/payments";

interface ReceiptDownloadProps {
  payment: {
    id: string;
    amount: number;
    dueDate: string;
    createdAt: string;
    status: string;
  };
  studentName: string;
}

/**
 * Button to print/download a receipt for a paid payment.
 * Only renders when payment.status === 'paid'.
 *
 * Implements Requirement 6.5
 */
export function ReceiptDownload({ payment, studentName }: ReceiptDownloadProps) {
  if (payment.status !== "paid") return null;

  const handlePrint = () => {
    const receiptText = generateReceiptContent(payment, studentName);

    const printWindow = window.open("", "_blank", "width=600,height=500");
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt – ${payment.id}</title>
  <style>
    body {
      font-family: 'Courier New', Courier, monospace;
      background: #fff;
      color: #000;
      padding: 2rem;
      white-space: pre-wrap;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>${receiptText}</body>
</html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="gap-2 rounded-xl border-gray-200 bg-gray-50 hover:bg-gray-100"
    >
      <Printer className="size-4" />
      Print Receipt
    </Button>
  );
}
