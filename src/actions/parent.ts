"use server";

import { db } from "@/db";
import { families, students, transactions, attendance, batches, enrollments, staff } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Lookup family by phone number (parent portal)
export async function lookupFamilyByPhone(phone: string) {
    if (!phone || phone.length !== 10) {
        return { error: "Please enter a valid 10-digit phone number" };
    }

    try {
        const family = await db
            .select({
                id: families.id,
                fatherName: families.fatherName,
                phone: families.phone,
                balance: families.balance,
            })
            .from(families)
            .where(eq(families.phone, phone))
            .limit(1);

        if (family.length === 0) {
            return { error: "No family found with this phone number" };
        }

        return { family: family[0] };
    } catch (error) {
        console.error("Error looking up family:", error);
        return { error: "Failed to lookup family" };
    }
}

// Get children for a family
export async function getFamilyChildren(familyId: number) {
    try {
        const children = await db
            .select({
                id: students.id,
                name: students.name,
                class: students.class,
                isActive: students.isActive,
            })
            .from(students)
            .where(eq(students.familyId, familyId));

        return { children };
    } catch (error) {
        console.error("Error fetching children:", error);
        return { children: [], error: "Failed to fetch children" };
    }
}

// Get payment history for parent view
export async function getParentPaymentHistory(familyId: number, limit = 10) {
    try {
        const history = await db
            .select({
                id: transactions.id,
                type: transactions.type,
                amount: transactions.amount,
                description: transactions.description,
                createdAt: transactions.createdAt,
                receiptNumber: transactions.receiptNumber,
                paymentMode: transactions.paymentMode,
            })
            .from(transactions)
            .where(eq(transactions.familyId, familyId))
            .orderBy(desc(transactions.createdAt))
            .limit(limit);

        return { transactions: history };
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return { transactions: [], error: "Failed to fetch history" };
    }
}
// Get attendance for a student
export async function getStudentAttendance(studentId: number, month?: number, year?: number) {
    try {
        const query = db
            .select({
                id: attendance.id,
                date: attendance.date,
                status: attendance.status,
                batchId: attendance.batchId,
            })
            .from(attendance)
            .where(eq(attendance.studentId, studentId));

        // If month/year provided, filter (Postgres date is YYYY-MM-DD string or Date object depending on driver)
        // For Postgres, we can use string matching or date functions. 
        // Simple approach: Fetch all and filter in JS if the numbers are small, or use sql``
        const records = await query;

        // Basic filtering if month/year are provided
        type RecordRow = typeof records[number];
        const filtered = records.filter((r: RecordRow) => {
            const d = new Date(r.date);
            if (month !== undefined && d.getMonth() !== month) return false;
            if (year !== undefined && d.getFullYear() !== year) return false;
            return true;
        });

        return { attendance: filtered };
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return { attendance: [], error: "Failed to fetch attendance" };
    }
}

// Get batches a student is enrolled in
export async function getStudentBatches(studentId: number) {
    try {
        const studentBatches = await db
            .select({
                id: batches.id,
                name: batches.name,
                schedule: batches.schedule,
                teacherName: staff.name,
                isActive: enrollments.isActive
            })
            .from(enrollments)
            .innerJoin(batches, eq(enrollments.batchId, batches.id))
            .leftJoin(staff, eq(batches.teacherId, staff.id))
            .where(eq(enrollments.studentId, studentId));

        return { batches: studentBatches };
    } catch (error) {
        console.error("Error fetching student batches:", error);
        return { batches: [], error: "Failed to fetch schedules" };
    }
}
