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
                className="print-receipt bg-white p-6 sm:p-8 max-w-[148mm] mx-auto overflow-hidden"
                style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    breakInside: "avoid",
                    pageBreakAfter: "avoid"
                }}
            >
                {/* Institutional Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 mb-6 relative">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                        RK Institute of Learning
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mt-1">
                        "Excellent in Holistic Development"
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Academics</span>
                        <span className="opacity-30">•</span>
                        <span>Computer Education</span>
                        <span className="opacity-30">•</span>
                        <span>Yoga</span>
                        <span className="opacity-30">•</span>
                        <span>Library Facility</span>
                    </div>
                    <div className="mt-3 space-y-0.5">
                        <p className="text-[10px] text-slate-600 font-medium">
                            Swaroop Nagar, Kushak Road, Delhi-42
                        </p>
                        <p className="text-[10px] text-slate-600 font-bold">
                            Mob: +91-7678357731, 7903952008 • Web: rkinstitute.in
                        </p>
                    </div>
                </div>

                {/* Receipt Metadata */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                            Fee Payment Receipt
                        </h2>
                        <p className="text-sm font-black text-slate-900 font-mono">
                            No: {data.receiptNumber}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Date
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                            {format(new Date(data.date), "dd MMM yyyy, hh:mm a")}
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Received From</span>
                            <p className="text-sm font-black text-slate-900 uppercase">{data.familyName}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</span>
                            <p className="text-sm font-mono font-bold text-slate-900">{data.familyPhone}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</span>
                            <p className="text-sm font-bold text-slate-800">{data.studentName || "N/A"}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Mode</span>
                            <p className="text-sm font-black text-indigo-600 uppercase tracking-wider">{data.mode}</p>
                        </div>
                    </div>

                    {data.description && (
                        <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Note</span>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed italic">
                                {data.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Financial Summary Box */}
                <div className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-6 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12">
                        <h1 className="text-6xl font-black">RK</h1>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Paid Amount</span>
                        <span className="text-3xl font-black text-slate-900">
                            {formatCurrency(data.amount)}
                        </span>
                    </div>

                    {data.balance !== undefined && (
                        <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance Dues</span>
                            <span className={`text-base font-black ${data.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                                {data.balance > 0 ? formatCurrency(data.balance) : "PAID FULL"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Transaction Verbatim */}
                <div className="bg-slate-900 text-white rounded-xl p-4 mb-8">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">In Words</p>
                    <p className="text-xs font-bold uppercase italic tracking-wider">
                        Rupees {numberToWords(data.amount)} Only
                    </p>
                </div>

                {/* Signature Panel */}
                <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-slate-200 text-center">
                    <div>
                        <div className="h-12 flex items-end justify-center">
                            <div className="w-full border-b border-slate-400" />
                        </div>
                        <p className="text-[9px] font-black uppercase text-slate-500 mt-2 tracking-widest">Parent's Signature</p>
                    </div>
                    <div>
                        <div className="h-12 flex items-end justify-center">
                            <div className="w-full border-b border-slate-400" />
                        </div>
                        <p className="text-[9px] font-black uppercase text-slate-500 mt-2 tracking-widest">Principal / Manager</p>
                    </div>
                </div>

                {/* System Footer */}
                <div className="mt-12 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                        Computer Generated Receipt • Printed on {format(new Date(), "dd/MM/yyyy")}
                    </p>
                </div>
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
    @page {
        size: A5 portrait;
        margin: 0;
    }
    body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
    }
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
        width: 148mm;
        height: auto;
        min-height: 210mm;
        padding: 20px !important;
        margin: 0 !important;
        background: white !important;
        overflow: visible !important;
        box-shadow: none !important;
        border: none !important;
        page-break-inside: avoid !important;
    }
    .no-print {
        display: none !important;
    }
}
`;
