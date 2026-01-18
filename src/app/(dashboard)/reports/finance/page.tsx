"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
    BarChart3
} from "lucide-react";
import { toast } from "sonner";
import {
    getProfitLossSummary,
    getBatchWiseRevenue,
    getStaffSalaryReport,
    getExpenseReport,
    getFinancialDashboardStats
} from "@/actions/finance";

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
            <div className="p-6 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-7 w-7 text-blue-600" />
                        Financial Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">Overview of revenue, expenses, and profitability</p>
                </div>
                <Button variant="outline" onClick={loadData} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-gray-900">
                        {formatCurrency(quickStats?.monthlyCollections || 0)}
                    </p>
                    <p className="text-sm text-gray-500">This Month Collections</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Wallet className="h-5 w-5 text-blue-600" />
                        </div>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-gray-900">
                        {formatCurrency(quickStats?.ytdCollections || 0)}
                    </p>
                    <p className="text-sm text-gray-500">Year-to-Date Revenue</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <CreditCard className="h-5 w-5 text-red-600" />
                        </div>
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-gray-900">
                        {formatCurrency(quickStats?.totalOutstandingDues || 0)}
                    </p>
                    <p className="text-sm text-gray-500">Outstanding Dues ({quickStats?.familiesWithDue || 0} families)</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Users className="h-5 w-5 text-orange-600" />
                        </div>
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-gray-900">
                        {formatCurrency(quickStats?.monthlyExpenses || 0)}
                    </p>
                    <p className="text-sm text-gray-500">This Month Expenses</p>
                </div>
            </div>

            {/* P&L Summary */}
            {plSummary && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        Profit & Loss Summary
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-700">
                                {formatCurrency(plSummary.totalRevenue)}
                            </p>
                            <p className="text-sm text-green-600">Total Revenue</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-700">
                                {formatCurrency(plSummary.totalSalary)}
                            </p>
                            <p className="text-sm text-orange-600">Salary Expense</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-700">
                                {formatCurrency(plSummary.totalOtherExpenses)}
                            </p>
                            <p className="text-sm text-red-600">Other Expenses</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-700">
                                {formatCurrency(plSummary.totalExpenses)}
                            </p>
                            <p className="text-sm text-gray-600">Total Expenses</p>
                        </div>
                        <div className={`text-center p-4 rounded-lg ${plSummary.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            <p className={`text-2xl font-bold ${plSummary.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                {formatCurrency(plSummary.netProfit)}
                            </p>
                            <p className={`text-sm ${plSummary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                Net Profit ({plSummary.profitMargin}%)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly Breakdown */}
            {monthlyData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        Monthly Breakdown
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-2 font-medium text-gray-500">Period</th>
                                    <th className="text-right py-3 px-2 font-medium text-gray-500">Revenue</th>
                                    <th className="text-right py-3 px-2 font-medium text-gray-500">Salary</th>
                                    <th className="text-right py-3 px-2 font-medium text-gray-500">Other Exp.</th>
                                    <th className="text-right py-3 px-2 font-medium text-gray-500">Net Profit</th>
                                    <th className="text-right py-3 px-2 font-medium text-gray-500">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyData.map((month, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-2 font-medium">{month.period}</td>
                                        <td className="text-right py-3 px-2 text-green-600">{formatCurrency(month.revenue)}</td>
                                        <td className="text-right py-3 px-2 text-orange-600">{formatCurrency(month.salaryExpense)}</td>
                                        <td className="text-right py-3 px-2 text-red-600">{formatCurrency(month.otherExpenses)}</td>
                                        <td className={`text-right py-3 px-2 font-medium ${month.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatCurrency(month.netProfit)}
                                        </td>
                                        <td className={`text-right py-3 px-2 ${month.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {month.profitMargin}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Batch Revenue */}
            {batchRevenue.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Batch-wise Revenue
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {batchRevenue.slice(0, 6).map((batch) => (
                            <div key={batch.batchId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{batch.batchName}</h3>
                                        <p className="text-sm text-gray-500">{batch.teacherName || 'No teacher assigned'}</p>
                                    </div>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                        {batch.activeEnrollments} students
                                    </span>
                                </div>
                                <div className="mt-3 flex justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">Fee</p>
                                        <p className="font-medium">{formatCurrency(batch.fee)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Monthly Revenue</p>
                                        <p className="font-medium text-green-600">{formatCurrency(batch.projectedMonthlyRevenue)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {batchRevenue.length > 6 && (
                        <p className="text-sm text-gray-500 mt-4 text-center">
                            Showing 6 of {batchRevenue.length} batches
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
