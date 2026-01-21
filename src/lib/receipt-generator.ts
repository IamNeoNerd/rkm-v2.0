/**
 * Receipt number generator for financial transactions
 * Format: RKI-YYYYMMDD-XXXX (e.g., RKI-20260117-0001)
 */

import { db } from "@/db";
import { transactions } from "@/db/schema";
import { sql, desc } from "drizzle-orm";

/**
 * Generate a unique receipt number for a transaction
 * Format: RKI-YYYYMMDD-XXXX
 */
export async function generateReceiptNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const prefix = `RKI-${dateStr}-`;

    // Find the highest receipt number for today
    const latestReceipt = await db
        .select({ receiptNumber: transactions.receiptNumber })
        .from(transactions)
        .where(sql`${transactions.receiptNumber} LIKE ${prefix + '%'}`)
        .orderBy(desc(transactions.receiptNumber))
        .limit(1);

    let sequence = 1;
    if (latestReceipt.length > 0 && latestReceipt[0].receiptNumber) {
        const lastNum = latestReceipt[0].receiptNumber;
        const lastSeq = parseInt(lastNum.split('-').pop() || '0', 10);
        sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
}

/**
 * Format amount as Indian Rupees
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Generate receipt data for display/PDF
 */
export interface ReceiptData {
    receiptNumber: string;
    date: Date;
    familyName: string;
    phone: string;
    amount: number;
    formattedAmount: string;
    paymentMode: string;
    description: string;
    performedBy: string;
}

export function generateReceiptHTML(data: ReceiptData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt ${data.receiptNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { color: #4f46e5; margin: 0; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; }
        .receipt-number { background: #f3f4f6; padding: 10px; text-align: center; font-weight: bold; margin-bottom: 20px; }
        .details { margin-bottom: 20px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .row.total { border-top: 2px solid #333; border-bottom: none; font-weight: bold; font-size: 18px; }
        .label { color: #666; }
        .value { font-weight: 500; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="header">
        <h1>RK Institute</h1>
        <p>Fee Payment Receipt</p>
    </div>
    
    <div class="receipt-number">
        Receipt #: ${data.receiptNumber}
    </div>
    
    <div class="details">
        <div class="row">
            <span class="label">Date:</span>
            <span class="value">${data.date.toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
        </div>
        <div class="row">
            <span class="label">Family Name:</span>
            <span class="value">${data.familyName}</span>
        </div>
        <div class="row">
            <span class="label">Phone:</span>
            <span class="value">${data.phone}</span>
        </div>
        <div class="row">
            <span class="label">Payment Mode:</span>
            <span class="value">${data.paymentMode}</span>
        </div>
        <div class="row">
            <span class="label">Description:</span>
            <span class="value">${data.description}</span>
        </div>
        <div class="row total">
            <span class="label">Amount Paid:</span>
            <span class="value">${data.formattedAmount}</span>
        </div>
    </div>
    
    <div class="footer">
        <p>Thank you for your payment!</p>
        <p>Processed by: ${data.performedBy}</p>
    </div>
</body>
</html>
    `.trim();
}
