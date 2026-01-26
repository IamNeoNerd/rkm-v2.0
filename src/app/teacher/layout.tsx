import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import Link from "next/link";
import {
    Home,
    BookOpen,
    Calendar,
    LogOut,
    GraduationCap,
    Bell,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { GlassCard } from "@/components/modern/Card";
import { Button } from "@/components/modern/Button";
import { cn } from "@/lib/utils";

export default async function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (!session.user.isVerified) {
        redirect("/verify");
    }

    if (session.user.role !== "teacher") {
        redirect("/");
    }

    const navItems = [
        { href: "/teacher", icon: Home, label: "Console" },
        { href: "/teacher/batches", icon: BookOpen, label: "Batches" },
        { href: "/teacher/attendance", icon: Calendar, label: "Register" },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] font-satoshi selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-400/10 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            {/* Premium Glass Header */}
            <header className="sticky top-0 z-50 px-6 py-4">
                <GlassCard
                    className="max-w-7xl mx-auto px-6 py-3 border-white/60 shadow-xl flex items-center justify-between rounded-2xl"
                    intensity="high"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Academic Console</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.user.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-2" />
                        <form action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/login" });
                        }}>
                            <Button
                                type="submit"
                                variant="ghost"
                                className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Terminate
                            </Button>
                        </form>
                    </div>
                </GlassCard>
            </header>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 py-8 relative z-10">
                {/* Desktop Navigation Side Dock */}
                <aside className="hidden lg:block space-y-8 sticky top-28 h-fit">
                    <nav className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Navigation Matrix</p>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 border border-transparent hover:border-emerald-100"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                        <item.icon className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <span className="text-sm font-black text-slate-600 tracking-tight uppercase group-hover:text-slate-900 transition-colors italic">
                                        {item.label}
                                    </span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </nav>

                    <GlassCard className="p-6 border-emerald-100 bg-emerald-50/30" intensity="low">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Pedagogical Tip</h3>
                        </div>
                        <p className="text-xs text-emerald-900/60 font-medium leading-relaxed italic">
                            Active engagement protocols increase student knowledge retention by 60%.
                        </p>
                    </GlassCard>
                </aside>

                {/* Main Content Node */}
                <main className="min-h-[calc(100vh-200px)] animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
                    {children}
                </main>
            </div>

            {/* Mobile Navigation Bottom Dock */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
                <GlassCard className="p-2 flex items-center justify-between border-white/60 shadow-2xl rounded-[2rem]" intensity="high">
                    <div className="flex gap-2 p-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="p-4 rounded-2xl hover:bg-slate-100 transition-colors relative group"
                            >
                                <item.icon className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                            </Link>
                        ))}
                    </div>
                    <form action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/login" });
                    }} className="p-1">
                        <button type="submit" className="p-4 rounded-[1.5rem] bg-slate-900 text-white shadow-xl">
                            <LogOut className="h-6 w-6" />
                        </button>
                    </form>
                </GlassCard>
            </div>

            {/* Minimal Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200/50 mt-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 opacity-30">
                        <GraduationCap className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">RK Institute Academic Matrix</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Instruction Protocols v3.0</p>
                </div>
            </footer>
        </div>
    );
}
