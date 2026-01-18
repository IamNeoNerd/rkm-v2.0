'use server';

import { db } from "@/db";
import { staffRoleTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { safeRevalidatePath } from "@/lib/server-utils";
import { requireRole, AuthorizationError } from "@/lib/auth-guard";

/**
 * Get all active staff role types
 */
export async function getStaffRoleTypes() {
    try {
        const roleTypes = await db
            .select()
            .from(staffRoleTypes)
            .where(eq(staffRoleTypes.isActive, true))
            .orderBy(staffRoleTypes.name);

        return { success: true, roleTypes };
    } catch (error) {
        console.error("Error fetching staff role types:", error);
        return { success: false, roleTypes: [], error: "Failed to fetch role types" };
    }
}

/**
 * Create a new staff role type (Admin only)
 */
export async function createStaffRoleType(data: { name: string; description?: string }) {
    try {
        await requireRole(['admin', 'super-admin']);

        const name = data.name.trim();
        if (!name || name.length < 2) {
            return { success: false, error: "Role type name must be at least 2 characters" };
        }

        // Check for duplicates
        const existing = await db.query.staffRoleTypes.findFirst({
            where: eq(staffRoleTypes.name, name)
        });

        if (existing) {
            return { success: false, error: `Role type "${name}" already exists` };
        }

        const [newRoleType] = await db.insert(staffRoleTypes).values({
            name,
            description: data.description?.trim() || null,
        }).returning();

        safeRevalidatePath('/staff');
        safeRevalidatePath('/settings/staff-roles');

        return { success: true, roleType: newRoleType };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        console.error("Error creating staff role type:", error);
        return { success: false, error: "Failed to create role type" };
    }
}

/**
 * Update a staff role type (Admin only)
 */
export async function updateStaffRoleType(id: number, data: { name?: string; description?: string }) {
    try {
        await requireRole(['admin', 'super-admin']);

        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.description !== undefined) updateData.description = data.description.trim();

        const [updated] = await db
            .update(staffRoleTypes)
            .set(updateData)
            .where(eq(staffRoleTypes.id, id))
            .returning();

        if (!updated) {
            return { success: false, error: "Role type not found" };
        }

        safeRevalidatePath('/staff');
        safeRevalidatePath('/settings/staff-roles');

        return { success: true, roleType: updated };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        console.error("Error updating staff role type:", error);
        return { success: false, error: "Failed to update role type" };
    }
}

/**
 * Soft-delete a staff role type (Admin only)
 */
export async function deleteStaffRoleType(id: number) {
    try {
        await requireRole(['admin', 'super-admin']);

        const [deactivated] = await db
            .update(staffRoleTypes)
            .set({ isActive: false })
            .where(eq(staffRoleTypes.id, id))
            .returning();

        if (!deactivated) {
            return { success: false, error: "Role type not found" };
        }

        safeRevalidatePath('/staff');
        safeRevalidatePath('/settings/staff-roles');

        return { success: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        console.error("Error deleting staff role type:", error);
        return { success: false, error: "Failed to delete role type" };
    }
}
