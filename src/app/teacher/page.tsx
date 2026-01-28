import { getTeacherBatches } from "@/actions/teacher";
import { BookOpen, AlertCircle, Users, Clock, Calendar, ArrowUpRight, Activity, Sparkles, GraduationCap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/modern/Card";
import { cn } from "@/lib/utils";

export default async function TeacherDashboard() {
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

    const { batches, staffName } = result;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Intelligent Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/50">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">
                        Academic Terminal
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                            <Activity className="h-3 w-3" />
                            Online Sync Active
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node Instructor: {staffName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Neural Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <GlassCard className="p-8 border-emerald-500/10 hover:border-emerald-500/30 group transition-all" intensity="medium">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="h-7 w-7 text-emerald-600" />
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase">Live</div>
                    </div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{batches?.length || 0}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Batch Vectors</div>
                </GlassCard>

                <GlassCard className="p-8 border-indigo-500/10 hover:border-indigo-500/30 group transition-all" intensity="medium">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="h-7 w-7 text-indigo-600" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1">--</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Student Entities</div>
                </GlassCard>

                <GlassCard className="p-8 border-amber-500/10 hover:border-amber-500/30 group transition-all md:col-span-2 lg:col-span-1" intensity="medium">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Sparkles className="h-7 w-7 text-amber-600" />
                        </div>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                            ))}
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">Protocol Efficiency</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Transmission: 98%</div>
                </GlassCard>
            </div>

            {/* Instructional Channels (My Batches) */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                        <BookOpen className="h-3 w-3" /> Instructional Matrix Channels
                    </h2>
                    <Link
                        href="/teacher/batches"
                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2"
                    >
                        Access All Nodes <ChevronRight className="h-3 w-3" />
                    </Link>
                </div>

                {!batches || batches.length === 0 ? (
                    <GlassCard className="p-16 text-center border-slate-200/50" intensity="low">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-6">
                            <GraduationCap className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">No Active Instruction Vectors</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-sm mx-auto">
                            The terminal has not identified any batch allocations. Connect with the central core for node synchronization.
                        </p>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {batches.map((batch: any) => (
                            <Link
                                key={batch.id}
                                href={`/teacher/batches/${batch.id}`}
                                className="group block"
                            >
                                <GlassCard className="p-8 h-full border-white/60 shadow-xl group-hover:-translate-y-2 transition-all duration-500 overflow-hidden relative" intensity="medium">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />

                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-8">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic group-hover:text-emerald-600 transition-colors">
                                                {batch.name}
                                            </h3>
                                            <div className={cn(
                                                "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border",
                                                batch.isActive
                                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                    : 'bg-red-50 border-red-100 text-red-600'
                                            )}>
                                                {batch.isActive ? 'Pulse' : 'Static'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-slate-300" />
                                            </div>
                                            {batch.schedule || "Time TBA"}
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Telemetry Active</span>
                                            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Tactical Access Matrix (Quick Actions) */}
            <section className="space-y-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                    <Activity className="h-3 w-3" /> Tactical Access Matrix
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link
                        href="/teacher/attendance"
                        className="group relative"
                    >
                        <GlassCard className="p-10 border-emerald-500/20 bg-emerald-50/20 shadow-xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-500" intensity="high">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700" />

                            <div className="relative space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                                    <Calendar className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-2 group-hover:text-emerald-700 transition-colors">
                                        Mark Pulse Attendance
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose max-w-xs">
                                        Initialize real-time student participation recording for current instruction blocks.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <span className="text-[11px] font-black uppercase tracking-widest">Execute Protocol</span>
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </GlassCard>
                    </Link>

                    <Link
                        href="/teacher/batches"
                        className="group relative"
                    >
                        <GlassCard className="p-10 border-indigo-500/20 bg-indigo-50/20 shadow-xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-500" intensity="high">
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full -mr-24 -mb-24 group-hover:scale-150 transition-transform duration-700" />

                            <div className="relative space-y-6">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                                    <Users className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-2 group-hover:text-indigo-700 transition-colors">
                                        Entity Database
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose max-w-xs">
                                        Access comprehensive student entity metadata and instruction histories.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <span className="text-[11px] font-black uppercase tracking-widest">Open Matrix</span>
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </GlassCard>
                    </Link>
                </div>
            </section>
        </div>
    );
}

// Local helper component for ArrowRight which was used in layout but might be missing here if not imported
function ArrowRight({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("lucide lucide-arrow-right", className)}
        >
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
    );
}
