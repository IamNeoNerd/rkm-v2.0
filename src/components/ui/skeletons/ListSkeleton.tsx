import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton({ items = 5 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 rounded-lg border bg-white p-4 shadow-sm">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                </div>
            ))}
        </div>
    );
}

export function ParentPortalSkeleton() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-9 w-24" />
            </div>

            {/* Balance Card Skeleton */}
            <div className="p-5 rounded-xl border-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Children Section Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment History Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
