"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ne, sql } from "drizzle-orm";
import { audit, AuditAction } from "@/lib/logger";
import { auth } from "@/auth";
import { safeRevalidatePath } from "@/lib/server-utils";

export async function getUsers() {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
        return { success: false, error: "Unauthorized", users: [] };
    }

    try {
        const userList = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            isVerified: users.isVerified,
            image: users.image,
            createdAt: users.createdAt,
        }).from(users);

        // Serialize dates for SSR compatibility
        const serializedUsers = userList.map((u: any) => ({
            ...u,
            createdAt: u.createdAt?.toISOString() || null,
        }));

        return { success: true, users: serializedUsers };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Failed to fetch users", users: [] };
    }
}

export async function verifyUser(userId: string) {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
        throw new Error("Unauthorized");
    }

    await db.update(users)
        .set({ isVerified: true })
        .where(eq(users.id, userId));

    await audit(AuditAction.USER_UPDATE, { userId, verified: true }, 'user', userId);

    safeRevalidatePath("/settings/users");
    return { success: true };
}

export async function updateUserRole(userId: string, newRole: string) {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
        throw new Error("Unauthorized");
    }

    // Role validation
    if (!["super-admin", "admin", "teacher", "cashier", "parent", "user"].includes(newRole)) {
        throw new Error("Invalid role");
    }

    // Prevent self-demotion if they are the only super-admin
    if (userId === session.user.id && newRole !== "super-admin") {
        const superAdmins = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(eq(users.role, "super-admin"));

        if (Number(superAdmins[0]?.count || 0) <= 1) {
            throw new Error("Cannot demote yourself. At least one super-admin must exist.");
        }
    }

    await db.update(users)
        .set({ role: newRole })
        .where(eq(users.id, userId));

    await audit(AuditAction.USER_UPDATE, { userId, newRole }, 'user', userId);

    safeRevalidatePath("/settings/users");
    return { success: true };
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
        throw new Error("Unauthorized");
    }

    if (userId === session.user.id) {
        throw new Error("Cannot delete yourself");
    }

    // Prevent deleting the last super-admin
    const [userToDelete] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    if (userToDelete?.role === "super-admin") {
        const superAdmins = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(eq(users.role, "super-admin"));

        if (Number(superAdmins[0]?.count || 0) <= 1) {
            throw new Error("Cannot delete the last super-admin.");
        }
    }

    await db.delete(users).where(eq(users.id, userId));

    await audit(AuditAction.USER_DELETE, { userId }, 'user', userId);

    safeRevalidatePath("/settings/users");
    return { success: true };
}

/**
 * Reset password for any user (admin/super-admin only)
 */
export async function resetUserPassword(userId: string, newPassword: string) {
    const session = await auth();
    if (!session || !["super-admin", "admin"].includes(session.user.role)) {
        throw new Error("Unauthorized");
    }

    if (!newPassword || newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
    }

    // Import bcrypt dynamically to avoid issues
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.update(users)
        .set({
            password: hashedPassword,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

    await audit(AuditAction.USER_UPDATE, { userId, action: "password_reset" }, 'user', userId);

    safeRevalidatePath("/settings/users");
    return { success: true };
}
