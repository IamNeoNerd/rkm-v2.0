import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

export default function Custom500() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50">
            <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-10 animate-pulse">
                <AlertCircle className="h-12 w-12 text-rose-500" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-900 mb-6">
                FATAL <span className="text-rose-500">EXCEPTION</span>
            </h1>

            <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
                A critical institutional node failure has occurred.
                Static generation encountered a state violation.
            </p>

            <Link href="/">
                <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs italic hover:scale-105 transition-all shadow-xl shadow-slate-500/20 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Base Return
                </button>
            </Link>
        </div>
    );
}
