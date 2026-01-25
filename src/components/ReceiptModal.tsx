"use client";

import { useRef } from "react";
import { Printer, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PrintReceipt } from "./PrintReceipt";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface ReceiptModalProps {
    receipt: {
        receiptNumber: string;
        date: Date;
        familyName: string;
        familyPhone: string;
        familyId: number;
        amount: number;
        paymentMode: string;
        newBalance: number;
        transactionId: number;
    } | null;
    onClose: () => void;
}

export function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    if (!receipt) return null;

    const handleDownloadImage = async () => {
        if (!receiptRef.current) return;

        try {
            toast.loading("Preparing high-quality image...", { id: "receipt-download" });

            // Wait for fonts and styles to settle
            await new Promise(r => setTimeout(r, 500));

            const dataUrl = await toPng(receiptRef.current, {
                quality: 1,
                pixelRatio: 3,
                backgroundColor: "#ffffff",
                style: {
                    transform: "scale(1)",
                    margin: "0",
                }
            });

            const link = document.createElement("a");
            link.download = `Receipt_${receipt.receiptNumber}.png`;
            link.href = dataUrl;
            link.click();

            toast.success("Image downloaded! Ready to share.", { id: "receipt-download" });
        } catch (err) {
            console.error("Image generation failed:", err);
            toast.error("Could not generate image. Please try Print -> Save as PDF", { id: "receipt-download" });
        }
    };

    // Adapt parent receipt data to PrintReceipt expectations
    const printData = {
        receiptNumber: receipt.receiptNumber,
        transactionId: receipt.transactionId,
        familyName: receipt.familyName,
        familyPhone: receipt.familyPhone,
        amount: receipt.amount,
        mode: receipt.paymentMode,
        date: receipt.date,
        balance: receipt.newBalance,
    };

    return (
        <Dialog open={!!receipt} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-white/20">
                <DialogHeader className="no-print">
                    <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                        <Printer className="h-5 w-5 text-indigo-500" />
                        Digital Receipt
                    </DialogTitle>
                </DialogHeader>

                {/* Receipt Preview */}
                <div className="border rounded-2xl overflow-hidden shadow-2xl bg-white">
                    <PrintReceipt ref={receiptRef} data={printData} />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end mt-4 no-print">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">
                        <X className="h-4 w-4 mr-2" />
                        Dismiss
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleDownloadImage}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 rounded-xl font-bold"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Image
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-xl font-bold"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
