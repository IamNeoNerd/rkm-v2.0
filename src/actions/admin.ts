"use server";

import { db } from "@/db";
import { transactions, families } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { z } from "zod";

const voidSchema = z.string().regex(/^\d+$/, "Invalid Transaction ID");

export async function voidTransaction(transactionId: string) {
    const validation = voidSchema.safeParse(transactionId);
    if (!validation.success) {
        return { error: "Invalid input: Transaction ID must be a numeric string" };
    }

    const txnId = parseInt(transactionId);

    try {
        // 1. Fetch the transaction
        const txnRes = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, txnId))
            .limit(1);

        const txn = txnRes[0];

        if (!txn) {
            return { error: "Transaction not found" };
        }

        // 2. If is_void is already true, throw error (return object)
        if (txn.isVoid) {
            return { error: "Transaction is already voided" };
        }

        await db.transaction(async (tx: any) => {
            // 3. Set is_void = true
            await tx
                .update(transactions)
                .set({ isVoid: true })
                .where(eq(transactions.id, txnId));

            // 4. Reverse Balance: 
            if (txn.familyId) {
                if (txn.type === 'CREDIT') {
                    await tx
                        .update(families)
                        .set({
                            balance: sql`${families.balance} - ${txn.amount}`,
                            updatedAt: new Date()
                        })
                        .where(eq(families.id, txn.familyId));
                } else if (txn.type === 'DEBIT') {
                    await tx
                        .update(families)
                        .set({
                            balance: sql`${families.balance} + ${txn.amount}`,
                            updatedAt: new Date()
                        })
                        .where(eq(families.id, txn.familyId));
                }
            }
        });

        // 5. Revalidate
        if (txn.familyId) {
            revalidatePath(`/families/${txn.familyId}`);
        }
        revalidatePath('/transactions');
        return { success: true };

    } catch (error) {
        console.error("Void transaction error:", error);
        return { error: error instanceof Error ? error.message : "Failed to void transaction" };
    }
}
