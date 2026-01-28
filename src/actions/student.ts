"use server";

import { db } from "@/db";
import { students, families, transactions, enrollments, batches, attendance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Get student by ID with family info
export async function getStudentById(id: number) {
    try {
        const result = await db
            .select({
                id: students.id,
                name: students.name,
                class: students.class,
                isActive: students.isActive,
                familyId: students.familyId,
                fatherName: families.fatherName,
                phone: families.phone,
                balance: families.balance,
            })
            .from(students)
            .leftJoin(families, eq(students.familyId, families.id))
            .where(eq(students.id, id))
            .limit(1);

        if (result.length === 0) {
            return { student: null };
        }

        return { student: result[0] };
    } catch (error) {
        console.error("Error fetching student:", error);
        return { student: null, error: "Failed to fetch student" };
    }
}

// Get fee/payment history for a family
export async function getFamilyFeeHistory(familyId: number, limit = 20) {
    try {
        const history = await db
            .select({
                id: transactions.id,
                type: transactions.type,
                category: transactions.category,
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

        // Get current balance
        const family = await db
            .select({ balance: families.balance })
            .from(families)
            .where(eq(families.id, familyId))
            .limit(1);

        return {
            transactions: history,
            balance: family[0]?.balance ?? 0,
        };
    } catch (error) {
        console.error("Error fetching fee history:", error);
        return { transactions: [], balance: 0, error: "Failed to fetch history" };
    }
}

// Get student's enrolled batches
export async function getStudentEnrollments(studentId: number) {
    try {
        const enrolled = await db
            .select({
                id: enrollments.id,
                batchId: batches.id,
                batchName: batches.name,
                fee: batches.fee,
                schedule: batches.schedule,
                isActive: enrollments.isActive,
            })
            .from(enrollments)
            .innerJoin(batches, eq(enrollments.batchId, batches.id))
            .where(eq(enrollments.studentId, studentId));

        return { enrollments: enrolled };
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        return { enrollments: [], error: "Failed to fetch enrollments" };
    }
}

// Get student's recent attendance records
export async function getStudentAttendance(studentId: number, limit = 30) {
    try {
        const history = await db
            .select({
                id: attendance.id,
                date: attendance.date,
                status: attendance.status,
                batchName: batches.name,
            })
            .from(attendance)
            .innerJoin(batches, eq(attendance.batchId, batches.id))
            .where(eq(attendance.studentId, studentId))
            .orderBy(desc(attendance.date))
            .limit(limit);

        return { attendance: history };
    } catch (error) {
        console.error("Error fetching attendance history:", error);
        return { attendance: [], error: "Failed to fetch attendance history" };
    }
}
