"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getUsers() {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
        throw new Error("Unauthorized");
    }

    return await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        image: users.image,
        createdAt: users.createdAt,
    }).from(users);
}

export async function verifyUser(userId: string) {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
        throw new Error("Unauthorized");
    }

    await db.update(users)
        .set({ isVerified: true })
        .where(eq(users.id, userId));

    revalidatePath("/settings/users");
    return { success: true };
}

export async function updateUserRole(userId: string, newRole: string) {
    const session = await auth();
    if (!session || session.user.role !== "super-admin") {
        throw new Error("Unauthorized");
    }

    // Role validation
    if (!["super-admin", "admin", "user"].includes(newRole)) {
        throw new Error("Invalid role");
    }

    // Prevent self-demotion if necessary (optional safeguard)
    if (userId === session.user.id && newRole !== "super-admin") {
        // Allow it for now if they really want to, but maybe warn?
        // Let's just allow it, but usually standard practice is to prevent self-lockout.
    }

    await db.update(users)
        .set({ role: newRole })
        .where(eq(users.id, userId));

    revalidatePath("/settings/users");
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

    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/settings/users");
    return { success: true };
}
