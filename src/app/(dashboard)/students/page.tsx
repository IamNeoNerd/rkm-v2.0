import { getAllStudents } from "@/actions/admission";
import { Users } from "lucide-react";
import { StudentsTable } from "@/components/StudentsTable";

export default async function StudentsPage() {
    const { students, error } = await getAllStudents();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="h-8 w-8 text-indigo-600" />
                    All Students
                </h1>
                <p className="text-gray-600 mt-1">Manage and view all enrolled students</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {students && students.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Yet</h3>
                    <p className="text-gray-600">Get started by admitting your first student.</p>
                </div>
            ) : (
                <StudentsTable students={students || []} />
            )}
        </div>
    );
}
