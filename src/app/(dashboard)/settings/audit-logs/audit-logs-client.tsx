"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuditLogs, getAuditLogStats, getAuditActionTypes, type AuditLogEntry } from "@/actions/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    History,
    Search,
    Filter,
    RefreshCw,
    User,
    Clock,
    ChevronLeft,
    ChevronRight,
    Activity,
    Users,
    Shield,
    CreditCard,
    GraduationCap,
    Settings,
    AlertCircle,
    Zap,
    Cpu,
    ArrowRight,
    type LucideIcon
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { GlassCard } from "@/components/modern/Card";
import { cn } from "@/lib/utils";

// Action category icons and colors
const actionConfig: Record<string, { icon: LucideIcon; color: string; gradient: string }> = {
    auth: { icon: Shield, color: "text-blue-500", gradient: "from-blue-500/10 to-transparent" },
    user: { icon: User, color: "text-purple-500", gradient: "from-purple-500/10 to-transparent" },
    payment: { icon: CreditCard, color: "text-emerald-500", gradient: "from-emerald-500/10 to-transparent" },
    admission: { icon: Users, color: "text-indigo-500", gradient: "from-indigo-500/10 to-transparent" },
    batch: { icon: GraduationCap, color: "text-amber-500", gradient: "from-amber-500/10 to-transparent" },
    staff: { icon: Users, color: "text-cyan-500", gradient: "from-cyan-500/10 to-transparent" },
    settings: { icon: Settings, color: "text-slate-500", gradient: "from-slate-500/10 to-transparent" },
    system: { icon: AlertCircle, color: "text-rose-500", gradient: "from-rose-500/10 to-transparent" },
};

function getActionCategory(action: string): string {
    return action.split('.')[0] || 'system';
}

