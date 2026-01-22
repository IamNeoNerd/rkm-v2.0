import { getTeacherBatches } from "@/actions/teacher";
import { Calendar, AlertCircle, BookOpen, Clock, Activity, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/modern/Card";
import { cn } from "@/lib/utils";

export default async function TeacherAttendancePage() {
    const result = await getTeacherBatches();

    if (!result.success) {
        return (
            <GlassCard className="p-8 border-red-500/20 bg-red-50/10 flex items-center gap-4" intensity="medium">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-red-900 uppercase tracking-widest">Protocol Sync Failed</h3>
                    <p className="text-xs text-red-600/70 font-bold uppercase tracking-widest mt-0.5">{result.error || "Neural link offline"}</p>
                </div>
            </GlassCard>
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Intelligent Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/50">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">
                        Pulse Register
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                            <Activity className="h-3 w-3" />
                            Neural Recording Matrix
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{today}</p>
                    </div>
                </div>
            </div>

            {/* Tactical Selector Matrix */}
            <section className="space-y-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                    <BookOpen className="h-3 w-3" /> Select Batch Node to Initialize
                </h2>

                {!batches || batches.length === 0 ? (
                    <GlassCard className="p-16 text-center border-slate-200/50" intensity="low">
                        <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">No Active Nodes Identified</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect with central core for node synchronization.</p>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {batches.filter(b => b.isActive).map((batch) => (
                            <Link
                                key={batch.id}
                                href={`/teacher/batches/${batch.id}/attendance`}
                                className="group block"
                            >
                                <GlassCard className="p-8 border-white/60 shadow-xl group-hover:scale-[1.02] group-hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden" intensity="medium">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                                <BookOpen className="h-7 w-7 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic group-hover:text-emerald-600 transition-colors">
                                                    {batch.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {batch.schedule || "Schedule TBA"}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-6 w-6 text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" />
                                    </div>
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Instructional Sync Metadata */}
            <GlassCard className="p-6 border-amber-500/20 bg-amber-50/30 flex items-start gap-4" intensity="low">
                <div className="p-2 rounded-lg bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                    <Sparkles className="h-4 w-4" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1">Instructional Tip</h4>
                    <p className="text-xs text-amber-900/60 font-medium leading-relaxed italic">
                        Node recording (attendance) can be retrospectively adjusted by modifying the temporal identifier (date) within the specific batch matrix.
                    </p>
                </div>
            </GlassCard>
        </div>
    );
}
