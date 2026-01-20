import { db } from "@/db";
import { transactions, families, students } from "@/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import {
    IndianRupee,
    UserPlus,
    Calendar,
    TrendingUp,
    Users,
    Receipt
} from "lucide-react";
import Link from "next/link";

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
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center py-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Cashier Dashboard
                </h1>
                <p className="text-slate-400">
                    {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 text-center">
                    <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-emerald-400">
                        ₹{todayTotal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-slate-400 text-sm">Today&apos;s Collection</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 text-center">
                    <Users className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                        {Number(familyCount[0]?.count || 0)}
                    </div>
                    <div className="text-slate-400 text-sm">Families</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 text-center">
                    <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                        {Number(studentCount[0]?.count || 0)}
                    </div>
                    <div className="text-slate-400 text-sm">Active Students</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 text-center">
                    <Calendar className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                        {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-slate-400 text-sm">Today</div>
                </div>
            </div>

            {/* Quick Actions */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <Link
                        href="/cashier/fees"
                        className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl p-6 hover:bg-emerald-600/30 transition-colors group"
                    >
                        <IndianRupee className="h-8 w-8 text-emerald-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400">
                            Collect Fee
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Search family and record payment
                        </p>
                    </Link>
                    <Link
                        href="/cashier/admission"
                        className="bg-amber-600/20 border border-amber-500/30 rounded-xl p-6 hover:bg-amber-600/30 transition-colors group"
                    >
                        <UserPlus className="h-8 w-8 text-amber-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white group-hover:text-amber-400">
                            New Admission
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            Register new student to the institute
                        </p>
                    </Link>
                </div>
            </section>

            {/* Recent Transactions */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-amber-400" />
                    Recent Fee Collections
                </h2>

                {recentTransactions.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                        <Receipt className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No recent transactions</p>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Receipt #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Time</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3 text-slate-300">
                                            {tx.receiptNumber || `TXN-${tx.id}`}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-sm">
                                            {tx.createdAt?.toLocaleTimeString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                                            +₹{tx.amount.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
