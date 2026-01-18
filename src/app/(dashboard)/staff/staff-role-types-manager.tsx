"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Tag } from "lucide-react";
import { getStaffRoleTypes, createStaffRoleType, deleteStaffRoleType } from "@/actions/staff-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface RoleType {
    id: number;
    name: string;
    description: string | null;
}

export function StaffRoleTypesManager() {
    const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
    const [newRoleName, setNewRoleName] = useState("");
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const loadRoleTypes = useCallback(async () => {
        const res = await getStaffRoleTypes();
        if (res.success && res.roleTypes) {
            setRoleTypes(res.roleTypes);
        }
    }, []);

    useEffect(() => {
        loadRoleTypes();
    }, [loadRoleTypes]);

    const handleAddRoleType = async () => {
        if (!newRoleName.trim()) {
            toast.error("Please enter a role type name");
            return;
        }

        setLoading(true);
        const res = await createStaffRoleType({ name: newRoleName.trim() });
        setLoading(false);

        if (res.success) {
            toast.success(`Role type "${newRoleName}" added`);
            setNewRoleName("");
            loadRoleTypes();
        } else {
            toast.error(res.error || "Failed to add role type");
        }
    };

    const handleDeleteRoleType = async (id: number, name: string) => {
        if (!confirm(`Remove "${name}" from staff types?`)) return;

        const res = await deleteStaffRoleType(id);
        if (res.success) {
            toast.success(`Role type "${name}" removed`);
            loadRoleTypes();
        } else {
            toast.error(res.error || "Failed to remove role type");
        }
    };

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4 mb-6">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Custom Staff Types
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({roleTypes.length} types)
                    </span>
                </div>
                <Button variant="ghost" size="sm">
                    {isExpanded ? "Hide" : "Manage"}
                </Button>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-4">
                    {/* Current Role Types */}
                    <div className="flex flex-wrap gap-2">
                        {roleTypes.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                No custom types yet. Add types like Sweeper, Peon, Cook, MTS below.
                            </p>
                        ) : (
                            roleTypes.map((rt) => (
                                <div
                                    key={rt.id}
                                    className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                                >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {rt.name}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteRoleType(rt.id, rt.name)}
                                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Remove"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add New Role Type */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter new staff type (e.g., Peon, Cook)"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddRoleType()}
                            className="max-w-xs bg-white dark:bg-slate-800"
                        />
                        <Button
                            onClick={handleAddRoleType}
                            disabled={loading || !newRoleName.trim()}
                            size="sm"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            {loading ? "Adding..." : "Add Type"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
