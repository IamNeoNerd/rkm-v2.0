"use server";

import { db } from "@/db";
import { families, students, enrollments, batches, transactions, feeStructures } from "@/db/schema";
import { eq, sql, inArray, and } from "drizzle-orm";
import { safeRevalidatePath } from "@/lib/server-utils";
import { z } from "zod";
import { requireRole, AuthorizationError, requireAuth } from "@/lib/auth-guard";
import { logger, audit, AuditAction } from "@/lib/logger";


// Fallback fees if no fee structure exists in database
const FALLBACK_CLASS_FEES: Record<string, number> = {
    "Class 1": 1000,
    "Class 2": 1200,
    "Class 3": 1400,
    "Class 4": 1500,
    "Class 5": 1600,
    "Class 6": 1800,
    "Class 7": 2000,
    "Class 8": 2200,
    "Class 9": 2500,
    "Class 10": 3000,
    "Class 11": 3500,
    "Class 12": 4000,
};

// Cache for fee structures to avoid repeated DB calls within same request
let feeStructureCache: Map<string, number> | null = null;

async function getStandardFeeForClass(className: string): Promise<number> {
    // Try to get from database first
    try {
        // Check cache first
        if (feeStructureCache && feeStructureCache.has(className)) {
            return feeStructureCache.get(className)!;
        }

        // Query active fee structures from database
        const structures = await db
            .select({
                className: feeStructures.className,
                monthlyFee: feeStructures.monthlyFee,
            })
            .from(feeStructures)
            .where(eq(feeStructures.isActive, true));

        // Build cache
        feeStructureCache = new Map();
        structures.forEach(s => {
            feeStructureCache!.set(s.className, s.monthlyFee);
        });

        // Return from cache or fallback
        if (feeStructureCache.has(className)) {
            return feeStructureCache.get(className)!;
        }
    } catch (error) {
        console.warn("Failed to fetch fee structures from DB, using fallback:", error);
    }

    // Fallback to hardcoded values
    return FALLBACK_CLASS_FEES[className] || 0;
}

export async function calculateTotalDue(familyId: string) {
    // 1. Fetch all active students for this family
    const familyStudents = await db
        .select()
        .from(students)
        .where(eq(students.familyId, parseInt(familyId))); // Assuming familyId is string but needs int parshing or schema uses serial which is int

    const activeStudents = familyStudents.filter((s) => s.isActive);

    if (activeStudents.length === 0) {
        return 0;
    }

    const studentIds = activeStudents.map((s) => s.id);

    // 2. Fetch all active batch enrollments for these students
    const studentEnrollments = await db
        .select({
            studentId: enrollments.studentId,
            batchFee: batches.fee,
        })
        .from(enrollments)
        .innerJoin(batches, eq(enrollments.batchId, batches.id))
        .where(
            inArray(enrollments.studentId, studentIds)
        );
    // .where(and(inArray(enrollments.studentId, studentIds), eq(enrollments.isActive, true))) ?? Schema says default true

    // Filter for active enrollments/batches manually or via query if we added constraints.
    // The join naturally brings batch data. We should check enrollment.isActive too if needed, schema default is true.

    // Let's refine the query to be more specific about active status
    const activeEnrollments = await db
        .select({
            studentId: enrollments.studentId,
            batchFee: batches.fee,
        })
        .from(enrollments)
        .innerJoin(batches, eq(enrollments.batchId, batches.id))
        .where(
            sql`${enrollments.studentId} IN ${studentIds} AND ${enrollments.isActive} = true`
        );

    let totalDue = 0;

    for (const student of activeStudents) {
        // Student Base Fee
        let baseFee = 0;
        if (student.baseFeeOverride !== null) {
            baseFee = student.baseFeeOverride;
        } else {
            baseFee = await getStandardFeeForClass(student.class);
        }

        // Batch Fees for this student
        const studentBatchFees = activeEnrollments
            .filter((e) => e.studentId === student.id)
            .reduce((sum, e) => sum + e.batchFee, 0);

        totalDue += baseFee + studentBatchFees;
    }

    return totalDue;
}

const paymentSchema = z.object({
    familyId: z.string(),
    amount: z.number().positive(),
    mode: z.enum(['CASH', 'UPI']),
});

