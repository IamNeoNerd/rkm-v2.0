import { getTeacherBatchDetails, getBatchStudents } from "@/actions/teacher";
import { BookOpen, AlertCircle, Users, ArrowLeft, Activity, Sparkles, GraduationCap, ChevronRight, Calculator } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/modern/Card";
import { cn } from "@/lib/utils";

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
            <GlassCard className="p-8 border-white/60 shadow-2xl relative overflow-hidden" intensity="high">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-emerald-50 flex items-center justify-center shadow-xl shadow-emerald-500/10">
                            <BookOpen className="h-8 w-8 text-emerald-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100/50 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">NODE_BATCH</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID: #{batchId.toString().padStart(4, '0')}</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{batch?.name}</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <Activity className="h-3 w-3" />
                                SYNC_SCHEDULE: {batch?.schedule || "TBA"}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/teacher/batches/${batchId}/attendance`}
                        className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest"
                    >
                        <Sparkles className="h-4 w-4" />
                        Execute Attendance
                    </Link>
                </div>
            </GlassCard>

            {/* Neural Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-8 border-indigo-500/10 hover:border-indigo-500/30 group transition-all" intensity="medium">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="h-7 w-7 text-indigo-600" />
                        </div>
                        <div className="p-2 rounded-lg bg-indigo-50 text-[10px] font-black text-indigo-600 uppercase">Registered</div>
                    </div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1 font-mono">{students?.length || 0}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Entity Nodes</div>
                </GlassCard>

                <GlassCard className="p-8 border-amber-500/10 hover:border-amber-500/30 group transition-all" intensity="medium">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calculator className="h-7 w-7 text-amber-600" />
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50 text-[10px] font-black text-amber-600 uppercase">Valuation</div>
                    </div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1 font-mono">₹{batch?.fee?.toLocaleString('en-IN') || 0}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Fee Matrix</div>
                </GlassCard>
            </div>

            <section className="space-y-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                    <Users className="h-3 w-3" /> Entity Roster Matrix
                </h2>

                {!students || students.length === 0 ? (
                    <GlassCard className="p-12 text-center border-slate-100" intensity="low">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No entities identified in this node.</p>
                    </GlassCard>
                ) : (
                    <div className="grid gap-4">
                        {students.map((student) => (
                            <GlassCard
                                key={student.id}
                                className={cn(
                                    "p-6 border-white/60 shadow-xl group transition-all duration-300",
                                    student.isActive ? "border-emerald-100" : "opacity-60 grayscale"
                                )}
                                intensity="medium"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                                            <GraduationCap className="h-7 w-7 text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{student.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NODE_ID:</p>
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-50/50 font-mono">#{student.id.toString().padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Status Vector</p>
                                            <p className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                student.isActive ? "text-emerald-600" : "text-red-600"
                                            )}>
                                                {student.isActive ? "ACTIVE" : "INACTIVE"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
