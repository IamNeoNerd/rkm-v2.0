"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Wallet,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { getPendingDues, getMonthlyCollectionSummary } from "@/actions/reports";
import Link from "next/link";

export function SummaryCards() {
    const [stats, setStats] = useState({
        totalOutstanding: 0,
        pendingFamilies: 0,
        monthlyCollection: 0,
        collectionCount: 0,
        loading: true
    });

    useEffect(() => {
        async function loadStats() {
            try {
                const dues = await getPendingDues();
                const collections = await getMonthlyCollectionSummary();
                setStats({
                    totalOutstanding: dues.totalOutstanding,
                    pendingFamilies: dues.familyCount,
                    monthlyCollection: collections.total,
                    collectionCount: collections.count,
                    loading: false
                });
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
                setStats(prev => ({ ...prev, loading: false }));
            }
        }
        loadStats();
    }, []);

    if (stats.loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {[1, 2].map(i => (
                    <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Link href="/reports/dues" className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
                <Card className="border-none shadow-sm bg-gradient-to-br from-rose-50 to-white overflow-hidden relative group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-rose-600">Total Pending Dues</CardTitle>
                        <div className="p-2 bg-rose-100 rounded-lg text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">₹{stats.totalOutstanding.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span className="font-semibold text-rose-600">{stats.pendingFamilies} families</span> with outstanding balance
                        </p>
                        <ArrowUpRight className="absolute bottom-2 right-2 h-8 w-8 text-rose-100 opacity-50" />
                    </CardContent>
                </Card>
            </Link>

            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white overflow-hidden relative group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-indigo-600">Monthly Collection</CardTitle>
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">₹{stats.monthlyCollection.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span className="font-semibold text-indigo-600">{stats.collectionCount} transactions</span> this month
                    </p>
                    <ArrowDownRight className="absolute bottom-2 right-2 h-8 w-8 text-indigo-100 opacity-50" />
                </CardContent>
            </Card>
        </div>
    );
}
