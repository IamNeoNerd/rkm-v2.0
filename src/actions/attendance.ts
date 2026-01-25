"use server";

import { db } from "@/db";
import { attendance, batches, students, enrollments } from "@/db/schema";
import { eq, and, sql, between, desc } from "drizzle-orm";
import { safeRevalidatePath } from "@/lib/server-utils";
import { requireAuth, AuthorizationError } from "@/lib/auth-guard";

export type AttendanceStatus = "Present" | "Absent" | "Late";

export type AttendanceRecord = {
    studentId: number;
    status: AttendanceStatus;
};

/**
 * Mark attendance for a batch on a specific date
 * Supports bulk marking with "Mark All Present" functionality
 */
export async function markAttendance(
    batchId: number,
    date: Date,
    records: AttendanceRecord[]
) {
    try {
        // Authorization: Any verified user can mark attendance
        await requireAuth();

        const dateStr = date.toISOString().split('T')[0];

        // Delete existing attendance records for this batch/date to allow updates
        await db
            .delete(attendance)
            .where(
                and(
                    eq(attendance.batchId, batchId),
                    eq(attendance.date, dateStr)
                )
            );

        // Insert new attendance records
        if (records.length > 0) {
            await db.insert(attendance).values(
                records.map((r: AttendanceRecord) => ({
                    batchId,
                    studentId: r.studentId,
                    date: dateStr,
                    status: r.status,
                }))
            );
        }

        safeRevalidatePath("/attendance");
        return { success: true, count: records.length };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error marking attendance:", error);
        return { success: false, error: "Failed to mark attendance" };
    }
}

/**
 * Get all students enrolled in a batch for attendance marking
 */
export async function getBatchStudentsForAttendance(batchId: number) {
    try {
        const enrolled = await db
            .select({
                studentId: students.id,
                studentName: students.name,
                studentClass: students.class,
            })
            .from(enrollments)
            .innerJoin(students, eq(enrollments.studentId, students.id))
            .where(
                and(
                    eq(enrollments.batchId, batchId),
                    eq(enrollments.isActive, true)
                )
            )
            .orderBy(students.name);

        return { students: enrolled };
    } catch (error) {
        console.error("Error fetching batch students:", error);
        return { students: [], error: "Failed to fetch students" };
    }
}

/**
 * Get attendance for a batch on a specific date
 */
export async function getAttendanceByBatch(batchId: number, date: Date) {
    try {
        const dateStr = date.toISOString().split('T')[0];

        const records = await db
            .select({
                id: attendance.id,
                studentId: attendance.studentId,
                studentName: students.name,
                status: attendance.status,
            })
            .from(attendance)
            .innerJoin(students, eq(attendance.studentId, students.id))
            .where(
                and(
                    eq(attendance.batchId, batchId),
                    eq(attendance.date, dateStr)
                )
            );

        return { attendance: records };
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return { attendance: [], error: "Failed to fetch attendance" };
    }
}

/**
 * Get attendance history for a batch over a date range
 */
export async function getAttendanceHistory(
    batchId: number,
    startDate: Date,
    endDate: Date
) {
    try {
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        const records = await db
            .select({
                id: attendance.id,
                studentId: attendance.studentId,
                studentName: students.name,
                date: attendance.date,
                status: attendance.status,
            })
            .from(attendance)
            .innerJoin(students, eq(attendance.studentId, students.id))
            .where(
                and(
                    eq(attendance.batchId, batchId),
                    between(attendance.date, startStr, endStr)
                )
            )
            .orderBy(desc(attendance.date), students.name);

        return { attendance: records };
    } catch (error) {
        console.error("Error fetching attendance history:", error);
        return { attendance: [], error: "Failed to fetch attendance history" };
    }
}

/**
 * Get attendance summary for a student
 */
export async function getStudentAttendance(studentId: number, daysBack: number = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        const startStr = startDate.toISOString().split('T')[0];

        const records = await db
            .select({
                id: attendance.id,
                batchId: attendance.batchId,
                batchName: batches.name,
                date: attendance.date,
                status: attendance.status,
            })
            .from(attendance)
            .innerJoin(batches, eq(attendance.batchId, batches.id))
            .where(
                and(
                    eq(attendance.studentId, studentId),
                    sql`${attendance.date} >= ${startStr}`
                )
            )
            .orderBy(desc(attendance.date));

        // Calculate summary
        const summary = {
            total: records.length,
            present: records.filter((r: { status: string | null }) => r.status === "Present").length,
            absent: records.filter((r: { status: string | null }) => r.status === "Absent").length,
            late: records.filter((r: { status: string | null }) => r.status === "Late").length,
            percentage: 0,
        };

        if (summary.total > 0) {
            summary.percentage = Math.round(((summary.present + summary.late) / summary.total) * 100);
        }

        return { records, summary };
    } catch (error) {
        console.error("Error fetching student attendance:", error);
        return { records: [], summary: { total: 0, present: 0, absent: 0, late: 0, percentage: 0 }, error: "Failed to fetch attendance" };
    }
}
