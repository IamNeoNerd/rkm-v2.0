import { Skeleton } from "@/components/ui/skeleton";

export default function FeesLoading() {
    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <Skeleton className="h-10 w-full" />
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center py-12">
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
            </div>
        </div>
    );
}
