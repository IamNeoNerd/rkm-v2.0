import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-5 rounded" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-40" />
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Cards Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>

            {/* Chart and Activity Row */}
            <div className="grid gap-4 md:grid-cols-7">
                {/* Chart Skeleton */}
                <div className="col-span-4 rounded-lg border bg-white p-6 shadow-sm">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-[300px] w-full" />
                </div>

                {/* Recent Activity Skeleton */}
                <div className="col-span-3 rounded-lg border bg-white p-6 shadow-sm">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="space-y-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
