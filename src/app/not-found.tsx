import { Search, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-8">
                <Search className="h-10 w-10 text-indigo-600" />
            </div>

            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">
                Missing <span className="text-indigo-600">Endpoint</span>
            </h1>

            <p className="text-sm font-medium text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                The requested resource node could not be located in the current RKM index.
                Please verify the URL or return to base.
            </p>

            <Link href="/">
                <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs italic hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Dashboard Return
                </button>
            </Link>
        </div>
    );
}
