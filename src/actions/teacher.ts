"use server";

import { db } from "@/db";
import { users, staff, batches, enrollments, students, attendance } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { audit, AuditAction } from "@/lib/logger";
import { safeRevalidatePath } from "@/lib/server-utils";

/**
 * Get teacher's assigned batches
 */
export async function getTeacherBatches() {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    if (session.user.role !== "teacher") {
        return { success: false, error: "Not a teacher account" };
    }

    try {
        // Get user's linked staff record by email
        const [user] = await db
            .select({ id: users.id, email: users.email })
            .from(users)
            .where(eq(users.email, session.user.email!))
            .limit(1);

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Find staff record by email match
        const [staffRecord] = await db
            .select()
            .from(staff)
            .where(eq(staff.email, user.email!))
            .limit(1);

        if (!staffRecord) {
            return { success: false, error: "No staff record linked to this account" };
        }

        // Get batches assigned to this teacher
        const teacherBatches = await db
            .select({
                id: batches.id,
                name: batches.name,
                schedule: batches.schedule,
                fee: batches.fee,
                isActive: batches.isActive,
            })
            .from(batches)
            .where(eq(batches.teacherId, staffRecord.id));

        return {
            success: true,
            batches: teacherBatches,
            staffName: staffRecord.name,
        };
    } catch (error) {
        console.error("Error fetching teacher batches:", error);
        return { success: false, error: "Failed to fetch batches" };
    }
}

/**
 * Get students enrolled in a specific batch (teacher access)
 */
export async function getBatchStudents(batchId: number) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    if (session.user.role !== "teacher" && !["admin", "super-admin"].includes(session.user.role)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // If teacher, verify they own this batch
        if (session.user.role === "teacher") {
            const [staffRecord] = await db
                .select()
                .from(staff)
                .where(eq(staff.email, session.user.email!))
                .limit(1);

            if (!staffRecord) {
                return { success: false, error: "Staff record not found" };
            }

            const [batch] = await db
                .select()
                .from(batches)
                .where(and(eq(batches.id, batchId), eq(batches.teacherId, staffRecord.id)))
                .limit(1);

            if (!batch) {
                return { success: false, error: "You don't have access to this batch" };
            }
        }

        // Get enrolled students
        const enrolledStudents = await db
            .select({
                id: students.id,
                name: students.name,
                class: students.class,
                isActive: students.isActive,
                enrollmentId: enrollments.id,
            })
            .from(enrollments)
            .innerJoin(students, eq(enrollments.studentId, students.id))
            .where(and(
                eq(enrollments.batchId, batchId),
                eq(enrollments.isActive, true)
            ));

        return { success: true, students: enrolledStudents };
    } catch (error) {
        console.error("Error fetching batch students:", error);
        return { success: false, error: "Failed to fetch students" };
    }
}

/**
 * Get today's attendance for a batch
 */
export async function getBatchAttendance(batchId: number, date: string) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const attendanceRecords = await db
            .select({
                id: attendance.id,
                studentId: attendance.studentId,
                status: attendance.status,
            })
            .from(attendance)
            .where(and(
                eq(attendance.batchId, batchId),
                eq(attendance.date, date)
            ));

        return { success: true, attendance: attendanceRecords };
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return { success: false, error: "Failed to fetch attendance" };
    }
}

/**
 * Mark attendance for a batch (teacher action)
 */
export async function markBatchAttendance(data: {
    batchId: number;
    date: string;
    records: Array<{ studentId: number; status: "Present" | "Absent" | "Late" }>;
}) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    if (session.user.role !== "teacher" && !["admin", "super-admin"].includes(session.user.role)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Verify teacher access if applicable
        if (session.user.role === "teacher") {
            const [staffRecord] = await db
                .select()
                .from(staff)
                .where(eq(staff.email, session.user.email!))
                .limit(1);

            if (!staffRecord) {
                return { success: false, error: "Staff record not found" };
            }

            const [batch] = await db
                .select()
                .from(batches)
                .where(and(eq(batches.id, data.batchId), eq(batches.teacherId, staffRecord.id)))
                .limit(1);

            if (!batch) {
                return { success: false, error: "You don't have access to this batch" };
            }
        }

        // Delete existing attendance for this batch/date
        await db.delete(attendance)
            .where(and(
                eq(attendance.batchId, data.batchId),
                eq(attendance.date, data.date)
            ));

        // Insert new attendance records
        if (data.records.length > 0) {
            await db.insert(attendance).values(
                data.records.map(r => ({
                    batchId: data.batchId,
                    studentId: r.studentId,
                    date: data.date,
                    status: r.status,
                }))
            );
        }

        await audit(AuditAction.ATTENDANCE_MARK, {
            batchId: data.batchId,
            date: data.date,
            recordCount: data.records.length,
        }, 'batch', String(data.batchId));

        safeRevalidatePath("/teacher");

        return { success: true, message: `Marked attendance for ${data.records.length} students` };
    } catch (error) {
        console.error("Error marking attendance:", error);
        return { success: false, error: "Failed to mark attendance" };
    }
}

/**
 * Get batch details for teacher
 */
export async function getTeacherBatchDetails(batchId: number) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const [batch] = await db
            .select({
                id: batches.id,
                name: batches.name,
                schedule: batches.schedule,
                fee: batches.fee,
            })
            .from(batches)
            .where(eq(batches.id, batchId))
            .limit(1);

        if (!batch) {
            return { success: false, error: "Batch not found" };
        }

        // Get enrollment count
        const enrollmentCount = await db
            .select({ id: enrollments.id })
            .from(enrollments)
            .where(and(
                eq(enrollments.batchId, batchId),
                eq(enrollments.isActive, true)
            ));

        return {
            success: true,
            batch: {
                ...batch,
                studentCount: enrollmentCount.length,
            }
        };
    } catch (error) {
        console.error("Error fetching batch details:", error);
        return { success: false, error: "Failed to fetch batch details" };
    }
}
