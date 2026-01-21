import { getAllStudents } from "@/actions/admission";
import { Users } from "lucide-react";
import { StudentsTable } from "@/components/StudentsTable";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/skeletons";

interface StudentsPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        class?: string;
        status?: string;
    }>;
}

async function StudentsContent({ searchParams }: StudentsPageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.search || '';
    const className = params.class || 'all';
    const status = params.status || 'all';

    const { students, pagination, error } = await getAllStudents({
        page,
        limit: 20,
        search,
        class: className,
        status: status,
    });

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>
        );
    }

    if (students && students.length === 0) {
        const hasFilters = search || className !== 'all' || status !== 'all';

        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {hasFilters ? 'No Students Found' : 'No Students Yet'}
                </h3>
                <p className="text-gray-600">
                    {hasFilters
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Get started by admitting your first student.'}
                </p>
            </div>
        );
    }

    return <StudentsTable students={students || []} pagination={pagination} />;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="h-8 w-8 text-indigo-600" />
                    All Students
                </h1>
                <p className="text-gray-600 mt-1">Manage and view all enrolled students</p>
            </div>

            <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
                <StudentsContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
