import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import Link from "next/link";
import {
    Home,
    IndianRupee,
    UserPlus,
    LogOut,
    Wallet,
    Bell,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { GlassCard } from "@/components/modern/Card";
import { Button } from "@/components/modern/Button";

export default async function CashierLayout({
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

    if (session.user.role !== "cashier") {
        redirect("/");
    }

    const navItems = [
        { href: "/cashier", icon: Home, label: "Terminal" },
        { href: "/cashier/fees", icon: IndianRupee, label: "Revenue" },
        { href: "/cashier/admission", icon: UserPlus, label: "Enrollment" },
    ];

    return (
        <div className="min-h-screen bg-[#FAF9F6] selection:bg-amber-500/20 selection:text-amber-700">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-200/40 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/40 blur-[120px] rounded-full" />
            </div>

            {/* Premium Top Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
                <GlassCard className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between border-white/60 shadow-xl backdrop-blur-2xl rounded-2xl" intensity="high">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-amber-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-xl" />
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Wallet className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 leading-none">Cashier Terminal</h1>
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-black uppercase text-amber-700 border border-amber-200">Active</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operator: {session.user.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 border-2 border-white rounded-full" />
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <form action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/login" });
                        }}>
                            <button
                                type="submit"
                                className="flex items-center gap-2 p-1.5 pr-4 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all font-bold text-xs uppercase tracking-widest"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <LogOut className="h-4 w-4" />
                                </div>
                                <span className="hidden sm:inline">Flush Session</span>
                            </button>
                        </form>
                    </div>
                </GlassCard>
            </header>

            {/* Layout Container */}
            <div className="flex pt-28 pb-12 px-6">
                {/* Desktop Navigation Dock */}
                <aside className="fixed left-6 top-28 bottom-12 w-64 hidden lg:block">
                    <GlassCard className="h-full p-6 flex flex-col border-white/40 shadow-2xl rounded-[2.5rem]" intensity="medium">
                        <div className="mb-10 px-2">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Navigation Matrix</h2>
                            <nav className="space-y-3">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center justify-between group p-4 rounded-2xl hover:bg-white/60 transition-all border border-transparent hover:border-white/40"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-amber-100 transition-colors">
                                                <item.icon className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">{item.label}</span>
                                        </div>
                                        <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-amber-500 transform group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="mt-auto">
                            <GlassCard className="p-4 bg-amber-500/10 border-amber-500/20 rounded-2xl" intensity="low">
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="h-4 w-4 text-amber-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Financial Tip</span>
                                </div>
                                <p className="text-[10px] text-amber-800/70 font-medium leading-relaxed">
                                    Always verify the receipt number before finalizing collections.
                                </p>
                            </GlassCard>
                        </div>
                    </GlassCard>
                </aside>

                {/* Main Viewport */}
                <main className="flex-1 lg:ml-72 max-w-5xl mx-auto w-full">
                    {children}
                </main>
            </div>

            {/* Mobile Navigation (Floating Dock) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[90%] max-w-sm">
                <GlassCard className="flex items-center justify-around py-4 px-2 border-white/60 shadow-2xl backdrop-blur-2xl rounded-3xl" intensity="high">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="p-3 rounded-2xl hover:bg-amber-50 group transition-all"
                        >
                            <item.icon className="h-6 w-6 text-slate-400 group-hover:text-amber-600" />
                        </Link>
                    ))}
                    <div className="h-8 w-px bg-slate-200 mx-2" />
                    <button className="p-3 rounded-2xl hover:bg-red-50 group transition-all">
                        <LogOut className="h-6 w-6 text-slate-400 group-hover:text-red-500" />
                    </button>
                </GlassCard>
            </div>
        </div>
    );
}
