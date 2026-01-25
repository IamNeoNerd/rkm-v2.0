"use server";

import { db } from "@/db";
import { enrollments, batches, staff } from "@/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
// import { revalidatePath } from "next/cache"; 
import { safeRevalidatePath } from "@/lib/server-utils";
import { checkTimeConflict } from "@/lib/scheduling";
import { requireAuth, requireRole, AuthorizationError } from "@/lib/auth-guard";
import { z } from "zod";

// Kept this from previous file as it's useful context
export async function createBatch(data: { name: string, fee: number, schedule: string, teacherId: number }) {
    try {
        // Authorization: Admin or Super Admin only
        await requireRole(["admin", "super-admin"]);

        // Input sanitization
        const sanitizedData = {
            name: data.name.trim(),
            fee: data.fee,
            schedule: data.schedule.trim(),
            teacherId: data.teacherId,
        };

        const [newItem] = await db.insert(batches).values(sanitizedData).returning();
        safeRevalidatePath("/batches");
        safeRevalidatePath("/academics");
        return { batch: newItem };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { error: error.message, code: error.code };
        }
        console.error("Error creating batch:", error);
        return { error: "Failed to create batch" };
    }
}

const enrollSchema = z.object({
    studentId: z.string().regex(/^\d+$/, "Invalid Student ID"),
    batchId: z.string().regex(/^\d+$/, "Invalid Batch ID"),
});

export async function enrollStudentInBatch(studentId: string, batchId: string) {
    try {
        // Authorization: Any verified user can enroll students
        await requireAuth();

        const validation = enrollSchema.safeParse({ studentId, batchId });
        if (!validation.success) {
            return { error: "Invalid input: IDs must be numeric strings" };
        }

        const sId = parseInt(studentId);
        const bId = parseInt(batchId);

        // 1. Fetch the target batch to get its schedule
        const batchRes = await db
            .select()
            .from(batches)
            .where(eq(batches.id, bId))
            .limit(1);

        const batch = batchRes[0];

        if (!batch) {
            return { error: "Batch not found" };
        }

        // 2. Conflict Check: Check if student is already enrolled in another active batch with the same schedule string.
        if (batch.schedule) {
            const activeStudentEnrollments = await db
                .select({
                    batchSchedule: batches.schedule,
                    batchId: batches.id
                })
                .from(enrollments)
                .innerJoin(batches, eq(enrollments.batchId, batches.id))
                .where(
                    and(
                        eq(enrollments.studentId, sId),
                        eq(enrollments.isActive, true)
                    )
                );

            const existingSchedules = activeStudentEnrollments
                .filter(e => e.batchId !== bId && e.batchSchedule)
                .map(e => e.batchSchedule as string);

            const result = checkTimeConflict(batch.schedule, existingSchedules);

            if (result.conflict) {
                // Return specific error string as per constraints (graceful handling)
                // but echoing the "Time Conflict" message requested.
                return { error: "Time Conflict" };
            }
        }

        // 3. Insert into enrollments

        await db.insert(enrollments).values({
            studentId: sId,
            batchId: bId,
            isActive: true,
            enrolledAt: new Date(),
        });

        safeRevalidatePath(`/students/${studentId}`);
        safeRevalidatePath(`/batches/${batchId}`);
        safeRevalidatePath("/academics");
        return { success: true };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { error: error.message, code: error.code };
        }
        console.error("Enrollment error:", error);
        return { error: "Failed to enroll student" };
    }
}

export async function getAllBatches() {
    try {
        const studentCounts = db
            .select({
                batchId: enrollments.batchId,
                count: count().as("count"),
            })
            .from(enrollments)
            .where(eq(enrollments.isActive, true))
            .groupBy(enrollments.batchId)
            .as("student_counts");

        const allBatches = await db
            .select({
                id: batches.id,
                name: batches.name,
                fee: batches.fee,
                schedule: batches.schedule,
                teacherId: batches.teacherId,
                teacherName: staff.name,
                studentCount: sql<number>`COALESCE(${studentCounts.count}, 0)`,
            })
            .from(batches)
            .leftJoin(staff, eq(batches.teacherId, staff.id))
            .leftJoin(studentCounts, eq(batches.id, studentCounts.batchId))
            .orderBy(batches.name);

        return { batches: allBatches };
    } catch (error) {
        console.error("Error fetching batches:", error);
        return { batches: [], error: "Failed to fetch batches" };
    }
}

/**
 * Update batch details
 */
export async function updateBatch(
    batchId: number,
    data: {
        name?: string;
        fee?: number;
        schedule?: string;
        teacherId?: number;
    }
) {
    try {
        // Authorization: Admin or Super Admin only
        await requireRole(["admin", "super-admin"]);

        // Input sanitization
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.fee !== undefined) updateData.fee = data.fee;
        if (data.schedule !== undefined) updateData.schedule = data.schedule.trim();
        if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;

        const [updated] = await db
            .update(batches)
            .set(updateData)
            .where(eq(batches.id, batchId))
            .returning();

        if (!updated) {
            return { success: false, error: "Batch not found" };
        }

        safeRevalidatePath("/academics");
        safeRevalidatePath("/batches");

        return { success: true, batch: updated };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error updating batch:", error);
        return { success: false, error: "Failed to update batch" };
    }
}

/**
 * Delete a batch (and all its enrollments)
 */
export async function deleteBatch(batchId: number) {
    try {
        // Authorization: Admin or Super Admin only
        await requireRole(["admin", "super-admin"]);

        // First, deactivate all enrollments for this batch
        await db
            .update(enrollments)
            .set({ isActive: false })
            .where(eq(enrollments.batchId, batchId));

        // Then delete the batch
        const [deleted] = await db
            .delete(batches)
            .where(eq(batches.id, batchId))
            .returning();

        if (!deleted) {
            return { success: false, error: "Batch not found" };
        }

        safeRevalidatePath("/academics");
        safeRevalidatePath("/batches");

        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error deleting batch:", error);
        return { success: false, error: "Failed to delete batch" };
    }
}

/**
 * Unenroll a student from a batch
 */
export async function unenrollStudent(studentId: number, batchId: number) {
    try {
        // Authorization: Any verified user can unenroll students
        await requireAuth();

        const [updated] = await db
            .update(enrollments)
            .set({ isActive: false })
            .where(
                and(
                    eq(enrollments.studentId, studentId),
                    eq(enrollments.batchId, batchId)
                )
            )
            .returning();

        if (!updated) {
            return { success: false, error: "Enrollment not found" };
        }

        safeRevalidatePath("/academics");
        safeRevalidatePath(`/students/${studentId}`);

        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error unenrolling student:", error);
        return { success: false, error: "Failed to unenroll student" };
    }
}
