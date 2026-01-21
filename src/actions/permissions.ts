"use server";

import {
    getAllPermissionsForRole as getRolePermissions,
    updatePermission as updateRolePermission,
    type FeatureKey,
    type PermissionCheck
} from "@/lib/permissions";
import { auth } from "@/auth";

/**
 * Server action wrapper for getAllPermissionsForRole
 */
export async function getPermissionsForRole(role: string): Promise<Record<FeatureKey, PermissionCheck>> {
    const session = await auth();
    if (!session?.user || !["super-admin", "admin"].includes(session.user.role)) {
        throw new Error("Unauthorized");
    }

    return await getRolePermissions(role);
}

/**
 * Server action wrapper for updatePermission
 */
export async function savePermission(
    role: string,
    feature: FeatureKey,
    permissions: Partial<PermissionCheck>
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user || !["super-admin", "admin"].includes(session.user.role)) {
        return { success: false, error: "Unauthorized" };
    }

    return await updateRolePermission(role, feature, permissions);
}
