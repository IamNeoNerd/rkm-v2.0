import { getUsers } from "@/actions/users";
import { UsersTable } from "@/components/UsersTable";
import { ShieldCheck, AlertCircle, Fingerprint } from "lucide-react";
import { GlassCard } from "@/components/modern/Card";

export default async function UsersPage() {
    const result = await getUsers();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Hub */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3 font-satoshi">
                        Identity Control
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Administrative Hierarchies & Neural Access Matrix
                    </p>
                </div>
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Access Tier: Super-Admin</span>
                </div>
            </div>

            {!result.success ? (
                <GlassCard className="p-10 border-red-500/20 bg-red-50/10" intensity="low">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-red-900 uppercase tracking-tight">Access Interrupted</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mt-1">{result.error || "Failed to load identity records"}</p>
                        </div>
                    </div>
                </GlassCard>
            ) : (
                <GlassCard className="overflow-hidden border-white/20" intensity="high">
                    <div className="p-8 border-b border-white/10 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Registered Entities</h3>
                        </div>
                    </div>
                    <div className="p-1">
                        <UsersTable initialUsers={result.users} />
                    </div>
                </GlassCard>
            )}
        </div>
    );
}

