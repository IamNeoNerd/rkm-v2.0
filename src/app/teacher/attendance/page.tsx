import { getTeacherBatches } from "@/actions/teacher";
import { Calendar, AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function TeacherAttendancePage() {
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
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-emerald-400" />
                    Attendance
                </h1>
                <p className="text-slate-400 mt-1">{today}</p>
            </div>

            {/* Select Batch to Mark Attendance */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Select a batch to mark attendance</h2>

                {!batches || batches.length === 0 ? (
                    <p className="text-slate-400">No batches assigned</p>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {batches.filter(b => b.isActive).map((batch) => (
                            <Link
                                key={batch.id}
                                href={`/teacher/batches/${batch.id}/attendance`}
                                className="p-4 bg-slate-700/50 hover:bg-emerald-600/20 border border-slate-600 hover:border-emerald-500/50 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-6 w-6 text-slate-400 group-hover:text-emerald-400" />
                                    <div>
                                        <p className="text-white font-medium group-hover:text-emerald-400">
                                            {batch.name}
                                        </p>
                                        <p className="text-slate-400 text-sm">
                                            {batch.schedule || "Schedule TBA"}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-300 text-sm">
                    <strong>Tip:</strong> Click on any batch above to mark attendance for that batch.
                    You can change the date on the attendance page to mark attendance for previous dates.
                </p>
            </div>
        </div>
    );
}
