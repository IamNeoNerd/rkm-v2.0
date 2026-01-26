import { Suspense } from "react";
import { getUserNotifications } from "@/actions/notifications";
import { Bell } from "lucide-react";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { TableSkeleton } from "@/components/ui/skeletons";

interface NotificationPageProps {
    searchParams: Promise<{
        page?: string;
    }>;
}

async function NotificationContent({ searchParams }: NotificationPageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");

    const res = await getUserNotifications({
        page,
        limit: 15
    });

    if (!res.success) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
                <p className="font-medium">Error loading notifications</p>
                <p className="text-sm">{res.error}</p>
            </div>
        );
    }

    return (
        <NotificationSettings
            notifications={res.notifications || []}
            pagination={res.pagination}
            unreadCount={res.unreadCount ?? 0}
        />
    );
}

export default async function NotificationSettingsPage({ searchParams }: NotificationPageProps) {
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Bell className="h-8 w-8 text-indigo-600" />
                        Notification Center
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">
                        Stay updated with real-time fee alerts, attendance reports, and system announcements.
                    </p>
                </div>
            </div>

            <Suspense fallback={<TableSkeleton rows={8} columns={1} />}>
                <NotificationContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
