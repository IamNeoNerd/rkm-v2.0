'use server';

import { db } from "@/db";
import { feeStructures, academicSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { safeRevalidatePath } from "@/lib/server-utils";
import { requireRole, AuthorizationError } from "@/lib/auth-guard";

// =====================
// Fee Structures
// =====================

export async function getFeeStructures() {
    try {
        await requireRole(["admin", "super-admin"]);

        const structures = await db
            .select()
            .from(feeStructures)
            .orderBy(feeStructures.className);

        return { success: true, feeStructures: structures };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error fetching fee structures:", error);
        return { success: false, error: "Failed to fetch fee structures" };
    }
}

export async function createFeeStructure(data: {
    className: string;
    monthlyFee: number;
    admissionFee: number;
    sessionId?: number;
}) {
    try {
        await requireRole(["admin", "super-admin"]);

        const [newStructure] = await db.insert(feeStructures).values({
            className: data.className.trim(),
            monthlyFee: data.monthlyFee,
            admissionFee: data.admissionFee,
            sessionId: data.sessionId || null,
            isActive: true,
        }).returning();

        safeRevalidatePath('/settings/fees');
        return { success: true, feeStructure: newStructure };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error creating fee structure:", error);
        return { success: false, error: "Failed to create fee structure" };
    }
}

export async function updateFeeStructure(id: number, data: {
    className?: string;
    monthlyFee?: number;
    admissionFee?: number;
    isActive?: boolean;
}) {
    try {
        await requireRole(["admin", "super-admin"]);

        const [updated] = await db
            .update(feeStructures)
            .set({
                ...data,
                className: data.className?.trim(),
                updatedAt: new Date(),
            })
            .where(eq(feeStructures.id, id))
            .returning();

        safeRevalidatePath('/settings/fees');
        return { success: true, feeStructure: updated };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error updating fee structure:", error);
        return { success: false, error: "Failed to update fee structure" };
    }
}

export async function deleteFeeStructure(id: number) {
    try {
        await requireRole(["super-admin"]);

        await db.delete(feeStructures).where(eq(feeStructures.id, id));

        safeRevalidatePath('/settings/fees');
        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error deleting fee structure:", error);
        return { success: false, error: "Failed to delete fee structure" };
    }
}

// =====================
// Academic Sessions
// =====================

export async function getAcademicSessions() {
    try {
        await requireRole(["admin", "super-admin"]);

        const sessions = await db
            .select()
            .from(academicSessions)
            .orderBy(desc(academicSessions.startDate));

        return { success: true, sessions };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error fetching sessions:", error);
        return { success: false, error: "Failed to fetch sessions" };
    }
}

export async function createAcademicSession(data: {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
}) {
    try {
        await requireRole(["super-admin"]);

        // If this session is current, unset others
        if (data.isCurrent) {
            await db
                .update(academicSessions)
                .set({ isCurrent: false });
        }

        const [newSession] = await db.insert(academicSessions).values({
            name: data.name.trim(),
            startDate: data.startDate,
            endDate: data.endDate,
            isCurrent: data.isCurrent || false,
        }).returning();

        safeRevalidatePath('/settings/sessions');
        return { success: true, session: newSession };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error creating session:", error);
        return { success: false, error: "Failed to create session" };
    }
}

export async function setCurrentSession(id: number) {
    try {
        await requireRole(["super-admin"]);

        // Unset all current sessions
        await db.update(academicSessions).set({ isCurrent: false });

        // Set the new current session
        await db
            .update(academicSessions)
            .set({ isCurrent: true })
            .where(eq(academicSessions.id, id));

        safeRevalidatePath('/settings/sessions');
        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error setting current session:", error);
        return { success: false, error: "Failed to set current session" };
    }
}

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
