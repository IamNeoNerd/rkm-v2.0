import {
    Users,
    Settings as SettingsIcon,
    Database,
    Key,
    ChevronRight,
    IndianRupee,
    Calendar,
    History,
    Bell,
    ShieldCheck,
    Shield,
    Cpu
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/modern/Card";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
    const session = await auth();

    // Fallback protection just in case middleware is bypassed
    if (session?.user?.role !== "super-admin") {
        redirect("/");
    }

    const sections = [
        {
            title: "Identity Control",
            description: "Manage neural access and administrative hierarchies.",
            href: "/settings/users",
            icon: Users,
            color: "text-blue-500",
            accent: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            title: "Access Matrices",
            description: "Calibrate granular feature protocols and role-based clearance.",
            href: "/settings/permissions",
            icon: Shield,
            color: "text-indigo-500",
            accent: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        },
        {
            title: "Revenue Model",
            description: "Calibrate class-wise fee structures and admission tiers.",
            href: "/settings/fees",
            icon: IndianRupee,
            color: "text-emerald-500",
            accent: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            title: "Temporal Units",
            description: "Synchronize academic sessions and instructional periods.",
            href: "/settings/sessions",
            icon: Calendar,
            color: "text-purple-500",
            accent: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            title: "Audit Ledger",
            description: "Investigate operational history and security trails.",
            href: "/settings/audit-logs",
            icon: History,
            color: "text-amber-500",
            accent: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            title: "Secret Keys",
            description: "Rotate credentials and update security signatures.",
            href: "/settings/profile",
            icon: Key,
            color: "text-rose-500",
            accent: "bg-rose-500/10",
            border: "border-rose-500/20"
        },
        {
            title: "Auth Protocol",
            description: "Configure biometric OAuth and neural verification.",
            href: "/settings/auth",
            icon: Shield,
            color: "text-indigo-500",
            accent: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        },
        {
            title: "Pulse Alerts",
            description: "Define communication frequency and alert thresholds.",
            href: "/settings/notifications",
            icon: Bell,
            color: "text-orange-500",
            accent: "bg-orange-500/10",
            border: "border-orange-500/20"
        },
        {
            title: "System Core",
            description: "Institutional parameters and global overrides.",
            href: "#",
            icon: Cpu,
            color: "text-slate-500",
            accent: "bg-slate-500/10",
            border: "border-slate-500/20",
            comingSoon: true
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Hub */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3">
                        System Topology
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Global Parameters & Access Control Matrix
                    </p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Root Access Verified</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sections.map((section) => {
                    const Content = (
                        <div className="flex items-start gap-5 relative z-10">
                            <div className={cn(
                                "p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-lg",
                                section.accent,
                                section.color,
                                "shadow-transparent group-hover:shadow-[0_0_20px_-5px_currentColor]"
                            )}>
                                <section.icon className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-primary transition-colors">
                                    {section.title}
                                </h2>
                                <p className="text-[11px] font-medium text-slate-400 mt-1.5 leading-relaxed">
                                    {section.description}
                                </p>
                            </div>
                            {!section.comingSoon && (
                                <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            )}
                        </div>
                    );

                    if (section.comingSoon) {
                        return (
                            <GlassCard
                                key={section.title}
                                className="relative p-8 overflow-hidden grayscale opacity-60 cursor-not-allowed border-dashed border-2"
                                intensity="low"
                            >
                                {Content}
                                <div className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 py-1 bg-white/50 rounded border border-white/50">
                                    Offline
                                </div>
                            </GlassCard>
                        );
                    }

                    return (
                        <Link
                            key={section.title}
                            href={section.href}
                            className="group"
                        >
                            <GlassCard
                                className={cn(
                                    "p-8 h-full transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-white/40",
                                    "hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
                                )}
                                intensity="medium"
                            >
                                {Content}
                            </GlassCard>
                        </Link>
                    );
                })}
            </div>

            {/* System Status Visualizer */}
            <GlassCard className="p-10 relative overflow-hidden" intensity="high">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-slate-900 rounded-2xl shadow-2xl">
                            <Cpu className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Integrity</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Operational Status: Nominal</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center px-6 py-4 bg-white/50 rounded-2xl border border-white/40">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Latency</span>
                            <span className="text-xl font-black text-emerald-600">12ms</span>
                        </div>
                        <div className="flex flex-col items-center px-6 py-4 bg-white/50 rounded-2xl border border-white/40">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Uptime</span>
                            <span className="text-xl font-black text-primary">99.9%</span>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
