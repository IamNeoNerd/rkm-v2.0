"use server";

import { db } from "@/db";
import { families, students, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { audit, AuditAction } from "@/lib/logger";
import { safeRevalidatePath } from "@/lib/server-utils";

/**
 * Lookup family by phone number (for cashier)
 */
export async function lookupFamilyByPhone(phone: string) {
    const session = await auth();
    if (!session?.user || !["cashier", "admin", "super-admin"].includes(session.user.role)) {
        return { error: "Unauthorized" };
    }

    try {
        const [family] = await db
            .select({
                id: families.id,
                fatherName: families.fatherName,
                phone: families.phone,
                balance: families.balance,
            })
            .from(families)
            .where(eq(families.phone, phone))
            .limit(1);

        if (!family) {
            return { error: "Family not found" };
        }

        const children = await db
            .select({
                id: students.id,
                name: students.name,
                class: students.class,
                isActive: students.isActive,
            })
            .from(students)
            .where(eq(students.familyId, family.id));

        return { family, children };
    } catch (error) {
        console.error("Error looking up family:", error);
        return { error: "Failed to look up family" };
    }
}

/**
 * Collect fee from family (for cashier)
 */
export async function collectFee(data: {
    familyId: number;
    amount: number;
    paymentMode: "CASH" | "UPI";
}) {
    const session = await auth();
    if (!session?.user || !["cashier", "admin", "super-admin"].includes(session.user.role)) {
        return { success: false, error: "Unauthorized" };
    }

    if (data.amount <= 0) {
        return { success: false, error: "Amount must be positive" };
    }

    try {
        // Generate receipt number
        const receiptNumber = `RKI-${Date.now().toString(36).toUpperCase()}`;

        // Create transaction
        await db.insert(transactions).values({
            type: "CREDIT",
            category: "FEE",
            amount: data.amount,
            familyId: data.familyId,
            receiptNumber,
            paymentMode: data.paymentMode,
            description: `Fee payment via ${data.paymentMode}`,
            performedBy: session.user.id,
        });

        // Update family balance
        await db.execute(`
            UPDATE families 
            SET balance = balance + ${data.amount}
            WHERE id = ${data.familyId}
        `);

        await audit(AuditAction.PAYMENT_RECEIVE, {
            familyId: data.familyId,
            amount: data.amount,
            receiptNumber,
            paymentMode: data.paymentMode,
        }, 'family', String(data.familyId));

        safeRevalidatePath("/cashier");
        safeRevalidatePath("/cashier/fees");

        return { success: true, receiptNumber };
    } catch (error) {
        console.error("Error collecting fee:", error);
        return { success: false, error: "Failed to collect fee" };
    }
}

/**
 * Register new admission (simplified version for cashier)
 */
export async function registerAdmission(data: {
    fatherName: string;
    motherName: string;
    phone: string;
    address: string;
    studentName: string;
    studentClass: string;
    admissionFee?: number;
}) {
    const session = await auth();
    if (!session?.user || !["cashier", "admin", "super-admin"].includes(session.user.role)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if phone already exists
        const [existingFamily] = await db
            .select()
            .from(families)
            .where(eq(families.phone, data.phone))
            .limit(1);

        let familyId: number;

        if (existingFamily) {
            // Add student to existing family
            familyId = existingFamily.id;
        } else {
            // Create new family (motherName and address not in schema)
            const [newFamily] = await db.insert(families).values({
                fatherName: data.fatherName,
                phone: data.phone,
                balance: 0,
            }).returning();
            familyId = newFamily.id;
        }

        // Create student
        const [newStudent] = await db.insert(students).values({
            name: data.studentName,
            class: data.studentClass,
            familyId,
            isActive: true,
        }).returning();

        // Record admission fee if paid
        if (data.admissionFee && data.admissionFee > 0) {
            const receiptNumber = `ADM-${Date.now().toString(36).toUpperCase()}`;

            await db.insert(transactions).values({
                type: "CREDIT",
                category: "FEE",
                amount: data.admissionFee,
                familyId,
                receiptNumber,
                paymentMode: "CASH",
                description: `Admission fee for ${data.studentName}`,
                performedBy: session.user.id,
            });

            // Update balance
            await db.execute(`
                UPDATE families 
                SET balance = balance + ${data.admissionFee}
                WHERE id = ${familyId}
            `);
        }

        await audit(AuditAction.ADMISSION_CREATE, {
            studentId: newStudent.id,
            familyId,
            studentName: data.studentName,
            studentClass: data.studentClass,
        }, 'student', String(newStudent.id));

        safeRevalidatePath("/cashier");
        safeRevalidatePath("/students");

        return {
            success: true,
            studentId: newStudent.id,
            familyId,
            message: `${data.studentName} admitted successfully!`
        };
    } catch (error) {
        console.error("Error registering admission:", error);
        return { success: false, error: "Failed to register admission" };
    }
}
