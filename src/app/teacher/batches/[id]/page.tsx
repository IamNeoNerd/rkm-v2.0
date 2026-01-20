import { getTeacherBatchDetails, getBatchStudents } from "@/actions/teacher";
import { BookOpen, AlertCircle, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function TeacherBatchDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const batchId = parseInt(id);

    const [batchResult, studentsResult] = await Promise.all([
        getTeacherBatchDetails(batchId),
        getBatchStudents(batchId),
    ]);

    if (!batchResult.success) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-300">{batchResult.error || "Failed to load batch"}</p>
            </div>
        );
    }

    const { batch } = batchResult;
    const students = studentsResult.success ? studentsResult.students : [];

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link
                href="/teacher/batches"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Batches
            </Link>

            {/* Batch Header */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-emerald-400" />
                            {batch?.name}
                        </h1>
                        <p className="text-slate-400 mt-1">{batch?.schedule || "Schedule TBA"}</p>
                    </div>
                    <Link
                        href={`/teacher/batches/${batchId}/attendance`}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-center"
                    >
                        Mark Attendance
                    </Link>
                </div>
            </div>

            {/* Student Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center">
                    <Users className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{students?.length || 0}</div>
                    <div className="text-slate-400 text-sm">Enrolled Students</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                        ₹{batch?.fee?.toLocaleString('en-IN') || 0}
                    </div>
                    <div className="text-slate-400 text-sm">Batch Fee/Month</div>
                </div>
            </div>

            {/* Students List */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" />
                    Enrolled Students
                </h2>

                {!students || students.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No students enrolled in this batch</p>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Class</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">
                                                        {student.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="text-white font-medium">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">{student.class}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${student.isActive
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {student.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
