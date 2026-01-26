"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("APP_ERROR_NODE:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 min-h-[60vh] rounded-3xl border border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6">
                <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>

            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">
                Operational <span className="text-rose-500">Fault</span>
            </h2>

            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 max-w-xs mx-auto">
                An error occurred in this local node.
                The system remains stable but this specific view failed.
            </p>

            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:scale-105 transition-all flex items-center gap-2 mx-auto"
            >
                <RefreshCw className="h-3 w-3" />
                Retry Node
            </button>
        </div>
    );
}
