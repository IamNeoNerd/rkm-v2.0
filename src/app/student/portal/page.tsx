import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
    GraduationCap,
    Calendar,
    Clock,
    BookOpen,
    Star,
    ArrowUpRight,
    Activity,
    User,
    Award
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { GlassCard } from "@/components/modern/Card";
import { Button } from "@/components/modern/Button";
import Link from "next/link";
import { db } from "@/db";
import { students, enrollments, batches } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function StudentPortal() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role !== "student") {
        redirect("/");
    }

    // Fetch student specific data
    const studentData = await db.query.students.findFirst({
        where: eq(students.userId, session.user.id as string),
        with: {
            enrollments: {
                with: {
                    batch: true
                }
            }
        }
    });

    if (!studentData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <GlassCard className="p-8 text-center max-w-md border-red-500/20" intensity="high">
                    <Activity className="h-12 w-12 text-red-500 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">DATA_SYNC_ERROR</h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">
                        Student metadata could not be synchronized with your authentication node.
                        Please contact the central office.
                    </p>
                </GlassCard>
            </div>
        );
    }

    const { name, class: className } = studentData;
    const activeBatches = studentData.enrollments.filter(e => e.isActive).map(e => e.batch);

    return (
        <div className="flex-1 space-y-10 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Intelligent Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/60"> Enrollment Matrix // Academic Year 2025-26 </p>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground italic">
                        WELCOME, <span className="text-primary not-italic">{name?.split(' ')[0].toUpperCase()}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 dark:bg-slate-900 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600"> Class Level </p>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{className}</p>
                    </div>
                </div>
            </div>

            {/* Tactical Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Batches"
                    value={activeBatches.length.toString()}
                    icon={<BookOpen className="h-5 w-5 text-primary" />}
                    description="Instructional channels"
                />
                <StatCard
                    title="Attendance"
                    value="94%"
                    icon={<Calendar className="h-5 w-5 text-secondary" />}
                    description="Protocol adherence"
                />
                <StatCard
                    title="Performance"
                    value="A+"
                    icon={<Award className="h-5 w-5 text-amber-500" />}
                    description="Mastery level"
                />
                <StatCard
                    title="Engagement"
                    value="9.8"
                    icon={<Activity className="h-5 w-5 text-emerald-500" />}
                    description="Neural sync score"
                />
            </div>

            {/* Content Matrix */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Active Instructional Vectors */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3">
                        <Clock className="h-3 w-3" /> ACTIVE_INSTRUCTION_VECTORS
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {activeBatches.length > 0 ? activeBatches.map((batch) => (
                            <GlassCard key={batch.id} className="p-6 group hover:border-primary/50 transition-all duration-500 relative overflow-hidden" intensity="medium">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase group-hover:text-primary transition-colors">
                                        {batch.name}
                                    </h3>
                                    <ArrowUpRight className="h-4 w-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <Clock className="h-3 w-3" /> {batch.schedule || 'Schedule Pending'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                        <Activity className="h-3 w-3" /> Pulse: Active
                                    </div>
                                </div>
                                <Link
                                    href={`/student/portal/batches/${batch.id}`}
                                    className="mt-6 block text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:tracking-[0.4em] transition-all"
                                >
                                    OPEN_TELEMETRY
                                </Link>
                            </GlassCard>
                        )) : (
                            <GlassCard className="p-12 text-center col-span-2 border-dashed border-muted-foreground/20" intensity="low">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">No active instructional vectors found.</p>
                            </GlassCard>
                        )}
                    </div>
                </div>

                {/* Tactical Sidebar */}
                <div className="space-y-8">
                    <section className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3">
                            <User className="h-3 w-3" /> TACTICAL_ACCESS
                        </h2>
                        <div className="grid gap-3">
                            <Button variant="glass" className="justify-start h-14 rounded-2xl group border-white/40">
                                <BookOpen className="h-4 w-4 mr-3 text-primary group-hover:rotate-12 transition-transform" />
                                <span className="font-bold tracking-tight">Academic Records</span>
                            </Button>
                            <Button variant="glass" className="justify-start h-14 rounded-2xl group border-white/40">
                                <Star className="h-4 w-4 mr-3 text-amber-500 group-hover:rotate-12 transition-transform" />
                                <span className="font-bold tracking-tight">Test Results</span>
                            </Button>
                            <Button variant="glass" className="justify-start h-14 rounded-2xl group border-white/40">
                                <Calendar className="h-4 w-4 mr-3 text-secondary group-hover:rotate-12 transition-transform" />
                                <span className="font-bold tracking-tight">Batch Schedule</span>
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
