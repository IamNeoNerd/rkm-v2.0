"use client";

import { useState } from "react";
import {
    Bell,
    CheckCheck,
    Trash2,
    Settings,
    Calendar,
    AlertCircle,
    Info,
    CreditCard,
    CheckCircle2,
    ExternalLink,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { PaginationControls } from "@/components/PaginationControls";
import {
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllNotifications
} from "@/actions/notifications";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
}

interface NotificationSettingsProps {
    notifications: Notification[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    unreadCount: number;
}

export function NotificationSettings({ notifications, pagination, unreadCount }: NotificationSettingsProps) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [filter, setFilter] = useState("ALL");

    const handleMarkAllRead = async () => {
        setIsUpdating(true);
        try {
            const res = await markAllNotificationsRead();
            if (res.success) {
                toast.success("All notifications marked as read");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to update notifications");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleMarkRead = async (id: number) => {
        try {
            const res = await markNotificationRead(id);
            if (res.success) {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await deleteNotification(id);
            if (res.success) {
                toast.success("Notification deleted");
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to delete notification");
        }
    };

    const handleClearHistory = async () => {
        if (!confirm("Are you sure you want to clear all notification history?")) return;

        setIsUpdating(true);
        try {
            const res = await deleteAllNotifications();
            if (res.success) {
                toast.success("Notification history cleared");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to clear history");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsUpdating(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "FEE_REMINDER": return <CreditCard className="h-4 w-4 text-amber-500" />;
            case "PAYMENT_RECEIVED": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case "ATTENDANCE_ALERT": return <AlertCircle className="h-4 w-4 text-rose-500" />;
            case "SYSTEM_ALERT": return <Settings className="h-4 w-4 text-indigo-500" />;
            default: return <Info className="h-4 w-4 text-slate-400" />;
        }
    };

    const filteredNotifications = filter === "ALL"
        ? notifications
        : notifications.filter(n => n.type === filter);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Notifications List */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <Tabs value={filter} onValueChange={setFilter} className="w-full">
                        <TabsList className="grid grid-cols-5 w-fit">
                            <TabsTrigger value="ALL">All</TabsTrigger>
                            <TabsTrigger value="FEE_REMINDER">Fees</TabsTrigger>
                            <TabsTrigger value="ATTENDANCE_ALERT">Attendance</TabsTrigger>
                            <TabsTrigger value="PAYMENT_RECEIVED">Payments</TabsTrigger>
                            <TabsTrigger value="SYSTEM_ALERT">System</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-slate-500" />
                            <span className="font-semibold text-slate-700">
                                {filter === "ALL" ? "Recent Notifications" : `${filter.replace('_', ' ')} Notifications`}
                            </span>
                            {unreadCount > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={isUpdating}
                                className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 flex gap-4 transition-colors hover:bg-slate-50/50 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${!n.isRead ? 'bg-white shadow-sm border border-indigo-100' : 'bg-slate-50 border border-slate-100'}`}>
                                            {getTypeIcon(n.type)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className={`font-semibold text-slate-900 ${!n.isRead ? 'text-indigo-900' : ''}`}>
                                                    {n.title}
                                                </h4>
                                                <p className="text-slate-600 mt-1 leading-relaxed">
                                                    {n.message}
                                                </p>

                                                {/* Actionable Links */}
                                                {n.type === 'FEE_REMINDER' && (
                                                    <div className="mt-3">
                                                        <Button variant="outline" size="sm" asChild className="h-8 text-xs font-bold bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
                                                            <Link href="/fees" className="flex items-center gap-2">
                                                                <CreditCard className="h-3.5 w-3.5" />
                                                                Collect Fee
                                                                <ArrowRight className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                )}

                                                {n.type === 'ATTENDANCE_ALERT' && (
                                                    <div className="mt-3 text-indigo-600 hover:underline">
                                                        <Link href={`/students/${n.data?.studentId}`} className="text-xs font-bold flex items-center gap-1">
                                                            View Student Profile <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!n.isRead && (
                                                    <button
                                                        onClick={() => handleMarkRead(n.id)}
                                                        className="flex-shrink-0 text-slate-400 hover:text-indigo-600 p-1 rounded-md transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(n.id)}
                                                    className="flex-shrink-0 text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(n.createdAt), "MMM dd, yyyy • HH:mm")}
                                            </span>
                                            {!n.isRead && (
                                                <span className="text-indigo-500 flex items-center gap-1 font-bold">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                    Unread
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="h-8 w-8 text-slate-200" />
                                </div>
                                <h3 className="text-slate-900 font-semibold italic text-lg opacity-40">No notifications found</h3>
                                <p className="text-slate-400 text-sm mt-1">Try changing your filters or check back later.</p>
                            </div>
                        )}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100">
                            <PaginationControls
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                total={pagination.total}
                                limit={pagination.limit}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Settings/Preferences */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Settings className="h-4 w-4" />
                        </div>
                        <h3 className="font-bold text-slate-900">Preferences</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <label className="text-sm font-semibold text-slate-700">Push Notifications</label>
                                <span className="text-xs text-slate-400">Desktop browser alerts</span>
                            </div>
                            <div className="h-5 w-9 bg-slate-200 rounded-full relative cursor-not-allowed opacity-50">
                                <div className="absolute left-1 top-1 h-3 w-3 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <label className="text-sm font-semibold text-slate-700">Sound Effects</label>
                                <span className="text-xs text-slate-400">Play sound for new alerts</span>
                            </div>
                            <div className="h-5 w-9 bg-indigo-600 rounded-full relative cursor-not-allowed opacity-50">
                                <div className="absolute right-1 top-1 h-3 w-3 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button className="w-full py-2 bg-slate-100 text-slate-400 text-sm font-bold rounded-lg cursor-not-allowed transition-all uppercase tracking-wider">
                                Save Preferences
                            </button>
                            <p className="text-[10px] text-center text-slate-400 mt-2 italic">* Preferences coming in Phase 4</p>
                        </div>
                    </div>
                </div>

                <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-white text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm">
                            <Trash2 className="h-4 w-4" />
                        </div>
                        <h3 className="font-bold text-rose-900">Red Zone</h3>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed mb-4">
                        Empty your notification history completely. This action cannot be undone.
                    </p>
                    <button
                        onClick={handleClearHistory}
                        disabled={isUpdating}
                        className="w-full py-2 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 transition-all uppercase tracking-wider disabled:opacity-50"
                    >
                        {isUpdating ? "Clearing..." : "Clear History"}
                    </button>
                </div>
            </div>
        </div>
    );
}
