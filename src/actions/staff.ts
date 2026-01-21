
'use server';

import { db } from "@/db";
import { staff, transactions, users } from "@/db/schema";
import { eq, desc, sql, or } from "drizzle-orm";
import { safeRevalidatePath } from "@/lib/server-utils";
import { requireRole, AuthorizationError } from "@/lib/auth-guard";
import bcrypt from "bcryptjs";

export type StaffRole = "ADMIN" | "TEACHER" | "RECEPTIONIST" | "STAFF";

export async function getAllStaff(options?: {
    page?: number;
    limit?: number;
    search?: string;
}) {
    try {
        // Authorization: Admin or Super Admin only
        await requireRole(["admin", "super-admin"]);

        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const offset = (page - 1) * limit;
        const search = options?.search?.trim() || '';

        // Build where condition
        const whereCondition = search
            ? sql`${staff.name} ILIKE ${'%' + search + '%'} OR ${staff.phone} ILIKE ${'%' + search + '%'} OR ${staff.email} ILIKE ${'%' + search + '%'}`
            : undefined;

        // Get paginated results
        const queryBuilder = db.select().from(staff);

        const allStaff = whereCondition
            ? await queryBuilder.where(whereCondition).orderBy(desc(staff.createdAt)).limit(limit).offset(offset)
            : await queryBuilder.orderBy(desc(staff.createdAt)).limit(limit).offset(offset);

        // Get total count for pagination
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(staff);
        const total = Number(countResult[0]?.count || 0);

        return {
            success: true,
            staff: allStaff,
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
        console.error("Error fetching staff:", error);
        return { success: false, error: "Failed to fetch staff" };
    }
}

/**
 * Scenario 3.1: Linking Staff to Login
 */
export async function createStaff(data: {
    name: string;
    phone: string;
    email?: string;
    role: StaffRole;
    roleType?: string; // For custom roles like Sweeper, Peon, Cook, MTS
    baseSalary: number;
}) {
    try {
        // Authorization: Admin or Super Admin only
        await requireRole(["admin", "super-admin"]);

        // Input sanitization
        const sanitizedData = {
            name: data.name.trim(),
            phone: data.phone.trim(),
            email: data.email?.trim(),
            role: data.role,
            baseSalary: data.baseSalary,
        };

        // Check for duplicate phone
        const existing = await db.query.staff.findFirst({
            where: eq(staff.phone, sanitizedData.phone)
        });

        if (existing) {
            return { success: false, error: "Staff with this phone number already exists." };
        }

        const newStaff = await db.insert(staff).values({
            name: sanitizedData.name,
            phone: sanitizedData.phone,
            email: sanitizedData.email,
            role: sanitizedData.role,
            roleType: data.roleType?.trim() || null,
            baseSalary: sanitizedData.baseSalary,
            isActive: true
        }).returning();

        safeRevalidatePath("/staff");
        // Also revalidate academics as the teacher list might change
        safeRevalidatePath("/academics");

        return { success: true, staff: newStaff[0] };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error creating staff:", error);
        return { success: false, error: "Failed to create staff member." };
    }
}

export async function linkStaffAuth(staffId: number, authUserId: string) {
    try {
        // Authorization: Super Admin only (linking auth is sensitive)
        await requireRole(["super-admin"]);

        await db.update(staff)
            .set({ authUserId })
            .where(eq(staff.id, staffId));
        safeRevalidatePath("/staff");
        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        return { success: false, error: "Failed to link auth user" };
    }
}

/**
 * Scenario 3.2: Payroll Payout
 */
export async function paySalary(staffId: number, amount: number) {
    // "This money is deducted from the Institute's Cash on Hand... but does not affect any Family balances."
    // We just record the transaction. Global "Cash on Hand" is usually sum of all transactions.

    try {
        // Authorization: Admin or Super Admin only
        await requireRole(["admin", "super-admin"]);

        // Input validation
        if (amount <= 0) {
            return { success: false, error: "Amount must be positive" };
        }

        await db.insert(transactions).values({
            type: "DEBIT", // Expense for Institute
            category: "SALARY",
            amount: amount,
            staffId: staffId,
            description: "Salary Payout",
        });

        safeRevalidatePath("/finance");
        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Payment error", error);
        return { success: false, error: "Failed to compute salary payout" };
    }
}

/**
 * Update staff member details
 */
export async function updateStaff(
    staffId: number,
    data: {
        name?: string;
        phone?: string;
        email?: string;
        role?: StaffRole;
        roleType?: string | null;
        baseSalary?: number;
        password?: string;
    }
) {
    try {
        // Authorization: Admin or Super Admin only
        await requireRole(["admin", "super-admin"]);

        // Input sanitization
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.phone !== undefined) updateData.phone = data.phone.trim();
        if (data.email !== undefined) updateData.email = data.email?.trim() || null;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.roleType !== undefined) updateData.roleType = data.roleType?.trim() || null;
        if (data.baseSalary !== undefined) updateData.baseSalary = data.baseSalary;
        updateData.updatedAt = new Date();

        // Check for duplicate phone if phone is being updated
        if (data.phone) {
            const existing = await db.query.staff.findFirst({
                where: eq(staff.phone, data.phone.trim())
            });
            if (existing && existing.id !== staffId) {
                return { success: false, error: "Another staff member with this phone number already exists." };
            }
        }

        // Check for duplicate email if email is being updated
        if (data.email) {
            const existingEmail = await db.query.staff.findFirst({
                where: eq(staff.email, data.email.trim())
            });
            if (existingEmail && existingEmail.id !== staffId) {
                return { success: false, error: "Another staff member with this email already exists." };
            }
        }

        // Handle Password Update & User Synchronization
        if (data.password) {
            const staffRecord = await db.query.staff.findFirst({
                where: eq(staff.id, staffId)
            });

            if (staffRecord) {
                const phoneNumber = data.phone || staffRecord.phone;
                const emailAddress = data.email || staffRecord.email;
                const hashedPassword = await bcrypt.hash(data.password, 10);

                // Try to find existing user by phone OR email
                const [existingUser] = await db.select().from(users).where(
                    or(
                        eq(users.phone, phoneNumber),
                        emailAddress ? eq(users.email, emailAddress) : sql`false`
                    )
                ).limit(1);

                if (existingUser) {
                    await db.update(users).set({
                        password: hashedPassword,
                        name: data.name || staffRecord.name,
                        email: emailAddress || existingUser.email,
                        phone: phoneNumber,
                        role: (data.role || staffRecord.role).toLowerCase() === 'admin' ? 'admin' :
                            (data.role || staffRecord.role).toLowerCase() === 'teacher' ? 'teacher' :
                                (data.role || staffRecord.role).toLowerCase() === 'receptionist' ? 'cashier' : 'user',
                        updatedAt: new Date()
                    }).where(eq(users.id, existingUser.id));
                } else {
                    // Create new user for this staff member
                    await db.insert(users).values({
                        name: data.name || staffRecord.name,
                        email: emailAddress || `${phoneNumber}@rkinstitute.com`,
                        phone: phoneNumber,
                        password: hashedPassword,
                        role: (data.role || staffRecord.role).toLowerCase() === 'admin' ? 'admin' :
                            (data.role || staffRecord.role).toLowerCase() === 'teacher' ? 'teacher' :
                                (data.role || staffRecord.role).toLowerCase() === 'receptionist' ? 'cashier' : 'user',
                        isVerified: true,
                        updatedAt: new Date()
                    });
                }
            }
        }

        const [updated] = await db
            .update(staff)
            .set(updateData)
            .where(eq(staff.id, staffId))
            .returning();

        if (!updated) {
            return { success: false, error: "Staff member not found" };
        }

        safeRevalidatePath("/staff");
        safeRevalidatePath("/academics");

        return { success: true, staff: updated };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error updating staff:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update staff member";
        return { success: false, error: errorMessage };
    }
}

