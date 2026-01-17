"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/lib/export-utils";

interface Transaction {
    id: number;
    receiptNumber?: string | null;
    createdAt: Date | null;
    type: string;
    fatherName?: string | null;
    description?: string | null;
    paymentMode?: string | null;
    amount: number;
}

export function ExportTransactionsButton({ transactions }: { transactions: Transaction[] }) {
    const handleExport = () => {
        exportToCSV(transactions, 'transactions_report', [
            { key: 'receiptNumber', label: 'Receipt #' },
            { key: 'createdAt', label: 'Date' },
            { key: 'type', label: 'Type' },
            { key: 'fatherName', label: 'Family' },
            { key: 'description', label: 'Description' },
            { key: 'paymentMode', label: 'Mode' },
            { key: 'amount', label: 'Amount' },
        ]);
    };

    return (
        <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
        </Button>
    );
}
