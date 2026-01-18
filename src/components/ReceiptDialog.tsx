"use client";

import { useState, useRef } from "react";
import { Printer, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PrintReceipt } from "./PrintReceipt";

interface ReceiptData {
    receiptNumber: string;
    transactionId: number;
    familyName: string;
    familyPhone: string;
    studentName?: string;
    amount: number;
    mode: string;
    date: Date;
    description?: string;
    balance?: number;
}

interface ReceiptDialogProps {
    open: boolean;
    onClose: () => void;
    data: ReceiptData | null;
}

export function ReceiptDialog({ open, onClose, data }: ReceiptDialogProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    if (!data) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className="no-print">
                    <DialogTitle className="flex items-center gap-2">
                        <Printer className="h-5 w-5 text-indigo-500" />
                        Payment Receipt
                    </DialogTitle>
                </DialogHeader>

                {/* Receipt Preview */}
                <div className="border rounded-lg overflow-hidden">
                    <PrintReceipt ref={receiptRef} data={data} />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end no-print">
                    <Button variant="outline" onClick={onClose}>
                        <X className="h-4 w-4 mr-2" />
                        Close
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Receipt
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook to manage receipt dialog state
 */
export function useReceiptDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

    const openReceipt = (data: ReceiptData) => {
        setReceiptData(data);
        setIsOpen(true);
    };

    const closeReceipt = () => {
        setIsOpen(false);
        setReceiptData(null);
    };

    return {
        isOpen,
        receiptData,
        openReceipt,
        closeReceipt,
    };
}
