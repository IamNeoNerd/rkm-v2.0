"use server";

import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc, eq, like, and, or, sql, count } from "drizzle-orm";
import { auth } from "@/auth";
import { requireRole } from "@/lib/auth-guard";

export interface AuditLogEntry {
    id: number;
    action: string;
    userId: string | null;
    userName: string | null;
    entityType: string | null;
    entityId: string | null;
    details: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export interface AuditLogFilters {
    action?: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
    try {
        await requireRole(['super-admin', 'admin']);
    } catch {
        throw new Error("Unauthorized: Admin access required");
    }

    const {
        action,
        userId,
        entityType,
        entityId,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 50,
    } = filters;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (action) {
        conditions.push(like(auditLogs.action, `${action}%`));
    }

    if (userId) {
        conditions.push(eq(auditLogs.userId, userId));
    }

    if (entityType) {
        conditions.push(eq(auditLogs.entityType, entityType));
    }

    if (entityId) {
        conditions.push(eq(auditLogs.entityId, entityId));
    }

    if (startDate) {
        conditions.push(sql`${auditLogs.createdAt} >= ${new Date(startDate)}`);
    }

    if (endDate) {
        conditions.push(sql`${auditLogs.createdAt} <= ${new Date(endDate)}`);
    }

    if (search) {
        conditions.push(
            or(
                like(auditLogs.action, `%${search}%`),
                like(auditLogs.userName, `%${search}%`),
                like(auditLogs.details, `%${search}%`)
            )
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
        .select({ total: count() })
        .from(auditLogs)
        .where(whereClause);

    // Get logs
    const logs = await db
        .select()
        .from(auditLogs)
        .where(whereClause)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

    // Parse details JSON for each log
    const parsedLogs: AuditLogEntry[] = logs.map((log: any) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
    }));

    return {
        success: true,
        logs: parsedLogs,
        pagination: {
            page,
            limit,
            total: countResult?.total || 0,
            totalPages: Math.ceil((countResult?.total || 0) / limit),
        },
    };
}

export async function getAuditLogStats() {
    try {
        await requireRole(['super-admin', 'admin']);
    } catch {
        throw new Error("Unauthorized: Admin access required");
    }

    // Get counts by action category
    const actionStats = await db
        .select({
            category: sql<string>`SPLIT_PART(${auditLogs.action}, '.', 1)`.as('category'),
            count: count(),
        })
        .from(auditLogs)
        .groupBy(sql`SPLIT_PART(${auditLogs.action}, '.', 1)`)
        .orderBy(desc(count()));

    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentCount] = await db
        .select({ count: count() })
        .from(auditLogs)
        .where(sql`${auditLogs.createdAt} >= ${oneDayAgo}`);

    // Get unique users in last 24 hours
    const uniqueUsers = await db
        .selectDistinct({ userId: auditLogs.userId })
        .from(auditLogs)
        .where(sql`${auditLogs.createdAt} >= ${oneDayAgo}`);

    return {
        success: true,
        stats: {
            actionCategories: actionStats,
            recentActivityCount: recentCount?.count || 0,
            activeUsersLast24h: uniqueUsers.length,
        },
    };
}

// Get distinct action types for filter dropdown
export async function getAuditActionTypes() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const actions = await db
        .selectDistinct({ action: auditLogs.action })
        .from(auditLogs)
        .orderBy(auditLogs.action);

    return actions.map((a: any) => a.action);
}

// Get distinct entity types for filter dropdown
export async function getAuditEntityTypes() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const types = await db
        .selectDistinct({ entityType: auditLogs.entityType })
        .from(auditLogs)
        .where(sql`${auditLogs.entityType} IS NOT NULL`)
        .orderBy(auditLogs.entityType);

    return types.map((t: any) => t.entityType).filter(Boolean) as string[];
}
