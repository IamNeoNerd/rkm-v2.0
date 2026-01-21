import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="p-4 sm:p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                        <Skeleton className="h-4 w-24 mb-3" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                ))}
            </div>

            {/* Family Cards Grid */}
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <div className="flex gap-2 mt-4">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
