"use client";

import { useState, useEffect } from "react";
import {
    Loader2,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Info,
    Check,
    X,
    Users,
    IndianRupee,
    Calendar,
    GraduationCap,
    LayoutDashboard,
    UserPlus,
    UserCog,
    FileText,
    Settings,
    Zap,
    Lock,
    Unlock,
    Eye,
    Scan,
    Activity,
    Cpu
} from "lucide-react";
import { toast } from "sonner";
import { getPermissionsForRole, savePermission } from "@/actions/permissions";
import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/modern/Card";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type FeatureKey, type PermissionCheck } from "@/lib/permissions";

const FEATURE_CONFIG: Record<FeatureKey, { label: string; description: string; icon: any; color: string }> = {
    dashboard: {
        label: "Strategic Dashboard",
        description: "Primary analytics pulse and command center telemetry.",
        icon: LayoutDashboard,
        color: "from-blue-500 to-cyan-500"
    },
    students: {
        label: "Student Matrix",
        description: "Comprehensive management of student profiles and academic nodes.",
        icon: Users,
        color: "from-purple-500 to-indigo-500"
    },
    families: {
        label: "Guardian Network",
        description: "Family associations, kinship mapping, and billing connectivity.",
        icon: Users,
        color: "from-pink-500 to-rose-500"
    },
    staff: {
        label: "Personnel Terminal",
        description: "Staff records, role assignments, and salary synchronization.",
        icon: UserCog,
        color: "from-orange-500 to-amber-500"
    },
    fees: {
        label: "Financial Ledger",
        description: "Fee collection, receipt generation, and transaction handling.",
        icon: IndianRupee,
        color: "from-emerald-500 to-teal-500"
    },
    admissions: {
        label: "Enrollment Vector",
        description: "New admission processing and initial student onboarding.",
        icon: UserPlus,
        color: "from-cyan-500 to-blue-500"
    },
    attendance: {
        label: "Temporal Logs",
        description: "Daily attendance tracking and chronicling of student presence.",
        icon: Calendar,
        color: "from-blue-600 to-indigo-600"
    },
    batches: {
        label: "Academic Clusters",
        description: "Class scheduling, batch management, and course telemetry.",
        icon: GraduationCap,
        color: "from-violet-500 to-fuchsia-500"
    },
    academics: {
        label: "Instructional Core",
        description: "Course material, examinations, and grade matrix management.",
        icon: GraduationCap,
        color: "from-indigo-500 to-purple-500"
    },
    reports: {
        label: "Analytical Output",
        description: "Data synthesis, financial reports, and academic audits.",
        icon: FileText,
        color: "from-slate-500 to-slate-700"
    },
    settings: {
        label: "System Protocols",
        description: "Core configuration, auth settings, and system parameters.",
        icon: Settings,
        color: "from-slate-400 to-slate-600"
    },
    users: {
        label: "Identity Matrix",
        description: "Login credentials, account verification, and user state.",
        icon: Users,
        color: "from-zinc-500 to-zinc-700"
    },
};

const ROLES: { id: string; label: string; color: string; accent: string }[] = [
    { id: "admin", label: "Operations Admin", color: "text-purple-400", accent: "bg-purple-500/10" },
    { id: "teacher", label: "Faculty Academician", color: "text-emerald-400", accent: "bg-emerald-500/10" },
    { id: "cashier", label: "Financial Officer", color: "text-amber-400", accent: "bg-amber-500/10" },
    { id: "parent", label: "Family Guardian", color: "text-indigo-400", accent: "bg-indigo-500/10" },
];

