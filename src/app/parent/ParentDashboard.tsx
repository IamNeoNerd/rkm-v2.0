"use client";

import { useState } from "react";
import { Users, CreditCard, Calendar, Receipt, ChevronRight, Wallet, X, GraduationCap, Activity, Sparkles } from "lucide-react";
import { Button } from "@/components/modern/Button";
import { GlassCard } from "@/components/modern/Card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StudentDetails } from "@/components/parent/StudentDetails";
import { ReceiptModal } from "../../components/ReceiptModal";
import { signOut } from "next-auth/react";

type Family = {
    id: number;
    fatherName: string;
    phone: string;
    balance: number;
};

type Child = {
    id: number;
    name: string;
    class: string;
    isActive: boolean;
};

type Transaction = {
    id: number;
    type: "CREDIT" | "DEBIT";
    amount: number;
    description: string | null;
    createdAt: Date;
    receiptNumber: string | null;
    paymentMode: string | null;
};

interface ParentDashboardProps {
    family: Family;
    students: Child[];
    transactions: Transaction[];
}

export function ParentDashboard({ family, students, transactions }: ParentDashboardProps) {
    const [selectedStudent, setSelectedStudent] = useState<Child | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<{
        receiptNumber: string;
        date: Date;
        familyName: string;
        familyPhone: string;
        familyId: number;
        amount: number;
        paymentMode: string;
        newBalance: number;
        transactionId: number;
    } | null>(null);

    const handleChildClick = (child: Child) => {
        setSelectedStudent(child);
        setDetailsOpen(true);
    };

    const handleReceiptClick = (txn: Transaction) => {
        if (txn.type === 'CREDIT') {
            setSelectedReceipt({
                receiptNumber: txn.receiptNumber || `PAY-${txn.id}`,
                date: txn.createdAt,
                familyName: family.fatherName,
                familyPhone: family.phone,
                familyId: family.id,
                amount: txn.amount,
                paymentMode: txn.paymentMode || 'CASH',
                newBalance: family.balance,
                transactionId: txn.id
            });
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-4 md:p-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/50">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">
                        Guardian Console
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-50 text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 font-mono">
                            <Activity className="h-3 w-3" />
                            SYNC_ID: {family.id}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operator: {family.fatherName}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50"
                >
                    <X className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </div>

            {/* Neural Balance Telemetry & Performance Sync */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard
                    className={cn(
                        "p-8 md:col-span-2 border-white/60 shadow-2xl overflow-hidden relative group transition-all duration-500 hover:scale-[1.01]",
                        family.balance < 0 ? "border-red-500/20 shadow-red-500/5" : "border-emerald-500/20 shadow-emerald-500/5"
                    )}
                    intensity="high"
                >
                    <div className={cn(
                        "absolute top-0 right-0 w-48 h-48 blur-[60px] rounded-full -mr-24 -mt-24 transition-opacity duration-1000",
                        family.balance < 0 ? "bg-red-500/10" : "bg-emerald-500/10"
                    )} />

                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transform group-hover:rotate-12 transition-transform duration-500",
                                family.balance < 0 ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                            )}>
                                <Wallet className="h-8 w-8" />
                            </div>
                            <div>
                                <p className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.3em] mb-1",
                                    family.balance < 0 ? "text-red-600" : "text-emerald-700"
                                )}>
                                    {family.balance < 0 ? 'Protocol Overdue' : 'Account Balance'}
                                </p>
                                <h2 className="text-5xl font-black tracking-tighter leading-none font-mono text-slate-900">
                                    ₹{Math.abs(family.balance)}
                                </h2>
                            </div>
                        </div>
                        {family.balance < 0 && (
                            <div className="text-center sm:text-right space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100">
                                    <Sparkles className="h-3 w-3" /> Attention Required
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Please visit terminal office</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Performance Analytics Node */}
                {(() => {
                    const syncScore = family.balance >= 0 ? 100 : Math.max(10, 100 - Math.floor(Math.abs(family.balance) / 100));
                    const dashOffset = 251 * (1 - syncScore / 100);

                    return (
                        <GlassCard className="p-8 border-white/60 shadow-xl flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-500/20 transition-all duration-500 hover:scale-[1.01]" intensity="medium">
                            <div className="relative w-24 h-24">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={251} strokeDashoffset={dashOffset} className={cn("transition-all duration-1000", syncScore > 50 ? "text-indigo-500" : "text-amber-500")} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-black text-slate-900 tracking-tighter italic font-mono">{syncScore}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guardian Sync Score</p>
                                <p className={cn("text-[9px] font-bold uppercase tracking-tighter mt-1 italic", syncScore > 50 ? "text-indigo-600" : "text-amber-600")}>
                                    {syncScore === 100 ? "Optimal Connection" : syncScore > 50 ? "Standard Sync" : "Low Connectivity"}
                                </p>
                            </div>
                        </GlassCard>
                    );
                })()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10">
                {/* Entity Matrix (Children Section) */}
                <section className="space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                        <Users className="h-3 w-3" /> Entity Matrix ({students.length})
                    </h3>

                    {students.length === 0 ? (
                        <GlassCard className="p-12 text-center border-slate-100" intensity="low">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No entities identified under this node.</p>
                        </GlassCard>
                    ) : (
                        <div className="grid gap-4">
                            {students.map((child) => (
                                <button
                                    key={child.id}
                                    onClick={() => handleChildClick(child)}
                                    className="group text-left block w-full outline-none transform transition-all duration-500 hover:scale-[1.02]"
                                >
                                    <GlassCard
                                        className={cn(
                                            "p-6 h-full border-white/60 shadow-xl group-hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden",
                                            child.isActive ? "border-indigo-100" : "opacity-60"
                                        )}
                                        intensity="medium"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                                        <div className="flex items-center justify-between relative">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                        <GraduationCap className="h-7 w-7 text-slate-300 group-hover:text-indigo-500" />
                                                    </div>
                                                    {child.isActive && (
                                                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-slate-900 tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors">{child.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CLASS_NODE:</p>
                                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-50/50">{child.class}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden sm:block text-right">
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Node Verified</p>
                                                    <p className="text-[10px] font-mono font-bold text-slate-400">#{child.id.toString().padStart(4, '0')}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    <ChevronRight className="h-6 w-6 text-indigo-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Neural Transaction Vault (Payment History) */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                            <Receipt className="h-3 w-3" /> Digital Receipt Vault
                        </h3>
                        {transactions.length > 0 && (
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">
                                Last Sync: {format(new Date(transactions[0].createdAt), "HH:mm")}
                            </p>
                        )}
                    </div>

                    {transactions.length === 0 ? (
                        <GlassCard className="p-12 text-center border-slate-100" intensity="low">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Log database empty.</p>
                        </GlassCard>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((txn) => (
                                <button
                                    key={txn.id}
                                    onClick={() => handleReceiptClick(txn)}
                                    className={cn(
                                        "w-full text-left outline-none",
                                        txn.type === 'CREDIT' ? "cursor-pointer group" : "cursor-default opacity-60"
                                    )}
                                >
                                    <GlassCard className="p-4 border-white/40 shadow-sm group-hover:shadow-md group-hover:border-emerald-200/50 transition-all" intensity="low">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                                    txn.type === 'CREDIT' ? "bg-emerald-50 text-emerald-600 shadow-sm" : "bg-red-50 text-red-600"
                                                )}>
                                                    <CreditCard className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                                                        {txn.type === 'CREDIT' ? 'Fee Settlement' : 'Balance Adjust'}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(txn.createdAt), "MMM dd, yyyy")}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn(
                                                    "text-lg font-black tracking-tighter font-mono",
                                                    txn.type === 'CREDIT' ? "text-emerald-700" : "text-red-700"
                                                )}>
                                                    {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
                                                </p>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono group-hover:text-emerald-600 transition-colors">
                                                        {txn.receiptNumber || 'TXN-IDENTIFIED'}
                                                    </p>
                                                    {txn.type === 'CREDIT' && <Receipt className="h-2.5 w-2.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Entity Metadata Terminal (Student Details) */}
            <StudentDetails
                student={selectedStudent}
                isOpen={detailsOpen}
                onClose={() => setDetailsOpen(false)}
            />

            {/* Neural Receipt Fragment (Receipt Modal) */}
            {selectedReceipt && (
                <ReceiptModal
                    receipt={selectedReceipt}
                    onClose={() => setSelectedReceipt(null)}
                />
            )}
        </div>
    );
}
