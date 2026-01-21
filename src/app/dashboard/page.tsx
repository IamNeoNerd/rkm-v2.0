
"use client";

import { startNewSession } from "@/actions/session";
import { useState } from "react";

export default function DashboardPage() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleReset = async () => {
        if (!confirm("Are you sure? This will reset all batches and discounts for the new year.")) return;
        setLoading(true);
        const res = await startNewSession();
        setLoading(false);
        if (res.success) setMsg(res.message || "Done");
        else setMsg("Error");
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-xl shadow border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-red-600">Session Management</h2>
                    <p className="text-slate-600 mb-4">Dangerous actions for academic year transition.</p>
                    <button
                        onClick={handleReset}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        Start New Session (April Reset)
                    </button>
                    {msg && <p className="mt-2 text-sm">{msg}</p>}
                </div>

                <div className="p-6 bg-white rounded-xl shadow border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-indigo-600">Quick Links</h2>
                    <ul className="space-y-2">
                        <li><a href="/admission" className="text-indigo-600 hover:underline">New Admission</a></li>
                        {/* More links would go here */}
                    </ul>
                </div>
            </div>
        </div>
    );
}