/**
 * Soft delete / deactivate a staff member
 */
export async function deactivateStaff(staffId: number) {
    try {
        // Authorization: Super Admin only (deactivation is sensitive)
        await requireRole(["super-admin"]);

        const [updated] = await db
            .update(staff)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(staff.id, staffId))
            .returning();

        if (!updated) {
            return { success: false, error: "Staff member not found" };
        }

        safeRevalidatePath("/staff");
        safeRevalidatePath("/academics");

        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error deactivating staff:", error);
        return { success: false, error: "Failed to deactivate staff member" };
    }
}

/**
 * Reactivate a staff member
 */
export async function reactivateStaff(staffId: number) {
    try {
        // Authorization: Super Admin only
        await requireRole(["super-admin"]);

        const [updated] = await db
            .update(staff)
            .set({ isActive: true, updatedAt: new Date() })
            .where(eq(staff.id, staffId))
            .returning();

        if (!updated) {
            return { success: false, error: "Staff member not found" };
        }

        safeRevalidatePath("/staff");
        safeRevalidatePath("/academics");

        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Error reactivating staff:", error);
        return { success: false, error: "Failed to reactivate staff member" };
    }
}

/**
 * Purge test data created by Playwright
 */
export async function purgeTestStaff() {
    try {
        await requireRole(["super-admin"]);

        const deleted = await db.delete(staff)
            .where(
                or(
                    sql`${staff.name} LIKE 'Test_%'`,
                    sql`${staff.name} LIKE 'TestStaff_%'`
                )
            )
            .returning();

        safeRevalidatePath("/staff");
        return { success: true, count: deleted.length };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        console.error("Purage error", error);
        return { success: false, error: "Failed to purge test personnel" };
    }
}