export default function PermissionsManagerClient() {
    const { data: session } = useSession();
    const [selectedRole, setSelectedRole] = useState<string>("admin");
    const [permissions, setPermissions] = useState<Record<string, PermissionCheck>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<FeatureKey | null>(null);

    const isSuperAdmin = session?.user?.role === "super-admin";

    useEffect(() => {
        if (isSuperAdmin) {
            loadPermissions(selectedRole);
        }
    }, [selectedRole, isSuperAdmin]);

    async function loadPermissions(role: string) {
        setLoading(true);
        try {
            const perms = await getPermissionsForRole(role);
            setPermissions(perms);
        } catch (error) {
            toast.error("Failed to load permissions matrix");
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

        setPermissions(prev => ({ ...prev, [feature]: newPermissions }));
        setSaving(feature);

        try {
            const result = await savePermission(selectedRole, feature, newPermissions);
            if (result.success) {
                toast.success(`${FEATURE_CONFIG[feature].label} protocols updated`);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            setPermissions(prev => ({
                ...prev,
                [feature]: { ...prev[feature], [action]: currentValue },
            }));
            toast.error("Protocol update failed");
        } finally {
            setSaving(null);
        }
    }

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-24 animate-in fade-in zoom-in duration-1000">
                <div className="relative group">
                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full group-hover:bg-red-500/30 transition-all duration-1000" />
                    <div className="relative bg-slate-950 border border-red-500/30 p-8 rounded-full shadow-2xl shadow-red-500/20">
                        <Lock className="h-16 w-16 text-red-500 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-white mt-8 tracking-tighter uppercase italic">Clearance Level Insufficient</h2>
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-red-500 to-transparent mt-4" />
                <p className="text-slate-500 mt-6 text-sm font-mono tracking-widest uppercase text-center max-w-sm">
                    Strategic Access Protocols restricted to Root Entities only.
                </p>
            </div>
        );
    }

    const actionKeys: { key: keyof PermissionCheck; label: string; icon: any; activeColor: string }[] = [
        { key: "canView", label: "VISUAL", icon: Eye, activeColor: "text-blue-400 shadow-blue-500/20" },
        { key: "canCreate", label: "APPEND", icon: UserPlus, activeColor: "text-emerald-400 shadow-emerald-500/20" },
        { key: "canEdit", label: "MODIFY", icon: Scan, activeColor: "text-amber-400 shadow-amber-500/20" },
        { key: "canDelete", label: "EVOKE", icon: X, activeColor: "text-rose-400 shadow-rose-500/20" }
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Liquid Header Hub */}
            <div className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-primary/5 to-purple-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                <GlassCard className="p-8 border-white/10 relative z-10 overflow-hidden" intensity="high">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                                <div className="relative h-16 w-16 bg-slate-950 border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <ShieldCheck className="h-8 w-8 text-indigo-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                                    RBAC Intelligence Node
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
                                        Calibrating Clearance Protocols
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-96 relative group/select">
                            <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover/select:opacity-100 transition-opacity" />
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="bg-slate-950/80 dark:bg-slate-950/80 border-white/10 text-white rounded-2xl h-14 relative z-10 transition-all hover:border-indigo-500/50">
                                    <SelectValue placeholder="Identify Role Vector" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-white/10 text-white backdrop-blur-xl">
                                    {ROLES.map((role) => (
                                        <SelectItem key={role.id} value={role.id} className="focus:bg-indigo-500/20 py-3 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-2 w-2 rounded-full", role.accent.replace('/10', ''))} />
                                                <span className={cn("font-black uppercase text-[11px] tracking-widest", role.color)}>{role.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Matrix Pulse View */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative">
                        <div className="h-20 w-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <Activity className="absolute inset-0 m-auto h-8 w-8 text-indigo-300 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse text-center">
                        Synchronizing Neural Permissions Matrix...
                    </span>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {(Object.keys(FEATURE_CONFIG) as FeatureKey[]).map((feature) => {
                        const config = FEATURE_CONFIG[feature];
                        const Icon = config.icon;
                        return (
                            <div key={feature} className="group/card relative">
                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover/card:opacity-10 transition-opacity duration-700 rounded-3xl blur-2xl -z-10", config.color)} />
                                <GlassCard
                                    className="p-6 transition-all duration-500 group-hover/card:border-white/20 group-hover/card:translate-y-[-4px] h-full"
                                    intensity="medium"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                                        <div className="flex items-start gap-4">
                                            <div className={cn("p-3.5 rounded-2xl bg-gradient-to-br text-white shadow-xl flex items-center justify-center shrink-0", config.color)}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-300 transition-colors">
                                                    {config.label}
                                                </h4>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[200px]">
                                                    {config.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-1.5 bg-slate-950/60 rounded-3xl border border-white/5 shadow-inner">
                                            {actionKeys.map((action) => {
                                                const isActive = permissions[feature]?.[action.key] ?? false;
                                                const ActionIcon = action.icon;
                                                return (
                                                    <button
                                                        key={action.key}
                                                        onClick={() => handleToggle(feature, action.key)}
                                                        disabled={saving === feature}
                                                        className={cn(
                                                            "relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-500 group/btn gap-1",
                                                            isActive
                                                                ? cn("bg-slate-900 border-white/20", action.activeColor.split(' ')[0])
                                                                : "hover:bg-white/10 text-slate-400 hover:text-white"
                                                        )}
                                                    >
                                                        {isActive && (
                                                            <div className={cn("absolute inset-0 blur-lg transition-transform duration-700 group-hover/btn:scale-150", action.activeColor.split(' ')[1])} />
                                                        )}
                                                        <ActionIcon className={cn("h-4 w-4 relative z-10 transition-transform duration-500", isActive ? "scale-110" : "scale-100 opacity-60 group-hover/btn:opacity-100")} />
                                                        <span className={cn(
                                                            "relative z-10 text-[9px] font-black uppercase tracking-tighter transition-all",
                                                            isActive ? "opacity-100" : "opacity-60 group-hover/btn:opacity-100"
                                                        )}>
                                                            {action.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {saving === feature && (
                                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center rounded-3xl z-20 animate-in fade-in">
                                            <Zap className="h-6 w-6 text-indigo-400 animate-pulse" />
                                        </div>
                                    )}
                                </GlassCard>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Neural Integrity Footer */}
            <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl opacity-50" />
                <div className="relative p-8 px-10 bg-slate-900 border border-white/10 rounded-[40px] flex items-center gap-6 backdrop-blur-3xl">
                    <div className="p-4 bg-indigo-500/20 rounded-3xl border border-indigo-500/30">
                        <Cpu className="h-6 w-6 text-indigo-300 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Institutional Access Priority</p>
                        <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider leading-relaxed italic">
                            [System-Note] root access entities inherit universal clearance by default. protocol shifts will synchronize across peripheral vectors.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
