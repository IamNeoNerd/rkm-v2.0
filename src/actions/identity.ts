"use server";

import { db } from "@/db";
import { students, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

/**
 * Suggests a unique 6-digit Student ID based on year and sequence.
 * Format: YYNNNN (e.g., 260001 for the first student in 2026)
 */
export async function suggestStudentId(): Promise<{ id: string; error?: string }> {
    try {
        const yearPrefix = new Date().getFullYear().toString().slice(-2);

        // Find the highest existing ID with this year prefix
        const [result] = await db
            .select({ maxId: sql<string>`MAX(student_id)` })
            .from(students)
            .where(sql`student_id LIKE ${yearPrefix + '%'}`);

        let nextSequence = 1;
        if (result?.maxId) {
            const currentSequence = parseInt(result.maxId.slice(2), 10);
            nextSequence = currentSequence + 1;
        }

        const suggestedId = `${yearPrefix}${nextSequence.toString().padStart(4, '0')}`;
        return { id: suggestedId };
    } catch (error) {
        console.error("Error suggesting student ID:", error);
        return { id: "", error: "Failed to generate ID suggestion" };
    }
}

/**
 * Validates that a Student ID is unique (or belongs to the current student).
 */
export async function validateStudentId(
    studentId: string,
    currentStudentDbId?: number
): Promise<{ valid: boolean; error?: string }> {
    if (!/^\d{6}$/.test(studentId)) {
        return { valid: false, error: "Student ID must be exactly 6 digits" };
    }

    try {
        const existing = await db
            .select({ id: students.id })
            .from(students)
            .where(eq(students.studentId, studentId))
            .limit(1);

        if (existing.length > 0 && existing[0].id !== currentStudentDbId) {
            return { valid: false, error: "This Student ID is already in use" };
        }

        return { valid: true };
    } catch (error) {
        console.error("Error validating student ID:", error);
        return { valid: false, error: "Validation failed" };
    }
}

/**
 * Creates or updates the identity (studentId, linked user, passkey) for a student.
 */
export async function updateStudentIdentity(
    studentDbId: number,
    data: {
        studentId: string;
        passkey?: string; // If provided, creates/updates the linked user's password
    }
): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
        // 1. Validate the studentId
        const validation = await validateStudentId(data.studentId, studentDbId);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // 2. Get current student data
        const [student] = await db
            .select()
            .from(students)
            .where(eq(students.id, studentDbId))
            .limit(1);

        if (!student) {
            return { success: false, error: "Student not found" };
        }

        let userId = student.userId;

        // 3. If a passkey is provided, we need to create/update a user account
        if (data.passkey) {
            const hashedPassword = await bcrypt.hash(data.passkey, 10);

            if (userId) {
                // Update existing user's password and display password
                await db.update(users)
                    .set({
                        password: hashedPassword,
                        displayPassword: data.passkey,
                        updatedAt: new Date()
                    })
                    .where(eq(users.id, userId));
            } else {
                // Create a new user account for this student
                const newUserId = crypto.randomUUID();
                await db.insert(users).values({
                    id: newUserId,
                    name: student.name,
                    role: "student",
                    password: hashedPassword,
                    displayPassword: data.passkey,
                    isVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                userId = newUserId;
            }
        }

        // 4. Update the student record
        await db.update(students)
            .set({
                studentId: data.studentId,
                userId: userId,
                updatedAt: new Date(),
            })
            .where(eq(students.id, studentDbId));

        revalidatePath(`/students/${studentDbId}`);
        revalidatePath("/students");

        return { success: true, userId: userId || undefined };
    } catch (error) {
        console.error("Error updating student identity:", error);
        return { success: false, error: "Failed to update identity" };
    }
}

/**
 * Gets the current identity status for a student.
 */
export async function getStudentIdentityStatus(
    studentDbId: number
): Promise<{
    hasIdentity: boolean;
    studentId: string | null;
    hasLinkedUser: boolean;
    displayPassword?: string | null;
    error?: string;
}> {
    try {
        const [student] = await db
            .select({
                studentId: students.studentId,
                userId: students.userId,
            })
            .from(students)
            .where(eq(students.id, studentDbId))
            .limit(1);

        if (student.userId) {
            const [userRecord] = await db
                .select({ displayPassword: users.displayPassword })
                .from(users)
                .where(eq(users.id, student.userId))
                .limit(1);

            return {
                hasIdentity: !!student.studentId,
                studentId: student.studentId,
                hasLinkedUser: true,
                displayPassword: userRecord?.displayPassword,
            };
        }

        return {
            hasIdentity: !!student.studentId,
            studentId: student.studentId,
            hasLinkedUser: false,
        };
    } catch (error) {
        console.error("Error getting identity status:", error);
        return { hasIdentity: false, studentId: null, hasLinkedUser: false, error: "Failed to fetch status" };
    }
}