function getActionDisplay(action: string): string {
    const parts = action.split('.');
    if (parts.length > 1) {
        return parts[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return action;
}

export default function AuditLogsClient() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAction, setSelectedAction] = useState("");
    const [actionTypes, setActionTypes] = useState<string[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 });
    const [stats, setStats] = useState<{ recentActivityCount: number; activeUsersLast24h: number } | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAuditLogs({
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery || undefined,
                action: selectedAction || undefined,
            });
            if (result.success) {
                setLogs(result.logs);
                setPagination(prev => ({
                    ...prev,
                    total: result.pagination.total,
                    totalPages: result.pagination.totalPages,
                }));
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, selectedAction]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        const fetchStatsAndTypes = async () => {
            try {
                const [statsRes, types] = await Promise.all([
                    getAuditLogStats(),
                    getAuditActionTypes()
                ]);
                if (statsRes.success) setStats(statsRes.stats);
                setActionTypes(types);
            } catch (error) {
                console.error("Failed to sync audit metadata:", error);
            }
        };
        fetchStatsAndTypes();
    }, []);

    return (
        <SettingsPageLayout
            title="Audit Ledger"
            description="Investigate operational history and security trails."
            icon={<History className="h-8 w-8 text-amber-500" />}
            maxWidth="xl"
            showNavigation={false}
            showHeader={false}
        >
            <div className="space-y-10 animate-in fade-in duration-1000">
                {/* Pulsar Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3">
                            Audit Ledger
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            Operational History & Security Trails
                        </p>
                    </div>
                    <Button
                        onClick={() => fetchLogs()}
                        variant="glass"
                        disabled={loading}
                        className="rounded-xl border-white/40 h-10 px-6 backdrop-blur-xl group"
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2 transition-transform duration-700", loading && "animate-spin")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Refresh Stream</span>
                    </Button>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "24H ACTIVITY", value: stats.recentActivityCount, icon: Activity, color: "text-indigo-500", accent: "bg-indigo-500/10" },
                            { label: "ACTIVE IDENTITIES", value: stats.activeUsersLast24h, icon: Users, color: "text-purple-500", accent: "bg-purple-500/10" },
                            { label: "TOTAL LOG NODES", value: pagination.total, icon: History, color: "text-amber-500", accent: "bg-amber-500/10" }
                        ].map((stat, idx) => (
                            <GlassCard key={idx} className="p-6 border-white/20" intensity="medium">
                                <div className="flex items-center gap-5">
                                    <div className={cn("p-4 rounded-2xl shadow-lg shadow-transparent transition-all group-hover:shadow-[0_0_20px_-5px_currentColor]", stat.accent, stat.color)}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                                        <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight font-mono">{stat.value}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}

                {/* Filter Matrix */}
                <GlassCard className="p-6" intensity="high">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[300px] relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="SEARCH LOG NODES..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-12 bg-white/50 border-white/40 rounded-xl font-black uppercase text-[10px] tracking-widest focus:ring-primary/20"
                            />
                        </div>
                        <div className="w-64 relative">
                            <select
                                value={selectedAction}
                                onChange={(e) => {
                                    setSelectedAction(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full h-12 px-4 bg-white/50 border border-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer"
                            >
                                <option value="">ALL SIGNATURES</option>
                                {actionTypes.map(type => (
                                    <option key={type} value={type}>{type.toUpperCase()}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </GlassCard>

                {/* Ledger View */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="h-10 w-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Syncing Ledger...</span>
                        </div>
                    ) : logs.length === 0 ? (
                        <GlassCard className="p-20 flex flex-col items-center justify-center text-center opacity-50" intensity="low">
                            <History className="h-12 w-12 text-slate-300 mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest text-slate-900">Zero Records Synchronized</p>
                            <p className="text-[10px] mt-2 text-slate-400 uppercase tracking-wider">Operational activity is currently dormant.</p>
                        </GlassCard>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {logs.map((log) => {
                                const category = getActionCategory(log.action);
                                const config = actionConfig[category] || actionConfig.system;
                                const ActionIcon = config.icon;

                                return (
                                    <GlassCard key={log.id} className="p-6 group hover:translate-x-1 transition-all" intensity="medium">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                            {/* Time Column */}
                                            <div className="w-40 shrink-0">
                                                <div className="flex items-center gap-3 text-slate-900">
                                                    <Clock className="h-4 w-4 text-slate-300" />
                                                    <span className="text-sm font-black tracking-tighter uppercase">{format(new Date(log.createdAt), "MMM dd")}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 ml-7 uppercase">{format(new Date(log.createdAt), "HH:mm")}</p>
                                            </div>

                                            {/* Action Identity */}
                                            <div className="w-64 shrink-0 flex items-center gap-4">
                                                <div className={cn("p-3 rounded-2xl bg-gradient-to-br", config.gradient, config.color)}>
                                                    <ActionIcon className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", config.color)}>
                                                        {getActionDisplay(log.action)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{log.userName || 'SYSTEM'}</span>
                                                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                        <span className="text-[8px] font-mono text-slate-400 uppercase">#{log.userId?.slice(-4) || 'CORE'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Entity Data */}
                                            <div className="flex-1 flex items-center gap-4">
                                                {log.entityType ? (
                                                    <div className="px-4 py-2 bg-slate-900/5 border border-slate-900/10 rounded-xl flex items-center gap-3 w-fit">
                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{log.entityType}</span>
                                                        {log.entityId && (
                                                            <>
                                                                <ArrowRight className="h-3 w-3 text-slate-300" />
                                                                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">{log.entityId}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-300 tracking-[0.4em] uppercase">NO_ENTITY_DATA</span>
                                                )}
                                            </div>

                                            {/* Detail Expand */}
                                            <div className="shrink-0">
                                                {log.details ? (
                                                    <details className="group/details">
                                                        <summary className="list-none cursor-pointer">
                                                            <div className="flex items-center gap-2 px-6 py-2 bg-white/50 border border-white/80 rounded-full text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Metadata</span>
                                                                <ChevronRight className="h-3 w-3 transition-transform group-open/details:rotate-90" />
                                                            </div>
                                                        </summary>
                                                        <div className="absolute left-0 right-0 mt-4 p-6 bg-slate-950/95 backdrop-blur-3xl rounded-3xl border border-white/10 z-50 text-emerald-400 font-mono text-[10px] overflow-auto max-h-64 shadow-2xl animate-in fade-in zoom-in duration-300">
                                                            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                                                                <Cpu className="h-4 w-4 text-emerald-500" />
                                                                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.3em]">Node Data Synthesis</span>
                                                            </div>
                                                            <pre className="whitespace-pre-wrap leading-relaxed opacity-80">
                                                                {JSON.stringify(log.details, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </details>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full border border-dashed border-slate-200" />
                                                )}
                                            </div>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination Matrix */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            NODE {pagination.page} OF {pagination.totalPages} <span className="text-slate-200 mx-2">|</span> TOTAL {pagination.total} LOGS
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="glass"
                                size="sm"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="rounded-xl border-white/40 font-black uppercase tracking-widest text-[10px] h-10 px-6 backdrop-blur-xl"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Prev Pulse
                            </Button>
                            <Button
                                variant="glass"
                                size="sm"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="rounded-xl border-white/40 font-black uppercase tracking-widest text-[10px] h-10 px-6 backdrop-blur-xl"
                            >
                                Next Pulse
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </SettingsPageLayout>
    );
}
