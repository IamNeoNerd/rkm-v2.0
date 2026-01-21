import { GraduationCap, Bell, User, LogOut, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/modern/Card";
import { Button } from "@/components/modern/Button";
import { cn } from "@/lib/utils";

/**
 * Guardian Portal - Premium Layout
 * Integrated with Satoshi (Body) and Fira Code (Data) fonts.
 */

export default function ParentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#fafafa] font-satoshi selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/10 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            {/* Premium Glass Header */}
            <header className="sticky top-0 z-50 px-6 py-4">
                <GlassCard
                    className="max-w-4xl mx-auto px-6 py-3 border-white/60 shadow-xl flex items-center justify-between rounded-2xl"
                    intensity="high"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xs font-black text-slate-900 uppercase tracking-tighter italic">Guardian Portal</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RK Institute Identity</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-indigo-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <Link href="/login" className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </GlassCard>
            </header>

            {/* Main Content Node */}
            <main className="max-w-4xl mx-auto px-6 py-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
            </main>

            {/* Minimal Footer */}
            <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-slate-200/50 mt-12 relative z-10 text-center space-y-4">
                <div className="flex items-center justify-center gap-3 opacity-30">
                    <GraduationCap className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Guardian Control Matrix</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 RK Institute • Family Node Support</p>
            </footer>
        </div>
    );
}

// Internal Link wrapper for the logout if next/link is not imported and we want simple behavior or if we need to import it
import Link from "next/link";
