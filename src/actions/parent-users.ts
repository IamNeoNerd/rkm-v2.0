"use server";

import { db } from "@/db";
import { users, families } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { audit, AuditAction } from "@/lib/logger";
import { safeRevalidatePath } from "@/lib/server-utils";

/**
 * Create a parent user account linked to a family
 * Only admin/super-admin can create parent accounts
 */
export async function createParentUser(data: {
    familyId: number;
    password: string;
}) {
    const session = await auth();
    if (!session || !["super-admin", "admin"].includes(session.user.role)) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get family details
        const [family] = await db
            .select()
            .from(families)
            .where(eq(families.id, data.familyId))
            .limit(1);

        if (!family) {
            return { success: false, error: "Family not found" };
        }

        // Check if parent user already exists with this phone
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.phone, family.phone))
            .limit(1);

        if (existingUser) {
            return { success: false, error: "Parent user already exists for this phone number" };
        }

        // Create parent user
        const hashedPassword = await bcrypt.hash(data.password, 12);

        const [newUser] = await db.insert(users).values({
            name: family.fatherName,
            email: `parent_${family.phone}@rkinstitute.local`, // Generated email for parents
            phone: family.phone,
            password: hashedPassword,
            role: "parent",
            isVerified: true, // Auto-verify parent accounts
        }).returning();

        await audit(AuditAction.USER_CREATE, {
            userId: newUser.id,
            familyId: data.familyId,
            role: "parent"
        }, 'user', newUser.id);

        safeRevalidatePath("/settings/users");

        return {
            success: true,
            user: {
                id: newUser.id,
                phone: family.phone,
                name: family.fatherName
            }
        };
    } catch (error) {
        console.error("Error creating parent user:", error);
        return { success: false, error: "Failed to create parent user" };
    }
}

/**
 * Get parent user by family phone
 */
export async function getParentUserByPhone(phone: string) {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            phone: users.phone,
            role: users.role,
            isVerified: users.isVerified,
        })
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

    return user || null;
}

/**
 * Get family data for a logged-in parent user
 */
export async function getParentFamilyData() {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    if (session.user.role !== "parent") {
        return { success: false, error: "Not a parent account" };
    }

    // Get user phone
    const [user] = await db
        .select({ phone: users.phone })
        .from(users)
        .where(eq(users.email, session.user.email!))
        .limit(1);

    if (!user?.phone) {
        return { success: false, error: "Phone number not found" };
    }

    // Get family by phone
    const [family] = await db.query.families.findMany({
        where: eq(families.phone, user.phone),
        with: {
            students: {
                with: {
                    enrollments: {
                        with: {
                            batch: true,
                        }
                    }
                }
            },
            transactions: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                orderBy: (t: any, { desc }: any) => [desc(t.createdAt)],
                limit: 20,
            }
        },
        limit: 1,
    });

    if (!family) {
        return { success: false, error: "Family not found" };
    }

    return {
        success: true,
        family: {
            ...family,
            // Serialize dates
            createdAt: family.createdAt?.toISOString() || null,
            updatedAt: family.updatedAt?.toISOString() || null,
            students: family.students.map((s) => ({
                ...s,
                createdAt: s.createdAt?.toISOString() || null,
                updatedAt: s.updatedAt?.toISOString() || null,
            })),
            transactions: family.transactions.map((t) => ({
                ...t,
                createdAt: t.createdAt?.toISOString() || null,
            })),
        }
    };
}

/**
 * Reset password for parent user (by admin)
 */
export async function resetParentPassword(phone: string, newPassword: string) {
    const session = await auth();
    if (!session || !["super-admin", "admin"].includes(session.user.role)) {
        return { success: false, error: "Unauthorized" };
    }

    if (!newPassword || newPassword.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" };
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

    if (!user) {
        return { success: false, error: "Parent user not found" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.update(users)
        .set({
            password: hashedPassword,
            updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

    await audit(AuditAction.USER_UPDATE, {
        userId: user.id,
        action: "parent_password_reset"
    }, 'user', user.id);

    return { success: true };
}
