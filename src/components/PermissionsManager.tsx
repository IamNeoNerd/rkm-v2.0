"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getPermissionsForRole, savePermission } from "@/actions/permissions";

type RoleType = "admin" | "teacher" | "cashier" | "parent";

type FeatureKey = "students" | "fees" | "attendance" | "batches" | "staff" | "reports" | "settings" | "admissions";

type PermissionCheck = {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
};

const FEATURE_KEYS: FeatureKey[] = [
    "students",
    "fees",
    "attendance",
    "batches",
    "staff",
    "reports",
    "settings",
    "admissions",
];

const ROLES: { id: RoleType; label: string; color: string }[] = [
    { id: "admin", label: "Admin", color: "bg-purple-500" },
    { id: "teacher", label: "Teacher", color: "bg-emerald-500" },
    { id: "cashier", label: "Cashier", color: "bg-amber-500" },
    { id: "parent", label: "Parent", color: "bg-indigo-500" },
];

const FEATURE_LABELS: Record<FeatureKey, string> = {
    students: "Students",
    fees: "Fee Collection",
    attendance: "Attendance",
    batches: "Batches / Classes",
    staff: "Staff Management",
    reports: "Reports",
    settings: "Settings",
    admissions: "Admissions",
};

export default function PermissionsManagerClient() {
    const [selectedRole, setSelectedRole] = useState<RoleType>("admin");
    const [permissions, setPermissions] = useState<Record<string, PermissionCheck>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<FeatureKey | null>(null);

    useEffect(() => {
        loadPermissions(selectedRole);
    }, [selectedRole]);

    async function loadPermissions(role: RoleType) {
        setLoading(true);
        try {
            const perms = await getPermissionsForRole(role);
            setPermissions(perms);
        } catch (error) {
            toast.error("Failed to load permissions");
        } finally {
            setLoading(false);
        }
    }

    async function handleToggle(feature: FeatureKey, action: keyof PermissionCheck) {
        const currentValue = permissions[feature]?.[action] ?? false;
        const newPermissions: PermissionCheck = {
            canView: permissions[feature]?.canView ?? false,
            canCreate: permissions[feature]?.canCreate ?? false,
            canEdit: permissions[feature]?.canEdit ?? false,
            canDelete: permissions[feature]?.canDelete ?? false,
            [action]: !currentValue,
        };

        // Optimistic update
        setPermissions(prev => ({
            ...prev,
            [feature]: newPermissions,
        }));

        setSaving(feature);
        try {
            const result = await savePermission(selectedRole, feature, newPermissions);
            if (result.success) {
                toast.success(`${FEATURE_LABELS[feature]} permissions updated`);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            // Revert on error
            setPermissions(prev => ({
                ...prev,
                [feature]: { ...prev[feature], [action]: currentValue },
            }));
            toast.error("Failed to update permission");
        } finally {
            setSaving(null);
        }
    }

    const actionKeys: (keyof PermissionCheck)[] = ["canView", "canCreate", "canEdit", "canDelete"];

    return (
        <div className="space-y-6">
            {/* Role Selector */}
            <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedRole === role.id
                                ? `${role.color} text-white shadow-lg`
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {role.label}
                    </button>
                ))}
            </div>

            {/* Permissions Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Feature</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">View</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Create</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Edit</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {FEATURE_KEYS.map((feature) => (
                                <tr key={feature} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {FEATURE_LABELS[feature]}
                                        {saving === feature && (
                                            <Loader2 className="inline h-4 w-4 ml-2 animate-spin text-indigo-500" />
                                        )}
                                    </td>
                                    {actionKeys.map((action) => (
                                        <td key={action} className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggle(feature, action)}
                                                disabled={saving === feature}
                                                className={`w-8 h-8 rounded-lg transition-all ${permissions[feature]?.[action]
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-gray-200 text-gray-400"
                                                    }`}
                                            >
                                                {permissions[feature]?.[action] ? "✓" : "–"}
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm">
                    <strong>Note:</strong> Super-admins always have full access to all features.
                    Changes take effect immediately for users with the selected role.
                </p>
            </div>
        </div>
    );
}
