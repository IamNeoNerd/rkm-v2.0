"use server";

import { db } from "@/db";
import { notifications, users, families, students } from "@/db/schema";
import { eq, desc, and, count, sql, lte } from "drizzle-orm";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";

// Notification types
export type NotificationType =
    | "FEE_REMINDER"
    | "PAYMENT_RECEIVED"
    | "ATTENDANCE_ALERT"
    | "BATCH_UPDATE"
    | "SYSTEM_ALERT"
    | "GENERAL";

export interface Notification {
    id: number;
    userId: string | null;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, unknown> | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
}

// ============================================
// Create Notifications
// ============================================

interface CreateNotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
}

export async function createNotification(data: CreateNotificationData) {
    try {
        const [notification] = await db
            .insert(notifications)
            .values({
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data ? JSON.stringify(data.data) : null,
                isRead: false,
            })
            .returning();

        return { success: true, notification };
    } catch (error) {
        logger.error("Failed to create notification", error);
        return { success: false, error: "Failed to create notification" };
    }
}

// Batch create for multiple users
export async function createBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
) {
    try {
        const values = userIds.map(userId => ({
            userId,
            type,
            title,
            message,
            data: data ? JSON.stringify(data) : null,
            isRead: false,
        }));

        await db.insert(notifications).values(values);

        logger.info(`Created ${userIds.length} notifications`, { type, title });
        return { success: true, count: userIds.length };
    } catch (error) {
        logger.error("Failed to create bulk notifications", error);
        return { success: false, error: "Failed to create notifications" };
    }
}

// ============================================
// Get Notifications
// ============================================

export async function getUserNotifications(options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized", notifications: [] };
        }

        const { page = 1, limit = 20, unreadOnly = false } = options || {};
        const offset = (page - 1) * limit;

        // Get user ID from email
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

        if (!user) {
            return { success: true, notifications: [], unreadCount: 0, pagination: { total: 0, page, limit, totalPages: 0 } };
        }

        // Build conditions
        const conditions = [eq(notifications.userId, user.id)];
        if (unreadOnly) {
            conditions.push(eq(notifications.isRead, false));
        }

        const results = await db
            .select()
            .from(notifications)
            .where(and(...conditions))
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
            .offset(offset);

        // Get counts
        const [unreadResult] = await db
            .select({ count: count() })
            .from(notifications)
            .where(and(
                eq(notifications.userId, user.id),
                eq(notifications.isRead, false)
            ));

        const [totalResult] = await db
            .select({ count: count() })
            .from(notifications)
            .where(and(...conditions));

        const total = Number(totalResult?.count || 0);

        const parsedNotifications: Notification[] = results.map((n: any) => ({
            ...n,
            data: n.data ? JSON.parse(n.data) : null,
        }));

        return {
            success: true,
            notifications: parsedNotifications,
            unreadCount: Number(unreadResult?.count || 0),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        logger.error("Failed to fetch notifications", error);
        return { success: false, notifications: [], error: "Failed to fetch notifications" };
    }
}

// ============================================
// Mark as Read
// ============================================

export async function markNotificationRead(notificationId: number) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        await db
            .update(notifications)
            .set({ isRead: true, readAt: new Date() })
            .where(eq(notifications.id, notificationId));

        return { success: true };
    } catch (error) {
        logger.error("Failed to mark notification as read", error);
        return { success: false, error: "Failed to update notification" };
    }
}

export async function markAllNotificationsRead() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        // Get user ID
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

        if (!user) {
            return { success: false, error: "User not found" };
        }

        await db
            .update(notifications)
            .set({ isRead: true, readAt: new Date() })
            .where(and(
                eq(notifications.userId, user.id),
                eq(notifications.isRead, false)
            ));

        return { success: true };
    } catch (error) {
        logger.error("Failed to mark all notifications as read", error);
        return { success: false, error: "Failed to update notifications" };
    }
}

// ============================================
// Notification Triggers (Business Logic)
// ============================================

/**
 * Send fee reminder notification to families with outstanding dues
 */
