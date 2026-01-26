import { db } from "@/db";
import { transactions, families, students } from "@/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import {
    IndianRupee,
    UserPlus,
    Calendar,
    TrendingUp,
    Users,
    Receipt,
    ArrowUpRight,
    Activity,
    Smartphone,
    CreditCard
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/modern/Card";
import { cn } from "@/lib/utils";

export default async function CashierDashboard() {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's collections
    const todayCollections = await db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(transactions)
        .where(and(
            eq(transactions.type, "CREDIT"),
            eq(transactions.category, "FEE"),
            gte(transactions.createdAt, today)
        ));

    // Get recent transactions
    const recentTransactions = await db
        .select({
            id: transactions.id,
            type: transactions.type,
            amount: transactions.amount,
            receiptNumber: transactions.receiptNumber,
            createdAt: transactions.createdAt,
            familyId: transactions.familyId,
        })
        .from(transactions)
        .where(eq(transactions.category, "FEE"))
        .orderBy(desc(transactions.createdAt))
        .limit(5);

    // Get total active families
    const familyCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(families);

    // Get total active students
    const studentCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(students)
        .where(eq(students.isActive, true));

    const todayTotal = Number(todayCollections[0]?.total || 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Intelligent Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200/50">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3 font-satoshi">
                        System Terminal
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                            <Activity className="h-3 w-3" />
                            Live Sync Active
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black shadow-sm">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active nodes</p>
                        <p className="text-xs font-bold text-slate-900">3 Operators Online</p>
                    </div>
                </div>
            </div>

            {/* Neural Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard className="p-6 relative overflow-hidden group shadow-amber-500/5 hover:shadow-amber-500/10 transition-all border-amber-500/20" intensity="high">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-20 w-20 text-amber-600" />
                    </div>
                    <div className="relative space-y-4">
                        <div className="p-2 w-fit bg-amber-500/10 rounded-xl">
                            <IndianRupee className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-[0.2em]">Today&apos;s Yield</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mt-1">
                                ₹{todayTotal.toLocaleString('en-IN')}
                            </h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 relative overflow-hidden group border-indigo-500/20" intensity="medium">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-indigo-600">
                        <Users className="h-20 w-20" />
                    </div>
                    <div className="relative space-y-4">
                        <div className="p-2 w-fit bg-indigo-500/10 rounded-xl">
                            <Smartphone className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-700/60 uppercase tracking-[0.2em]">Family Matrix</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mt-1">
                                {Number(familyCount[0]?.count || 0)}
                            </h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 relative overflow-hidden group border-emerald-500/20" intensity="medium">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-emerald-600">
                        <GraduationCap className="h-20 w-20 " />
                    </div>
                    <div className="relative space-y-4">
                        <div className="p-2 w-fit bg-emerald-500/10 rounded-xl">
                            <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-700/60 uppercase tracking-[0.2em]">Active Students</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mt-1">
                                {Number(studentCount[0]?.count || 0)}
                            </h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 relative overflow-hidden group border-slate-500/20" intensity="medium">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-slate-600">
                        <Calendar className="h-20 w-20 " />
                    </div>
                    <div className="relative space-y-4">
                        <div className="p-2 w-fit bg-slate-500/10 rounded-xl">
                            <Activity className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-700/60 uppercase tracking-[0.2em]">Operational Date</p>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mt-2 uppercase">
                                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Tactical Access Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                        <ArrowUpRight className="h-3 w-3" /> Quick Execution
                    </h2>
                    <div className="space-y-4">
                        <Link href="/cashier/fees">
                            <GlassCard className="p-6 group border-l-4 border-l-amber-500 hover:bg-amber-500/5 transition-all mb-4" intensity="high">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                                        <CreditCard className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Collect Revenue</h3>
                                <p className="text-[11px] text-slate-400 mt-1 font-medium italic">Execute fee collection protocol</p>
                            </GlassCard>
                        </Link>
                        <Link href="/cashier/admission">
                            <GlassCard className="p-6 group border-l-4 border-l-indigo-500 hover:bg-indigo-500/5 transition-all" intensity="high">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                                        <UserPlus className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">New Enrollment</h3>
                                <p className="text-[11px] text-slate-400 mt-1 font-medium italic">Initialize student boarding matrix</p>
                            </GlassCard>
                        </Link>
                    </div>
                </div>

                {/* Audit Log / Recent Collections */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                        <Receipt className="h-3 w-3" /> Neural Transaction History
                    </h2>

                    <GlassCard className="overflow-hidden border-white/40 shadow-2xl" intensity="medium">
                        {recentTransactions.length === 0 ? (
                            <div className="p-16 text-center space-y-4">
                                <Activity className="h-12 w-12 text-slate-200 mx-auto" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No neural data streams detected</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-white/20">
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt Identity</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Point</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantum Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {recentTransactions.map((tx: { id: number; receiptNumber?: string | null; createdAt: Date | null; amount: number }) => (
                                            <tr key={tx.id} className="group hover:bg-white/40 transition-all duration-300">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                                            <Receipt className="h-4 w-4 text-amber-600" />
                                                        </div>
                                                        <span className="text-xs font-black text-slate-700 tracking-wider">
                                                            {tx.receiptNumber || `TXN-${tx.id}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-600 tracking-tight">
                                                            {tx.createdAt?.toLocaleTimeString('en-IN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Verified node</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                        +₹{tx.amount.toLocaleString('en-IN')}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="p-4 bg-slate-50/50 text-center border-t border-white/20">
                            <Link href="/reports/transactions" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors">
                                Access Full Transaction Matrix
                            </Link>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

function GraduationCap(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    )
}
