"use client";

import { forwardRef } from "react";
import { format } from "date-fns";

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

interface PrintReceiptProps {
    data: ReceiptData;
}

export const PrintReceipt = forwardRef<HTMLDivElement, PrintReceiptProps>(
    function PrintReceipt({ data }, ref) {
        const formatCurrency = (amount: number) =>
            new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 0,
            }).format(amount);

        return (
            <div
                ref={ref}
                className="print-receipt bg-white p-8 max-w-md mx-auto"
                style={{ fontFamily: "system-ui, sans-serif" }}
            >
                {/* Header */}
                <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">RK Institute</h1>
                    <p className="text-sm text-gray-600">Excellence in Education</p>
                    <p className="text-xs text-gray-500 mt-1">
                        123 Main Street, City • Phone: 9876543210
                    </p>
                </div>

                {/* Receipt Title */}
                <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide">
                        Fee Receipt
                    </h2>
                    <p className="text-sm text-gray-600">
                        Receipt No: <span className="font-mono font-bold">{data.receiptNumber}</span>
                    </p>
                </div>

                {/* Receipt Details */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium">
                            {format(new Date(data.date), "dd MMM yyyy, hh:mm a")}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Received From</span>
                        <span className="font-medium">{data.familyName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Phone</span>
                        <span className="font-mono">{data.familyPhone}</span>
                    </div>
                    {data.studentName && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Student</span>
                            <span className="font-medium">{data.studentName}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Payment Mode</span>
                        <span className="font-medium uppercase">{data.mode}</span>
                    </div>
                    {data.description && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Description</span>
                            <span className="font-medium">{data.description}</span>
                        </div>
                    )}
                </div>

                {/* Amount Box */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-lg text-gray-700">Amount Paid</span>
                        <span className="text-2xl font-bold text-green-700">
                            {formatCurrency(data.amount)}
                        </span>
                    </div>
                    {data.balance !== undefined && (
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200">
                            <span className="text-sm text-gray-600">Balance Due</span>
                            <span className={`font-semibold ${data.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                                {data.balance > 0 ? formatCurrency(data.balance) : "NIL"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Amount in Words */}
                <div className="bg-gray-50 rounded p-3 mb-6">
                    <p className="text-xs text-gray-500 uppercase">Amount in Words</p>
                    <p className="font-medium text-gray-800">
                        Rupees {numberToWords(data.amount)} Only
                    </p>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-800 pt-6 mt-6">
                    <div className="flex justify-between">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-8">Payer Signature</p>
                            <div className="border-t border-gray-400 w-32"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-8">Authorized Signature</p>
                            <div className="border-t border-gray-400 w-32"></div>
                        </div>
                    </div>
                </div>

                {/* Print Note */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    This is a computer generated receipt. • Printed on {format(new Date(), "dd/MM/yyyy")}
                </p>
            </div>
        );
    }
);

/**
 * Convert number to words (Indian format)
 */
function numberToWords(num: number): string {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    if (num === 0) return "Zero";
    if (num < 0) return "Minus " + numberToWords(-num);

    let words = "";

    // Lakhs (1,00,000)
    if (Math.floor(num / 100000) > 0) {
        words += numberToWords(Math.floor(num / 100000)) + " Lakh ";
        num %= 100000;
    }

    // Thousands
    if (Math.floor(num / 1000) > 0) {
        words += numberToWords(Math.floor(num / 1000)) + " Thousand ";
        num %= 1000;
    }

    // Hundreds
    if (Math.floor(num / 100) > 0) {
        words += ones[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
    }

    // Remaining
    if (num > 0) {
        if (num < 10) {
            words += ones[num];
        } else if (num < 20) {
            words += teens[num - 10];
        } else {
            words += tens[Math.floor(num / 10)];
            if (num % 10 > 0) {
                words += " " + ones[num % 10];
            }
        }
    }

    return words.trim();
}

/**
 * CSS for printing
 * Add this to globals.css or a separate print.css
 */
export const printStyles = `
@media print {
    body * {
        visibility: hidden;
    }
    .print-receipt,
    .print-receipt * {
        visibility: visible;
    }
    .print-receipt {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }
    @page {
        size: A5;
        margin: 1cm;
    }
}
`;
