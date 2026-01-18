"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from "@/actions/notifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const typeIcons: Record<string, { bg: string; color: string }> = {
    FEE_REMINDER: { bg: "bg-orange-100", color: "text-orange-600" },
    PAYMENT_RECEIVED: { bg: "bg-green-100", color: "text-green-600" },
    ATTENDANCE_ALERT: { bg: "bg-yellow-100", color: "text-yellow-600" },
    BATCH_UPDATE: { bg: "bg-blue-100", color: "text-blue-600" },
    SYSTEM_ALERT: { bg: "bg-red-100", color: "text-red-600" },
    GENERAL: { bg: "bg-gray-100", color: "text-gray-600" },
};

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadNotifications = useCallback(async () => {
        try {
            const result = await getUserNotifications({ limit: 10 });
            if (result.success) {
                setNotifications(result.notifications as Notification[]);
                setUnreadCount(result.unreadCount || 0);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    }, []);

    // Load notifications when dropdown opens
    useEffect(() => {
        const init = async () => {
            if (open) {
                await loadNotifications();
            }
        };
        init();
    }, [open, loadNotifications]);

    // Poll for new notifications every 60 seconds
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (isMounted) {
                await loadNotifications();
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [loadNotifications]);

    async function handleMarkRead(id: number) {
        await markNotificationRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }

    async function handleMarkAllRead() {
        setLoading(true);
        await markAllNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        setLoading(false);
    }

    const style = (type: string) => typeIcons[type] || typeIcons.GENERAL;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9"
                onClick={() => setOpen(!open)}
            >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                    onClick={handleMarkAllRead}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCheck className="h-3 w-3 mr-1" />
                                            Mark all read
                                        </>
                                    )}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-12 px-4 text-center text-gray-500">
                                <Bell className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors",
                                        !notification.isRead && "bg-blue-50/50"
                                    )}
                                    onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                                            style(notification.type).bg
                                        )}>
                                            <Bell className={cn("h-4 w-4", style(notification.type).color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn(
                                                    "text-sm",
                                                    !notification.isRead ? "font-medium text-gray-900" : "text-gray-700"
                                                )}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
