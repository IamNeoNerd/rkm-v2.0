import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
    Users,
    Calendar,
    CreditCard,
    BookOpen,
    Clock,
    Star,
    ArrowUpRight
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { GlassCard } from "@/components/modern/Card";
import { Button } from "@/components/modern/Button";
import Link from "next/link";
import { getTeacherDashboardMetrics } from "@/actions/dashboard";

export default async function StaffDashboard() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Role check: Admin/Super-admin should go to main dashboard
    if (session.user.role === "admin" || session.user.role === "super-admin") {
        redirect("/");
    }

    const { role, name } = session.user;
    const metricsResult = await getTeacherDashboardMetrics();
    const defaultMetrics = {
        assignedNodes: 0,
        activeSessions: 0,
        performance: "0%",
        role: role
    };
    const metrics = metricsResult.success && metricsResult.metrics
        ? metricsResult.metrics
        : defaultMetrics;

    return (
        <div className="flex-1 space-y-10 p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/60"> Staff Portal // Active Session </p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground italic">
                        HELLO, <span className="text-primary not-italic">{name?.split(' ')[0].toUpperCase()}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="glass" size="lg" className="rounded-2xl border-white/40">
                        <Clock className="mr-2 h-4 w-4" />
                        Shift Log
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Assigned Nodes"
                    value={metrics.assignedNodes.toString()}
                    icon={<Users className="h-5 w-5 text-primary" />}
                    description="Students in your batch"
                />
                <StatCard
                    title="Active Sessions"
                    value={metrics.activeSessions.toString()}
                    icon={<Calendar className="h-5 w-5 text-secondary" />}
                    description="Classes currently active"
                />
                <StatCard
                    title="Performance"
                    value={metrics.performance}
                    icon={<Star className="h-5 w-5 text-amber-500" />}
                    description="Protocol Efficiency"
                />
                <StatCard
                    title="Tier"
                    value={role?.toUpperCase() || "STAFF"}
                    icon={<BookOpen className="h-5 w-5 text-emerald-500" />}
                    description="Access level"
                />
            </div>

            {/* Action Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <GlassCard className="p-8 group hover:border-primary/50 transition-all duration-500 cursor-pointer">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <Users className="h-6 w-6" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-xl font-black mb-2 italic">STUDENT <span className="not-italic text-primary">NODES</span></h3>
                    <p className="text-xs text-muted-foreground font-bold tracking-wider leading-relaxed uppercase">Manage your assigned students and their academic records.</p>
                    <Link href="/students" className="mt-8 block text-[10px] font-black uppercase tracking-[0.4em] text-primary"> ENTER MODULE </Link>
                </GlassCard>

                <GlassCard className="p-8 group hover:border-secondary/50 transition-all duration-500 cursor-pointer">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 rounded-2xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-xl font-black mb-2 italic">TIME <span className="not-italic text-secondary">LINES</span></h3>
                    <p className="text-xs text-muted-foreground font-bold tracking-wider leading-relaxed uppercase">Review your schedule and batch timings for the current week.</p>
                    <Link href="/batches" className="mt-8 block text-[10px] font-black uppercase tracking-[0.4em] text-secondary"> ENTER MODULE </Link>
                </GlassCard>

                {role === 'cashier' ? (
                    <GlassCard className="p-8 group hover:border-cta/50 transition-all duration-500 cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 rounded-2xl bg-cta/10 text-cta group-hover:bg-cta group-hover:text-white transition-all duration-500">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <ArrowUpRight className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="text-xl font-black mb-2 italic">FEE <span className="not-italic text-cta">PULSE</span></h3>
                        <p className="text-xs text-muted-foreground font-bold tracking-wider leading-relaxed uppercase">Process student fee payments and generate transaction receipts.</p>
                        <Link href="/fees" className="mt-8 block text-[10px] font-black uppercase tracking-[0.4em] text-cta"> ENTER MODULE </Link>
                    </GlassCard>
                ) : (
                    <GlassCard className="p-8 group hover:border-amber-500/50 transition-all duration-500 cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <ArrowUpRight className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="text-xl font-black mb-2 italic">ACADEMIC <span className="not-italic text-amber-500">CORE</span></h3>
                        <p className="text-xs text-muted-foreground font-bold tracking-wider leading-relaxed uppercase">Upload study materials, assignments and evaluate student tests.</p>
                        <Link href="/academics" className="mt-8 block text-[10px] font-black uppercase tracking-[0.4em] text-amber-500"> ENTER MODULE </Link>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
