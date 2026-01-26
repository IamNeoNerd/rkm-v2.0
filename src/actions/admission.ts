"use server";

import { db } from "@/db";
import { families, students, transactions } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { calculateJoiningFee } from "@/lib/billing";
import { safeRevalidatePath } from "@/lib/server-utils";
import { requireAuth, AuthorizationError } from "@/lib/auth-guard";

// Types for the form submission
export type AdmissionData = {
    fatherName: string;
    phone: string;
    studentName: string;
    studentClass: string;
    monthlyFee: number;
    joiningDate: Date;
    initialPayment?: number; // Check if they pay immediately
};

export async function processAdmission(data: AdmissionData) {
    try {
        // Authorization: Any verified user can process admission
        await requireAuth();

        // Input sanitization
        const sanitizedData = {
            fatherName: data.fatherName.trim(),
            phone: data.phone.trim(),
            studentName: data.studentName.trim(),
            studentClass: data.studentClass.trim(),
            monthlyFee: data.monthlyFee,
            joiningDate: data.joiningDate,
            initialPayment: data.initialPayment,
        };

        const result = await db.transaction(async (tx: any) => {
            // 1. Check or Create Family
            let familyId: number;
            const existingFamily = await tx.query.families.findFirst({
                where: eq(families.phone, sanitizedData.phone),
            });

            if (existingFamily) {
                familyId = existingFamily.id;
            } else {
                const [newFamily] = await tx.insert(families).values({
                    fatherName: sanitizedData.fatherName,
                    phone: sanitizedData.phone,
                    balance: 0,
                }).returning({ id: families.id });
                familyId = newFamily.id;
            }

            // 2. Billing Calculation Verification
            const billingCalc = calculateJoiningFee(sanitizedData.joiningDate, sanitizedData.monthlyFee);

            // 3. Create Student
            const [newStudent] = await tx.insert(students).values({
                familyId,
                name: sanitizedData.studentName,
                class: sanitizedData.studentClass,
                isActive: true,
            }).returning({ id: students.id });

            // 4. Create Transaction (Initial Debit/Demand)
            const amountToBill = sanitizedData.initialPayment ?? billingCalc.suggestedAmount;

            await tx.insert(transactions).values({
                type: "DEBIT",
                category: "FEE",
                amount: amountToBill,
                familyId: familyId,
                description: `Admission Fee for ${sanitizedData.studentName} (${billingCalc.explanation})`,
            });

            // Update Family Balance
            await tx.update(families)
                .set({
                    balance: sql`${families.balance} - ${amountToBill}`,
                    updatedAt: new Date()
                })
                .where(eq(families.id, familyId));

            return { studentId: newStudent.id, familyId, billingDetails: billingCalc };
        });

        safeRevalidatePath("/admission");
        safeRevalidatePath("/");
        return { success: true, ...result };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Admission Error:", error);
        return { success: false, error: "Failed to process admission" };
    }
}

export async function getAllStudents(options?: {
    page?: number;
    limit?: number;
    search?: string;
    class?: string;
    status?: string;
}) {
    try {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;
        const search = options?.search?.trim() || '';
        const className = options?.class;
        const status = options?.status;

        // Build where conditions
        const whereConditions = [];

        if (search) {
            whereConditions.push(sql`${students.name} ILIKE ${'%' + search + '%'} OR ${families.fatherName} ILIKE ${'%' + search + '%'} OR ${families.phone} ILIKE ${'%' + search + '%'}`);
        }

        if (className && className !== 'all') {
            whereConditions.push(eq(students.class, className));
        }

        if (status === 'active') {
            whereConditions.push(eq(students.isActive, true));
        } else if (status === 'inactive') {
            whereConditions.push(eq(students.isActive, false));
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        // Get paginated results
        const queryBuilder = db
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
            .leftJoin(families, eq(students.familyId, families.id));

        const allStudents = whereClause
            ? await queryBuilder.where(whereClause).orderBy(students.name).limit(limit).offset(offset)
            : await queryBuilder.orderBy(students.name).limit(limit).offset(offset);

        // Get total count for pagination (correctly taking filters into account)
        const countQueryBuilder = db
            .select({ count: sql<number>`count(*)` })
            .from(students)
            .leftJoin(families, eq(students.familyId, families.id));

        const countResult = whereClause
            ? await countQueryBuilder.where(whereClause)
            : await countQueryBuilder;

        const total = Number(countResult[0]?.count || 0);

        return {
            students: allStudents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error("Error fetching students:", error);
        return { students: [], error: "Failed to fetch students" };
    }
}

export async function getFamilyDetails(familyId: number) {
    try {
        const family = await (db as any).query.families.findFirst({
            where: eq(families.id, familyId),
            with: {
                students: {
                    where: eq(students.isActive, true),
                },
            },
        });

        if (!family) {
            return { error: "Family not found" };
        }

        return { family };
    } catch (error) {
        console.error("Error fetching family:", error);
        return { error: "Failed to fetch family details" };
    }
}

/**
 * Update family details
 */
export async function updateFamily(
    familyId: number,
    data: {
        fatherName?: string;
        phone?: string;
    }
) {
    try {
        // Authorization: Any verified user can update family details
        await requireAuth();

        // Input sanitization
        const updateData: Record<string, unknown> = {};
        if (data.fatherName !== undefined) updateData.fatherName = data.fatherName.trim();
        if (data.phone !== undefined) updateData.phone = data.phone.trim();
        updateData.updatedAt = new Date();

        // Check for duplicate phone if phone is being updated
        if (data.phone) {
            const existing = await db.query.families.findFirst({
                where: eq(families.phone, data.phone.trim())
            });
            if (existing && existing.id !== familyId) {
                return { success: false, error: "Another family with this phone number already exists." };
            }
        }

        const [updated] = await db
            .update(families)
            .set(updateData)
            .where(eq(families.id, familyId))
            .returning();

        if (!updated) {
            return { success: false, error: "Family not found" };
        }

        safeRevalidatePath("/");
        safeRevalidatePath(`/families/${familyId}`);

        return { success: true, family: updated };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error updating family:", error);
        return { success: false, error: "Failed to update family" };
    }
}

/**
 * Update student details
 */
export async function updateStudent(
    studentId: number,
    data: {
        name?: string;
        class?: string;
        baseFeeOverride?: number | null;
    }
) {
    try {
        // Authorization: Any verified user can update student details
        await requireAuth();

        // Input sanitization
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.class !== undefined) updateData.class = data.class.trim();
        if (data.baseFeeOverride !== undefined) updateData.baseFeeOverride = data.baseFeeOverride;

        const [updated] = await db
            .update(students)
            .set(updateData)
            .where(eq(students.id, studentId))
            .returning();

        if (!updated) {
            return { success: false, error: "Student not found" };
        }

        safeRevalidatePath("/");
        safeRevalidatePath(`/students/${studentId}`);

        return { success: true, student: updated };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error updating student:", error);
        return { success: false, error: "Failed to update student" };
    }
}

/**
 * Deactivate a student (soft delete)
 */
export async function deactivateStudent(studentId: number) {
    try {
        // Authorization: Admin or Super Admin only
        await requireAuth();

        const [updated] = await db
            .update(students)
            .set({ isActive: false })
            .where(eq(students.id, studentId))
            .returning();

        if (!updated) {
            return { success: false, error: "Student not found" };
        }

        safeRevalidatePath("/");
        safeRevalidatePath(`/students/${studentId}`);

        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error deactivating student:", error);
        return { success: false, error: "Failed to deactivate student" };
    }
}
