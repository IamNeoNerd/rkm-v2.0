import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceLoading() {
    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-4 w-72 mb-6" />

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            {/* Students list placeholder */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="divide-y">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                            <div>
                                <Skeleton className="h-5 w-32 mb-2" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-9" />
                                <Skeleton className="h-9 w-9" />
                                <Skeleton className="h-9 w-9" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
