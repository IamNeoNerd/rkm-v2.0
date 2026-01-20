"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuditLogs, getAuditLogStats, getAuditActionTypes, type AuditLogEntry } from "@/actions/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    History,
    ArrowLeft,
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
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";

// Action category icons and colors
const actionConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
    auth: { icon: <Shield className="h-4 w-4" />, color: "text-blue-600", bgColor: "bg-blue-50" },
    user: { icon: <User className="h-4 w-4" />, color: "text-purple-600", bgColor: "bg-purple-50" },
    payment: { icon: <CreditCard className="h-4 w-4" />, color: "text-green-600", bgColor: "bg-green-50" },
    admission: { icon: <Users className="h-4 w-4" />, color: "text-indigo-600", bgColor: "bg-indigo-50" },
    batch: { icon: <GraduationCap className="h-4 w-4" />, color: "text-orange-600", bgColor: "bg-orange-50" },
    staff: { icon: <Users className="h-4 w-4" />, color: "text-teal-600", bgColor: "bg-teal-50" },
    settings: { icon: <Settings className="h-4 w-4" />, color: "text-gray-600", bgColor: "bg-gray-50" },
    system: { icon: <AlertCircle className="h-4 w-4" />, color: "text-red-600", bgColor: "bg-red-50" },
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
    const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
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

    const fetchStats = async () => {
        try {
            const result = await getAuditLogStats();
            if (result.success) {
                setStats(result.stats);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const fetchActionTypes = async () => {
        try {
            const types = await getAuditActionTypes();
            setActionTypes(types);
        } catch (error) {
            console.error("Failed to fetch action types:", error);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        fetchStats();
        fetchActionTypes();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchLogs();
    };

    return (
        <SettingsPageLayout
            title="Audit Logs"
            description="Track all system activities and user actions"
            icon={<History className="h-8 w-8 text-indigo-600" />}
        >
            <div className="flex justify-end mb-6">
                <Button onClick={() => fetchLogs()} variant="outline" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <Activity className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="text-sm opacity-80">Last 24 Hours</p>
                                <p className="text-2xl font-bold">{stats.recentActivityCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="text-sm opacity-80">Active Users</p>
                                <p className="text-2xl font-bold">{stats.activeUsersLast24h}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <History className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="text-sm opacity-80">Total Records</p>
                                <p className="text-2xl font-bold">{pagination.total}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="w-48">
                        <select
                            value={selectedAction}
                            onChange={(e) => {
                                setSelectedAction(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Actions</option>
                            {actionTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit">
                        <Filter className="h-4 w-4 mr-2" />
                        Apply Filters
                    </Button>
                </form>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-gray-500">Loading logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center">
                        <History className="h-12 w-12 mx-auto text-gray-300" />
                        <p className="mt-2 text-gray-500">No audit logs found</p>
                        <p className="text-sm text-gray-400">Activity will appear here as users interact with the system</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => {
                                    const category = getActionCategory(log.action);
                                    const config = actionConfig[category] || actionConfig.system;

                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                    <div>
                                                        <p className="text-gray-900">
                                                            {format(new Date(log.createdAt), "MMM dd, HH:mm")}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                                                    {config.icon}
                                                    {getActionDisplay(log.action)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{log.userName || 'System'}</p>
                                                        <p className="text-xs text-gray-500">{log.userId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {log.entityType ? (
                                                    <div>
                                                        <span className="text-gray-900 capitalize">{log.entityType}</span>
                                                        {log.entityId && (
                                                            <span className="text-gray-500 ml-1">#{log.entityId}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                                {log.details ? (
                                                    <details className="cursor-pointer">
                                                        <summary className="text-indigo-600 hover:text-indigo-800">
                                                            View details
                                                        </summary>
                                                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                    </details>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </SettingsPageLayout>
    );
}
