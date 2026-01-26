import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { batches, staff, enrollments, students } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { GlassCard } from "@/components/modern/Card";
import { BookOpen, Clock, User, Activity, ChevronLeft, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/modern/Button";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    const batchId = parseInt(id);

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role !== "student") {
        redirect("/");
    }

    // 1. Identify the student node linked to this account
    const student = await db.query.students.findFirst({
        where: eq(students.userId, session.user.id as string)
    });

    if (!student) {
        redirect("/student/portal");
    }

    // 2. Fetch specific batch details if the student is enrolled
    const batchData = await db.query.batches.findFirst({
        where: eq(batches.id, batchId),
        with: {
            teacher: true,
            enrollments: {
                where: eq(enrollments.studentId, student.id)
            }
        }
    });

    if (!batchData || batchData.enrollments.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-8">
                <GlassCard className="p-12 text-center max-w-md border-rose-500/20" intensity="high">
                    <Activity className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black uppercase tracking-tighter">ACCESS_DENIED</h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">
                        You are not authorized to access this instructional vector.
                        Please ensure your enrollment is active.
                    </p>
                    <Link href="/student/portal" className="mt-6 block">
                        <Button variant="primary" className="w-full">Dashboard Return</Button>
                    </Link>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-10 p-4 md:p-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/student/portal" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 hover:gap-3 transition-all">
                        <ChevronLeft className="h-3 w-3" /> Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground italic uppercase">
                        {batchData.name} <span className="text-primary not-italic">Vector</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 dark:bg-slate-900 dark:border-emerald-900/20">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600"> Node Status </p>
                        <p className="text-sm font-black text-emerald-900 dark:text-emerald-400 uppercase italic">Active</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="p-8 relative overflow-hidden" intensity="high">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />

                        <div className="grid gap-8 md:grid-cols-2 relative lg:gap-12">
                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> Temporal Schedule
                                    </h4>
                                    <p className="text-2xl font-black text-slate-900 tracking-tight italic">
                                        {batchData.schedule || "SCHEDULE_STABLE_PENDING"}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Recurrent Session Time</p>
                                </section>

                                <section>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Spatial Node
                                    </h4>
                                    <p className="text-2xl font-black text-slate-900 tracking-tight italic">
                                        CENTRAL_BRANCH
                                    </p>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Physical Instruction Site</p>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 flex items-center gap-2">
                                        <User className="h-3 w-3" /> Lead Instructor
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-xl italic">
                                            {batchData.teacher?.name?.[0] || "T"}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 uppercase italic">{batchData.teacher?.name || "UNASSIGNED"}</p>
                                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Master Instructor</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </GlassCard>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <GlassCard className="p-6 border-emerald-500/10" intensity="medium">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4">Enrollment Data</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Sync Date</span>
                                    <span className="text-[10px] font-black text-slate-900">
                                        {batchData.enrollments[0].enrolledAt ? new Date(batchData.enrollments[0].enrolledAt).toLocaleDateString() : "EPOCH"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Access Type</span>
                                    <span className="text-[10px] font-black text-slate-900">FULL_NODE</span>
                                </div>
                            </div>
                        </GlassCard>

                        <Link href="/student/portal/attendance">
                            <GlassCard className="p-6 group hover:border-primary transition-all duration-500 h-full" intensity="medium">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Attendance History</h4>
                                    <Activity className="h-4 w-4 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase group-hover:text-primary transition-colors">View Log</p>
                                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Check session presence</p>
                            </GlassCard>
                        </Link>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3">
                        <Calendar className="h-3 w-3" /> UPCOMING_EVENTS
                    </h3>
                    <GlassCard className="p-6 text-center border-dashed" intensity="low">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No upcoming assessments tracked in this vector cycle.</p>
                    </GlassCard>

                    <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                        <h4 className="font-black italic uppercase tracking-tighter text-xl mb-2">Notice Node</h4>
                        <p className="text-[10px] font-bold opacity-80 leading-relaxed uppercase tracking-wide">
                            All instructional materials will be uploaded to the shared cloud repository.
                            Ensure your local terminal is updated.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
