import { Suspense } from "react";
import { getAllFamilies } from "@/actions/families";
import { Users } from "lucide-react";
import { FamiliesTable } from "@/components/FamiliesTable";
import { TableSkeleton } from "@/components/ui/skeletons";

interface FamiliesPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}

async function FamiliesContent({ searchParams }: FamiliesPageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";

    const { families, pagination, error } = await getAllFamilies({
        page,
        limit: 20,
        search
    });

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <p className="font-medium">Error loading families</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    return <FamiliesTable families={families || []} pagination={pagination} />;
}

export default async function FamiliesPage({ searchParams }: FamiliesPageProps) {
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Users className="h-8 w-8 text-indigo-600" />
                        Families Management
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage parent accounts, track outstanding dues, and view family students.
                    </p>
                </div>
            </div>

            <Suspense fallback={<TableSkeleton rows={10} columns={5} />}>
                <FamiliesContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
