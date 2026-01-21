"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/modern/Button";
import { GlassCard } from "@/components/modern/Card";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    CreditCard,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import {
    getProfitLossSummary,
    getBatchWiseRevenue,
    getFinancialDashboardStats
} from "@/actions/finance";
import { cn } from "@/lib/utils";

interface PLSummary {
    totalRevenue: number;
    totalSalary: number;
    totalOtherExpenses: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
}

interface MonthlyData {
    period: string;
    revenue: number;
    salaryExpense: number;
    otherExpenses: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
}

interface BatchRevenue {
    batchId: number;
    batchName: string;
    teacherName: string | null;
    fee: number;
    activeEnrollments: number;
    projectedMonthlyRevenue: number;
}

interface QuickStats {
    monthlyCollections: number;
    monthlyTransactionCount: number;
    ytdCollections: number;
    totalOutstandingDues: number;
    familiesWithDue: number;
    monthlyExpenses: number;
}

export default function FinancialDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [plSummary, setPLSummary] = useState<PLSummary | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [batchRevenue, setBatchRevenue] = useState<BatchRevenue[]>([]);
    const [quickStats, setQuickStats] = useState<QuickStats | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [plResult, batchResult, statsResult] = await Promise.all([
                getProfitLossSummary(),
                getBatchWiseRevenue(),
                getFinancialDashboardStats(),
            ]);

            if (plResult.success && plResult.summary) {
                setPLSummary(plResult.summary);
                if (plResult.monthlyBreakdown) {
                    setMonthlyData(plResult.monthlyBreakdown);
                }
            }

            if (batchResult.success && batchResult.batches) {
                setBatchRevenue(batchResult.batches);
            }

            if (statsResult.success && statsResult.stats) {
                setQuickStats(statsResult.stats);
            }
        } catch (error) {
            toast.error("Failed to load financial data");
        } finally {
            setLoading(false);
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="h-12 bg-slate-200 rounded-2xl w-1/3 opacity-50" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 bg-slate-100 rounded-3xl" />
                    ))}
                </div>
                <div className="h-96 bg-slate-100 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3">
                        Financial Intelligence
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Institutional Revenue & Profitability Matrix
                    </p>
                </div>
                <Button
                    variant="glass"
                    onClick={loadData}
                    className="group gap-2 text-[10px] font-black uppercase tracking-widest border-white/40"
                >
                    <RefreshCw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
                    Neural Sync
                </Button>
            </div>

            {/* Tactical Briefing (Quick Stats) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Monthly Collections */}
                <GlassCard className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform" intensity="medium">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="h-16 w-16 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Monthly Yield</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                        {formatCurrency(quickStats?.monthlyCollections || 0)}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-emerald-600">
                        <ArrowUpRight className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase">Active Stream</span>
                    </div>
                </GlassCard>

                {/* YTD Revenue */}
                <GlassCard className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform" intensity="medium">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="h-16 w-16 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Wallet className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Annual Velocity</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                        {formatCurrency(quickStats?.ytdCollections || 0)}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-blue-600">
                        <ShieldCheck className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase">Verified Totals</span>
                    </div>
                </GlassCard>

                {/* Outstanding Dues */}
                <GlassCard className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform" intensity="medium">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingDown className="h-16 w-16 text-red-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                            <CreditCard className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Risk Exposure</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                        {formatCurrency(quickStats?.totalOutstandingDues || 0)}
                    </p>
                    <div className="mt-2 text-[10px] font-black uppercase text-red-600/70">
                        {quickStats?.familiesWithDue || 0} Entities with arrears
                    </div>
                </GlassCard>

                {/* Monthly Expenses */}
                <GlassCard className="p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform" intensity="medium">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <PieChart className="h-16 w-16 text-orange-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                            <Users className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operating Cost</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                        {formatCurrency(quickStats?.monthlyExpenses || 0)}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-orange-600">
                        <ArrowDownRight className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase">Current Outflow</span>
                    </div>
                </GlassCard>
            </div>

            {/* Strategic Summary (P&L) */}
            {plSummary && (
                <GlassCard className="p-10 relative overflow-hidden" intensity="high">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                <BarChart3 className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Net Analysis</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Profit & Loss Vector</p>
                            </div>
                        </div>

                        <div className={cn(
                            "px-8 py-5 rounded-3xl border flex flex-col items-center justify-center",
                            plSummary.netProfit >= 0
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                : "bg-red-500/5 border-red-500/20 text-red-700 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                        )}>
                            <p className="text-4xl font-black tracking-tighter leading-none mb-1">
                                {formatCurrency(plSummary.netProfit)}
                            </p>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                                Net Surplus ({plSummary.profitMargin}%)
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="p-6 bg-white/40 rounded-3xl border border-white/20 transition-all hover:bg-white/60">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Inflow</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">{formatCurrency(plSummary.totalRevenue)}</p>
                        </div>
                        <div className="p-6 bg-white/40 rounded-3xl border border-white/20 transition-all hover:bg-white/60">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Personnel Cost</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">{formatCurrency(plSummary.totalSalary)}</p>
                        </div>
                        <div className="p-6 bg-white/40 rounded-3xl border border-white/20 transition-all hover:bg-white/60">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ops Overhead</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">{formatCurrency(plSummary.totalOtherExpenses)}</p>
                        </div>
                        <div className="p-6 bg-white/40 rounded-3xl border border-white/20 transition-all hover:bg-white/60">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Liability</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">{formatCurrency(plSummary.totalExpenses)}</p>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Performance Ledger (Monthly Breakdown) */}
            {monthlyData.length > 0 && (
                <GlassCard className="p-0 overflow-hidden" intensity="medium">
                    <div className="p-8 border-b border-white/20 bg-white/40 flex items-center gap-4">
                        <div className="p-3 bg-slate-900/5 rounded-xl border border-slate-900/10">
                            <Calendar className="h-5 w-5 text-slate-900" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Temporal Performance</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Historical financial synchronization</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <th className="px-8 py-5 text-left border-b border-white/20 tracking-[0.2em]">Accounting Period</th>
                                    <th className="px-8 py-5 text-right border-b border-white/20 tracking-[0.2em]">Inflow</th>
                                    <th className="px-8 py-5 text-right border-b border-white/20 tracking-[0.2em]">Personnel</th>
                                    <th className="px-8 py-5 text-right border-b border-white/20 tracking-[0.2em]">Overheads</th>
                                    <th className="px-8 py-5 text-right border-b border-white/20 tracking-[0.2em]">Net Surplus</th>
                                    <th className="px-8 py-5 text-right border-b border-white/20 tracking-[0.2em]">Efficiency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {monthlyData.map((month, idx) => (
                                    <tr key={idx} className="group hover:bg-white/40 transition-colors duration-200">
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{month.period}</div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-sm font-bold text-emerald-600">{formatCurrency(month.revenue)}</div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-sm font-medium text-slate-600">{formatCurrency(month.salaryExpense)}</div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-sm font-medium text-slate-600">{formatCurrency(month.otherExpenses)}</div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className={cn(
                                                "text-sm font-black tracking-tight",
                                                month.netProfit >= 0 ? "text-emerald-700 font-black" : "text-red-600"
                                            )}>
                                                {formatCurrency(month.netProfit)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className={cn(
                                                "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                month.profitMargin >= 0
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-600 border-red-500/20"
                                            )}>
                                                {month.profitMargin}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}

            {/* Neural Batch Metrics */}
            {batchRevenue.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Batch Revenue Grid</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Operational Unit Intelligence</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {batchRevenue.slice(0, 9).map((batch) => (
                            <GlassCard key={batch.batchId} className="p-6 group hover:translate-y-[-4px] transition-all" intensity="low">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider mb-1">{batch.batchName}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{batch.teacherName || 'Awaiting Facilitator'}</p>
                                    </div>
                                    <div className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black border border-primary/20 uppercase tracking-widest">
                                        {batch.activeEnrollments} Co-Horts
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Unit Fee</p>
                                        <p className="text-sm font-bold text-slate-700">{formatCurrency(batch.fee)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Projected Yield</p>
                                        <p className="text-sm font-black text-emerald-600">{formatCurrency(batch.projectedMonthlyRevenue)}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                    {batchRevenue.length > 9 && (
                        <div className="text-center py-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                Full Operational Matrix (Showing 9 of {batchRevenue.length} Batches)
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