export async function processPayment(data: { familyId: string; amount: number; mode: 'CASH' | 'UPI' }) {
    try {
        // Authorization: Admin, Super Admin, or verified user (receptionist)
        const session = await requireAuth();

        const validation = paymentSchema.safeParse(data);

        if (!validation.success) {
            return { error: 'Invalid payment data', details: validation.error.format() };
        }

        const { familyId, amount, mode } = validation.data;
        const familyIdInt = parseInt(familyId);

        // Generate receipt number
        const { generateReceiptNumber } = await import('@/lib/receipt-generator');
        const receiptNumber = await generateReceiptNumber();

        // Step A: Insert transaction with audit trail
        await db.insert(transactions).values({
            type: 'CREDIT',
            category: 'FEE',
            amount: amount,
            familyId: familyIdInt,
            description: `Payment via ${mode}`,
            isVoid: false,
            performedBy: session.user.id as string || null,
            receiptNumber: receiptNumber,
            paymentMode: mode,
        });

        // Step B: Update family balance
        await db
            .update(families)
            .set({
                balance: sql`${families.balance} + ${amount}`,
                updatedAt: new Date(),
            })
            .where(eq(families.id, familyIdInt));

        // Fetch new balance to return
        const updatedFamily = await db
            .select({ balance: families.balance })
            .from(families)
            .where(eq(families.id, familyIdInt))
            .limit(1);

        const result = {
            success: true,
            newBalance: updatedFamily[0]?.balance || 0,
            receiptNumber: receiptNumber
        };

        // Audit log the payment
        await audit(
            AuditAction.PAYMENT_RECEIVE,
            { amount, mode, receiptNumber, newBalance: result.newBalance },
            'family',
            familyIdInt
        );

        logger.info(`Payment processed: ₹${amount} for family ${familyId}`, { receiptNumber, mode });

        safeRevalidatePath('/billing');
        safeRevalidatePath(`/families/${familyId}`);
        safeRevalidatePath('/');
        safeRevalidatePath('/reports/transactions');

        return result;

    } catch (error: unknown) {
        if (error instanceof AuthorizationError) {
            return { error: error.message, code: error.code };
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Payment processing error:", error);
        return { error: `Failed to process payment: ${message}` };
    }
}

export async function getRecentTransactions(limit = 50) {
    try {
        const recentTransactions = await db
            .select({
                id: transactions.id,
                type: transactions.type,
                category: transactions.category,
                amount: transactions.amount,
                description: transactions.description,
                createdAt: transactions.createdAt,
                familyId: transactions.familyId,
                fatherName: families.fatherName,
                phone: families.phone,
                receiptNumber: transactions.receiptNumber,
                paymentMode: transactions.paymentMode,
                performedBy: transactions.performedBy,
            })
            .from(transactions)
            .leftJoin(families, eq(transactions.familyId, families.id))
            .orderBy(sql`${transactions.createdAt} DESC`)
            .limit(limit);

        return { transactions: recentTransactions };
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return { transactions: [], error: "Failed to fetch transactions" };
    }
}

// Search families by name, student name, or phone
export async function searchFamilies(query: string) {
    if (!query || query.length < 2) {
        return { families: [] };
    }

    try {
        const searchTerm = `%${query.toLowerCase()}%`;

        // Search in families table
        const matchingFamilies = await db
            .select({
                id: families.id,
                fatherName: families.fatherName,
                phone: families.phone,
                balance: families.balance,
            })
            .from(families)
            .where(
                sql`LOWER(${families.fatherName}) LIKE ${searchTerm} OR ${families.phone} LIKE ${searchTerm}`
            )
            .limit(10);

        // Also search by student name
        const matchingByStudent = await db
            .select({
                id: families.id,
                fatherName: families.fatherName,
                phone: families.phone,
                balance: families.balance,
                studentName: students.name,
            })
            .from(students)
            .innerJoin(families, eq(students.familyId, families.id))
            .where(sql`LOWER(${students.name}) LIKE ${searchTerm}`)
            .limit(10);

        // Combine and deduplicate
        const familyMap = new Map();

        matchingFamilies.forEach(f => {
            familyMap.set(f.id, { ...f, matchedBy: 'family' });
        });

        matchingByStudent.forEach(f => {
            if (!familyMap.has(f.id)) {
                familyMap.set(f.id, {
                    id: f.id,
                    fatherName: f.fatherName,
                    phone: f.phone,
                    balance: f.balance,
                    matchedBy: 'student',
                    studentName: f.studentName,
                });
            }
        });

        return { families: Array.from(familyMap.values()) };
    } catch (error) {
        console.error("Error searching families:", error);
        return { families: [], error: "Search failed" };
    }
}

/**
 * Void a transaction (super_admin only)
 * This marks the transaction as void and reverses the balance impact
 */
export async function voidTransaction(transactionId: number, reason: string) {
    try {
        // Authorization: Super Admin only
        await requireRole(["super-admin"]);

        // Validate reason
        if (!reason || reason.trim().length < 5) {
            return { success: false, error: "A valid reason (at least 5 characters) is required for voiding a transaction" };
        }

        // Get the transaction
        const [txn] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, transactionId))
            .limit(1);

        if (!txn) {
            return { success: false, error: "Transaction not found" };
        }

        if (txn.isVoid) {
            return { success: false, error: "Transaction is already voided" };
        }

        // Void the transaction
        await db
            .update(transactions)
            .set({
                isVoid: true,
                description: `${txn.description || ''} [VOIDED: ${reason.trim()}]`
            })
            .where(eq(transactions.id, transactionId));

        // Reverse the balance impact on family if applicable
        if (txn.familyId) {
            // If original was CREDIT (payment), we need to subtract the amount (reverse the credit)
            // If original was DEBIT (charge), we need to add the amount (reverse the debit)
            const balanceAdjustment = txn.type === "CREDIT"
                ? sql`${families.balance} - ${txn.amount}`
                : sql`${families.balance} + ${txn.amount}`;

            await db
                .update(families)
                .set({
                    balance: balanceAdjustment,
                    updatedAt: new Date()
                })
                .where(eq(families.id, txn.familyId));
        }

        // Audit log the void action
        await audit(
            AuditAction.PAYMENT_VOID,
            { originalAmount: txn.amount, reason: reason.trim(), originalType: txn.type },
            'transaction',
            transactionId
        );

        logger.info(`Transaction ${transactionId} voided`, { reason: reason.trim(), amount: txn.amount });

        safeRevalidatePath("/fees");
        safeRevalidatePath("/reports/transactions");
        safeRevalidatePath("/");

        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error voiding transaction:", error);
        return { success: false, error: "Failed to void transaction" };
    }
}