export async function sendFeeReminders() {
    try {
        // Get families with negative balance (dues)
        const familiesWithDue = await db
            .select({
                id: families.id,
                fatherName: families.fatherName,
                balance: families.balance,
            })
            .from(families)
            .where(sql`${families.balance} < 0`);

        // For MVP, we'll just log this - in production, you'd send actual notifications
        // to linked user accounts
        logger.info(`Found ${familiesWithDue.length} families with outstanding dues`);

        // Get all admin users to notify
        const admins = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.role, 'admin'));

        if (admins.length > 0) {
            const adminIds = admins.map((a: any) => a.id);
            await createBulkNotifications(
                adminIds,
                "FEE_REMINDER",
                "Outstanding Dues Report",
                `${familiesWithDue.length} families have outstanding fees totaling ₹${Math.abs(familiesWithDue.reduce((sum: number, f: any) => sum + f.balance, 0))
                }`,
                { familyCount: familiesWithDue.length }
            );
        }

        return {
            success: true,
            familiesNotified: familiesWithDue.length,
            totalDue: Math.abs(familiesWithDue.reduce((sum: number, f: any) => sum + f.balance, 0))
        };
    } catch (error) {
        logger.error("Failed to send fee reminders", error);
        return { success: false, error: "Failed to send fee reminders" };
    }
}

/**
 * Notify about payment received
 */
export async function notifyPaymentReceived(
    familyId: number,
    amount: number,
    receiptNumber: string
) {
    try {
        // Get all admin users
        const admins = await db
            .select({ id: users.id })
            .from(users)
            .where(sql`${users.role} IN ('admin', 'super-admin')`);

        if (admins.length > 0) {
            const adminIds = admins.map((a: any) => a.id);
            await createBulkNotifications(
                adminIds,
                "PAYMENT_RECEIVED",
                "Payment Received",
                `Payment of ₹${amount} received. Receipt: ${receiptNumber}`,
                { familyId, amount, receiptNumber }
            );
        }

        return { success: true };
    } catch (error) {
        logger.error("Failed to send payment notification", error);
        return { success: false, error: "Failed to send notification" };
    }
}

/**
 * Notify about attendance issues
 */
export async function notifyAttendanceAlert(
    studentId: number,
    studentName: string,
    absentDates: string[]
) {
    try {
        // Get all admin users
        const admins = await db
            .select({ id: users.id })
            .from(users)
            .where(sql`${users.role} IN ('admin', 'super-admin')`);

        if (admins.length > 0) {
            const adminIds = admins.map((a: any) => a.id);
            await createBulkNotifications(
                adminIds,
                "ATTENDANCE_ALERT",
                "Attendance Alert",
                `${studentName} has been absent for ${absentDates.length} days`,
                { studentId, studentName, absentDates }
            );
        }

        return { success: true };
    } catch (error) {
        logger.error("Failed to send attendance notification", error);
        return { success: false, error: "Failed to send notification" };
    }
}

/**
 * Send system-wide notification
 */
export async function sendSystemNotification(
    title: string,
    message: string,
    data?: Record<string, unknown>
) {
    try {
        // Get all verified users
        const allUsers = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.isVerified, true));

        if (allUsers.length > 0) {
            const userIds = allUsers.map((u: any) => u.id);
            await createBulkNotifications(
                userIds,
                "SYSTEM_ALERT",
                title,
                message,
                data
            );
        }

        return { success: true, usersNotified: allUsers.length };
    } catch (error) {
        logger.error("Failed to send system notification", error);
        return { success: false, error: "Failed to send notification" };
    }
}

// ============================================
// Delete Notifications
// ============================================

export async function deleteNotification(id: number) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        await db.delete(notifications).where(eq(notifications.id, id));
        return { success: true };
    } catch (error) {
        logger.error("Failed to delete notification", error);
        return { success: false, error: "Failed to delete notification" };
    }
}

export async function deleteAllNotifications() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        // Get user ID
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

        if (!user) {
            return { success: false, error: "User not found" };
        }

        await db.delete(notifications).where(eq(notifications.userId, user.id));

        return { success: true };
    } catch (error) {
        logger.error("Failed to delete all notifications", error);
        return { success: false, error: "Failed to clear notification history" };
    }
}
