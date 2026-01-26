import { getTeacherBatches } from "@/actions/teacher";
import { BookOpen, AlertCircle, Users, Clock, Activity } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/modern/Card";
import { Button } from "@/components/modern/Button";
import { cn } from "@/lib/utils";

export default async function TeacherBatchesPage() {
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

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Intelligent Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/50">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">
                        Instructional Matrix
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                            <Activity className="h-3 w-3" />
                            Matrix Inventory Active
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database of assigned instructional nodes</p>
                    </div>
                </div>
            </div>

            {!batches || batches.length === 0 ? (
                <GlassCard className="p-16 text-center border-slate-200/50" intensity="low">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="h-10 w-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">No Active Vectors Found</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-sm mx-auto">
                        The terminal has not identified any instructional nodes. Connect with central admin for node allocation.
                    </p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {batches.map((batch: any) => (
                        <GlassCard
                            key={batch.id}
                            className="p-8 border-white/60 shadow-xl overflow-hidden relative group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                            intensity="medium"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />

                            <div className="relative">
                                <div className="flex items-start justify-between mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic group-hover:text-emerald-600 transition-colors leading-tight">
                                        {batch.name}
                                    </h3>
                                    <div className={cn(
                                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border shrink-0",
                                        batch.isActive
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                            : 'bg-red-50 border-red-100 text-red-600'
                                    )}>
                                        {batch.isActive ? 'Active' : 'Static'}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-slate-300" />
                                        </div>
                                        {batch.schedule || "Time TBA"}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-slate-300" />
                                        </div>
                                        Telemetry Sync Active
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200"
                                    >
                                        <Link href={`/teacher/batches/${batch.id}`}>
                                            Entities
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        className="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                                    >
                                        <Link href={`/teacher/batches/${batch.id}/attendance`}>
                                            Mark Pulse
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}
