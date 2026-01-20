import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={`header-${i}`} className="h-4 w-24" />
                    ))}
                </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="px-6 py-4">
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <Skeleton
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    className="h-4"
                                    style={{ width: `${60 + Math.random() * 40}%` }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
