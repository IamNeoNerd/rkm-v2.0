import { getTeacherBatches } from "@/actions/teacher";
import { BookOpen, AlertCircle, Users, Clock, Calendar } from "lucide-react";
import Link from "next/link";

export default async function TeacherDashboard() {
    const result = await getTeacherBatches();

    if (!result.success) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-300">{result.error || "Failed to load batches"}</p>
            </div>
        );
    }

    const { batches, staffName } = result;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center py-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome, {staffName || "Teacher"}
                </h1>
                <p className="text-slate-400">
                    Manage your batches and track student attendance
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 text-center">
                    <BookOpen className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{batches?.length || 0}</div>
                    <div className="text-slate-400 text-sm">Assigned Batches</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 text-center">
                    <Users className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">--</div>
                    <div className="text-slate-400 text-sm">Total Students</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 text-center col-span-2 md:col-span-1">
                    <Calendar className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-slate-400 text-sm">Today</div>
                </div>
            </div>

            {/* My Batches */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-emerald-400" />
                        My Batches
                    </h2>
                    <Link
                        href="/teacher/batches"
                        className="text-emerald-400 hover:text-emerald-300 text-sm"
                    >
                        View All →
                    </Link>
                </div>

                {!batches || batches.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No batches assigned yet</p>
                        <p className="text-slate-500 text-sm mt-1">
                            Contact admin to get batches assigned to your account
                        </p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {batches.map((batch) => (
                            <Link
                                key={batch.id}
                                href={`/teacher/batches/${batch.id}`}
                                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 hover:border-emerald-500/50 transition-colors group"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                            {batch.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                                            <Clock className="h-4 w-4" />
                                            {batch.schedule || "Schedule TBA"}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${batch.isActive
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {batch.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Quick Actions */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/teacher/attendance"
                        className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl p-6 hover:bg-emerald-600/30 transition-colors group"
                    >
                        <Calendar className="h-8 w-8 text-emerald-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400">
                            Mark Today's Attendance
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Record attendance for your batches
                        </p>
                    </Link>
                    <Link
                        href="/teacher/batches"
                        className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-6 hover:bg-indigo-600/30 transition-colors group"
                    >
                        <Users className="h-8 w-8 text-indigo-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400">
                            View Students
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            See enrolled students in your batches
                        </p>
                    </Link>
                </div>
            </section>
        </div>
    );
}
