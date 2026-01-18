'use server';

import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { requireRole, AuthorizationError } from "@/lib/auth-guard";

// =====================
// Activity Logs (Audit Trail)
// =====================

import { transactions, users, families, staff as staffTable } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function getActivityLogs(options?: {
    page?: number;
    limit?: number;
    type?: "CREDIT" | "DEBIT" | "all";
    category?: string;
}) {
    try {
        await requireRole(["super-admin"]);

        const page = options?.page || 1;
        const limit = options?.limit || 50;
        const offset = (page - 1) * limit;

        // Build query with joins for performer and family/staff info
        const logs = await db
            .select({
                id: transactions.id,
                type: transactions.type,
                category: transactions.category,
                amount: transactions.amount,
                description: transactions.description,
                isVoid: transactions.isVoid,
                createdAt: transactions.createdAt,
                receiptNumber: transactions.receiptNumber,
                paymentMode: transactions.paymentMode,
                performedBy: transactions.performedBy,
                // Family info
                familyId: transactions.familyId,
                familyName: families.fatherName,
                // Staff info (for salary)
                staffId: transactions.staffId,
                staffName: staffTable.name,
                // Performer info
                performerName: users.name,
                performerEmail: users.email,
            })
            .from(transactions)
            .leftJoin(families, eq(transactions.familyId, families.id))
            .leftJoin(staffTable, eq(transactions.staffId, staffTable.id))
            .leftJoin(users, eq(transactions.performedBy, users.id))
            .orderBy(desc(transactions.createdAt))
            .limit(limit)
            .offset(offset);

        // Get total count
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(transactions);
        const total = Number(countResult[0]?.count || 0);

        return {
            success: true,
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error fetching activity logs:", error);
        return { success: false, error: "Failed to fetch activity logs" };
    }
}
