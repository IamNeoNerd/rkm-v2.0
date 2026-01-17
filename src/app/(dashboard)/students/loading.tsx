import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsLoading() {
    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-9 w-40" />
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                    <Skeleton className="h-10 w-full max-w-sm" />
                </div>
                <div className="divide-y">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="p-4 flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-5 w-32 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
