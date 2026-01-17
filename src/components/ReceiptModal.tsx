"use client";

import { useRef } from "react";
import { X, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type ReceiptData = {
    receiptNumber: string;
    date: Date;
    familyName: string;
    familyId: number;
    amount: number;
    paymentMode: string;
    newBalance: number;
};

interface ReceiptModalProps {
    receipt: ReceiptData;
    onClose: () => void;
}

export function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = receiptRef.current;
        if (!printContent) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt - ${receipt.receiptNumber}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .receipt { max-width: 400px; margin: 0 auto; border: 2px solid #333; padding: 20px; }
                        .header { text-align: center; border-bottom: 1px dashed #333; padding-bottom: 10px; margin-bottom: 15px; }
                        .logo { font-size: 24px; font-weight: bold; color: #4338ca; }
                        .row { display: flex; justify-content: space-between; margin: 8px 0; }
                        .label { color: #666; }
                        .value { font-weight: 600; }
                        .amount { font-size: 24px; text-align: center; margin: 20px 0; color: #16a34a; }
                        .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #333; color: #666; font-size: 12px; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownload = () => {
        // Create a simple text receipt for download
        const receiptText = `
RK INSTITUTE
Fee Payment Receipt
==================

Receipt No: ${receipt.receiptNumber}
Date: ${format(new Date(receipt.date), "MMM dd, yyyy hh:mm a")}

Family: ${receipt.familyName}
Family ID: ${receipt.familyId}

Amount Paid: Rs ${receipt.amount}
Payment Mode: ${receipt.paymentMode}
New Balance: Rs ${receipt.newBalance}

==================
Thank you for your payment!
        `.trim();

        const blob = new Blob([receiptText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `receipt_${receipt.receiptNumber}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Payment Receipt</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Receipt Content */}
                <div ref={receiptRef} className="p-6">
                    <div className="receipt">
                        {/* Receipt Header */}
                        <div className="header text-center border-b border-dashed border-gray-300 pb-4 mb-4">
                            <div className="logo text-2xl font-bold text-indigo-600">RK Institute</div>
                            <p className="text-sm text-gray-500 mt-1">Fee Payment Receipt</p>
                        </div>

                        {/* Receipt Number and Date */}
                        <div className="row flex justify-between mb-3 text-sm">
                            <span className="label text-gray-500">Receipt No:</span>
                            <span className="value font-semibold">{receipt.receiptNumber}</span>
                        </div>
                        <div className="row flex justify-between mb-3 text-sm">
                            <span className="label text-gray-500">Date:</span>
                            <span className="value">{format(new Date(receipt.date), "MMM dd, yyyy hh:mm a")}</span>
                        </div>

                        <div className="border-t border-dashed border-gray-300 my-4"></div>

                        {/* Family Details */}
                        <div className="row flex justify-between mb-3 text-sm">
                            <span className="label text-gray-500">Family:</span>
                            <span className="value font-semibold">{receipt.familyName}</span>
                        </div>
                        <div className="row flex justify-between mb-3 text-sm">
                            <span className="label text-gray-500">Family ID:</span>
                            <span className="value">#{receipt.familyId}</span>
                        </div>

                        {/* Amount */}
                        <div className="amount bg-green-50 rounded-lg p-4 my-4 text-center">
                            <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                            <p className="text-3xl font-bold text-green-700">₹{receipt.amount}</p>
                        </div>

                        {/* Payment Mode */}
                        <div className="row flex justify-between mb-3 text-sm">
                            <span className="label text-gray-500">Payment Mode:</span>
                            <span className="value">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                                    {receipt.paymentMode}
                                </span>
                            </span>
                        </div>

                        {/* New Balance */}
                        <div className="row flex justify-between mb-3 text-sm">
                            <span className="label text-gray-500">New Balance:</span>
                            <span className={`value font-semibold ${receipt.newBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ₹{Math.abs(receipt.newBalance)} {receipt.newBalance < 0 ? '(Due)' : ''}
                            </span>
                        </div>

                        {/* Footer */}
                        <div className="footer text-center mt-6 pt-4 border-t border-dashed border-gray-300">
                            <p className="text-xs text-gray-500">Thank you for your payment!</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 border-t bg-gray-50">
                    <Button
                        onClick={handlePrint}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="flex-1"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                </div>
            </div>
        </div>
    );
}
