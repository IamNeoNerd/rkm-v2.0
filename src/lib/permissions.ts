

import { db } from "@/db";
import { rolePermissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Feature keys for permission checking
 */
export type FeatureKey =
    | "dashboard"
    | "students"
    | "families"
    | "staff"
    | "fees"
    | "admissions"
    | "attendance"
    | "batches"
    | "academics"
    | "reports"
    | "settings"
    | "users";

/**
 * Array of feature keys for iteration
 */
export const FEATURE_KEYS: FeatureKey[] = [
    "students",
    "fees",
    "attendance",
    "batches",
    "staff",
    "reports",
    "settings",
    "admissions",
];

/**
 * User roles in the system
 */
export type UserRole = "super-admin" | "admin" | "teacher" | "cashier" | "parent" | "user";

/**
 * Permission action types
 */
export type PermissionAction = "view" | "create" | "edit" | "delete";

/**
 * Permission check result
 */
export interface PermissionCheck {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

/**
 * Default permissions for super-admin (full access)
 */
const SUPER_ADMIN_PERMISSIONS: PermissionCheck = {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
};

/**
 * Default permissions for unverified users (no access)
 */
const NO_PERMISSIONS: PermissionCheck = {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
};

/**
 * Get permissions for a role and feature
 */
export async function getPermissions(
    role: string,
    feature: FeatureKey
): Promise<PermissionCheck> {
    // Super-admin always has full access
    if (role === "super-admin") {
        return SUPER_ADMIN_PERMISSIONS;
    }

    // Unverified users have no access
    if (role === "user") {
        return NO_PERMISSIONS;
    }

    try {
        const [permission] = await db
            .select({
                canView: rolePermissions.canView,
                canCreate: rolePermissions.canCreate,
                canEdit: rolePermissions.canEdit,
                canDelete: rolePermissions.canDelete,
            })
            .from(rolePermissions)
            .where(
                and(
                    eq(rolePermissions.role, role),
                    eq(rolePermissions.feature, feature)
                )
            )
            .limit(1);

        if (!permission) {
            // If no explicit permission, check default role permissions
            return getDefaultPermissions(role as UserRole, feature);
        }

        return {
            canView: permission.canView ?? false,
            canCreate: permission.canCreate ?? false,
            canEdit: permission.canEdit ?? false,
            canDelete: permission.canDelete ?? false,
        };
    } catch (error) {
        console.error("Error fetching permissions:", error);
        return NO_PERMISSIONS;
    }
}

/**
 * Check if a role has a specific permission for a feature
 */
export async function hasPermission(
    role: string,
    feature: FeatureKey,
    action: PermissionAction
): Promise<boolean> {
    const permissions = await getPermissions(role, feature);

    switch (action) {
        case "view":
            return permissions.canView;
        case "create":
            return permissions.canCreate;
        case "edit":
            return permissions.canEdit;
        case "delete":
            return permissions.canDelete;
        default:
            return false;
    }
}

/**
 * Get default permissions based on role (fallback when no DB config)
 */
function getDefaultPermissions(role: UserRole, feature: FeatureKey): PermissionCheck {
    // Default permission matrix
    const defaults: Record<UserRole, Partial<Record<FeatureKey, PermissionCheck>>> = {
        "super-admin": {}, // Handled separately above
        "admin": {
            dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            students: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            families: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            staff: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            fees: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            admissions: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            attendance: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            academics: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            reports: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            settings: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            users: { canView: false, canCreate: false, canEdit: false, canDelete: false },
        },
        "teacher": {
            dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            students: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            attendance: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            academics: { canView: true, canCreate: false, canEdit: false, canDelete: false },
        },
        "cashier": {
            dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            students: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            families: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            fees: { canView: true, canCreate: true, canEdit: false, canDelete: false },
            admissions: { canView: true, canCreate: true, canEdit: false, canDelete: false },
            reports: { canView: true, canCreate: false, canEdit: false, canDelete: false },
        },
        "parent": {
            dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            students: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            fees: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            attendance: { canView: true, canCreate: false, canEdit: false, canDelete: false },
        },
        "user": {}, // No access for unverified users
    };

    return defaults[role]?.[feature] ?? NO_PERMISSIONS;
}

/**
 * Get all permissions for a role (for displaying in UI)
 */
export async function getAllPermissionsForRole(role: string): Promise<Record<FeatureKey, PermissionCheck>> {
    const features: FeatureKey[] = [
        "dashboard", "students", "families", "staff", "fees",
        "admissions", "attendance", "academics", "reports", "settings", "users"
    ];

    const result: Record<string, PermissionCheck> = {};

    for (const feature of features) {
        result[feature] = await getPermissions(role, feature);
    }

    return result as Record<FeatureKey, PermissionCheck>;
}

/**
 * Update permissions for a role and feature
 */
export async function updatePermission(
    role: string,
    feature: FeatureKey,
    permissions: Partial<PermissionCheck>
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if permission exists
        const [existing] = await db
            .select()
            .from(rolePermissions)
            .where(
                and(
                    eq(rolePermissions.role, role),
                    eq(rolePermissions.feature, feature)
                )
            )
            .limit(1);

        if (existing) {
            // Update existing
            await db
                .update(rolePermissions)
                .set({
                    ...permissions,
                    updatedAt: new Date(),
                })
                .where(eq(rolePermissions.id, existing.id));
        } else {
            // Insert new
            await db.insert(rolePermissions).values({
                role,
                feature,
                canView: permissions.canView ?? false,
                canCreate: permissions.canCreate ?? false,
                canEdit: permissions.canEdit ?? false,
                canDelete: permissions.canDelete ?? false,
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating permission:", error);
        return { success: false, error: "Failed to update permission" };
    }
}
