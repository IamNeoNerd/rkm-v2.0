import { getTeacherBatches } from "@/actions/teacher";
import { BookOpen, AlertCircle, Users, Clock } from "lucide-react";
import Link from "next/link";

export default async function TeacherBatchesPage() {
    const result = await getTeacherBatches();

    if (!result.success) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-300">{result.error || "Failed to load batches"}</p>
            </div>
        );
    }

    const { batches } = result;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-emerald-400" />
                    My Batches
                </h1>
                <p className="text-slate-400 mt-1">View and manage your assigned batches</p>
            </div>

            {!batches || batches.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                    <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No batches assigned</p>
                    <p className="text-slate-500 text-sm mt-1">
                        Contact admin to get batches assigned to your account
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {batches.map((batch) => (
                        <div
                            key={batch.id}
                            className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">
                                        {batch.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {batch.schedule || "Schedule TBA"}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${batch.isActive
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {batch.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link
                                        href={`/teacher/batches/${batch.id}`}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Users className="h-4 w-4" />
                                        View Students
                                    </Link>
                                    <Link
                                        href={`/teacher/batches/${batch.id}/attendance`}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                    >
                                        Mark Attendance
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
