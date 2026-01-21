"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { safeRevalidatePath } from "@/lib/server-utils";

/**
 * Change password for the currently logged-in user
 */
export async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Not authenticated" };
        }

        // Validate input
        if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
            return { success: false, error: "All fields are required" };
        }

        if (data.newPassword !== data.confirmPassword) {
            return { success: false, error: "New passwords do not match" };
        }

        if (data.newPassword.length < 8) {
            return { success: false, error: "Password must be at least 8 characters" };
        }

        // Get user from database
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

        if (!user || !user.password) {
            return { success: false, error: "User not found or has no password set (OAuth user)" };
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);
        if (!isValidPassword) {
            return { success: false, error: "Current password is incorrect" };
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);
        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, user.id));

        safeRevalidatePath("/settings/profile");
        return { success: true };
    } catch (error) {
        console.error("Error changing password:", error);
        return { success: false, error: "Failed to change password" };
    }
}

/**
 * Admin force reset password for a user (super-admin only)
 */
export async function adminResetPassword(userId: string, newPassword: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "super-admin") {
            return { success: false, error: "Not authorized" };
        }

        if (!newPassword || newPassword.length < 8) {
            return { success: false, error: "Password must be at least 8 characters" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, userId));

        return { success: true };
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, error: "Failed to reset password" };
    }
}
