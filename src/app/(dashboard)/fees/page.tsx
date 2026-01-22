"use client"

import { useState, useEffect, useCallback } from "react";
import { Receipt, Search, DollarSign, Clock, User, CreditCard, Wallet, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { GlassCard } from "@/components/modern/Card";
import { calculateTotalDue, processPayment, getRecentTransactions, searchFamilies } from "@/actions/billing";
import { format } from "date-fns";
import { ReceiptModal } from "@/components/ReceiptModal";
import { cn } from "@/lib/utils";

type ReceiptData = {
    receiptNumber: string;
    date: Date;
    familyName: string;
    familyId: number;
    amount: number;
    paymentMode: string;
    newBalance: number;
};

type Transaction = {
    id: number;
    type: string;
    category: string;
    amount: number;
    description: string | null;
    createdAt: Date;
    familyId: number;
    fatherName: string | null;
    phone: string | null;
};

type FamilyResult = {
    id: number;
    fatherName: string;
    phone: string;
    balance: number;
    matchedBy?: string;
    studentName?: string;
};

export default function FeesPage() {
    const [familyId, setFamilyId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<FamilyResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<FamilyResult | null>(null);
    const [totalDue, setTotalDue] = useState<number | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI">("CASH");
    const [message, setMessage] = useState("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

    // Debounced search
    useEffect(() => {
        if (searchQuery.length < 2) return;

        const timer = setTimeout(async () => {
            setIsSearching(true);
            const result = await searchFamilies(searchQuery);
            setSearchResults(result.families || []);
            setShowResults(true);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectFamily = (family: FamilyResult) => {
        setSelectedFamily(family);
        setFamilyId(family.id.toString());
        setSearchQuery(family.fatherName);
        setShowResults(false);
        handleSearchFamily(family.id.toString());
    };

    const handleSearchFamily = async (id?: string) => {
        const searchId = id || familyId;
        if (!searchId) {
            setMessage("✗ Please enter or select a family");
            return;
        }

        const due = await calculateTotalDue(searchId);
        setTotalDue(due);
        setMessage(`✓ Total due calculated: ₹${due.toLocaleString()}`);
        setPaymentAmount(due.toString());
    };

    const handleCollectPayment = async () => {
        if (!familyId || !paymentAmount) {
            setMessage("✗ Please enter Family ID and Payment Amount");
            return;
        }

        setIsProcessing(true);
        const result = await processPayment({
            familyId,
            amount: parseFloat(paymentAmount),
            mode: paymentMode,
        });

        if ("success" in result && result.success) {
            setMessage(`✓ Payment collected successfully! New Balance: ₹${result.newBalance.toLocaleString()}`);

            setReceiptData({
                receiptNumber: result.receiptNumber || 'N/A',
                date: new Date(),
                familyName: selectedFamily?.fatherName || 'Unknown',
                familyId: parseInt(familyId),
                amount: parseFloat(paymentAmount),
                paymentMode: paymentMode,
                newBalance: result.newBalance,
            });
            setShowReceipt(true);

            setPaymentAmount("");
            setTotalDue(null);
            setSelectedFamily(null);
            setSearchQuery("");
            setFamilyId("");
            loadTransactions();
        } else if ("error" in result) {
            setMessage(`✗ ${result.error || "Failed to process payment"}`);
        } else {
            setMessage("✗ Failed to process payment");
        }
        setIsProcessing(false);
    };

    const loadTransactions = useCallback(async () => {
        setLoadingTransactions(true);
        const result = await getRecentTransactions({ limit: 20 });
        if (result.transactions) {
            setTransactions(result.transactions as Transaction[]);
        }
        setLoadingTransactions(false);
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3">
                        Fee Collection
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Financial Operations & Revenue Stream
                    </p>
                </div>

                {message && (
                    <div className={cn(
                        "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border animate-in zoom-in duration-300",
                        message.startsWith("✓")
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "bg-red-500/10 text-red-600 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    )}>
                        <div className="flex items-center gap-2">
                            {message.startsWith("✓") ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {message.replace(/^[✓✗]\s*/, '')}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Search Family & Calculate Due */}
                <GlassCard className="p-10 relative overflow-hidden" intensity="high">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                            <Search className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identify Family</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account lookup</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="relative">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                Search Parameters (Name/Phone/Student)
                            </label>
                            <Input
                                type="text"
                                placeholder="Start typing identification..."
                                value={searchQuery}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchQuery(val);
                                    if (val.length < 2) setSearchResults([]);
                                    setSelectedFamily(null);
                                }}
                                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                                className="h-14 text-base font-bold"
                            />

                            {/* Search Results Dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <GlassCard className="absolute z-50 w-full mt-2 p-2 border-white/20 shadow-2xl overflow-hidden" intensity="high">
                                    <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar">
                                        {searchResults.map((family) => (
                                            <button
                                                key={family.id}
                                                onClick={() => handleSelectFamily(family)}
                                                className="w-full px-4 py-4 text-left hover:bg-white/40 rounded-xl transition-all border border-transparent hover:border-white/30 group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <span className="font-black text-slate-900 uppercase text-xs tracking-wider">{family.fatherName}</span>
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">ID: #{family.id} • {family.phone}</div>
                                                        </div>
                                                    </div>
                                                    {family.balance < 0 && (
                                                        <div className="px-2 py-1 bg-red-500/10 text-red-600 rounded-lg text-[10px] font-black border border-red-500/20">
                                                            DUE: ₹{Math.abs(family.balance).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                                {family.matchedBy === 'student' && (
                                                    <div className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400 inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-md">
                                                        <span className="w-1 h-1 rounded-full bg-primary" />
                                                        Student Match: {family.studentName}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </GlassCard>
                            )}

                            {isSearching && (
                                <p className="absolute right-4 top-[50px] text-[9px] font-black text-primary uppercase animate-pulse">Scanning...</p>
                            )}
                        </div>

                        {selectedFamily && (
                            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Verified Profile</p>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedFamily.fatherName}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setSelectedFamily(null); setSearchQuery(""); setFamilyId(""); }} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                    <RefreshCw className="h-4 w-4 text-slate-400" />
                                </button>
                            </div>
                        )}

                        <Button
                            onClick={() => handleSearchFamily()}
                            variant="glass"
                            className="w-full h-14 text-[12px] font-black uppercase tracking-[0.2em] gap-2 border-white/40"
                            disabled={!familyId}
                        >
                            <Receipt className="h-4 w-4" />
                            Calculate Arrears
                        </Button>

                        {totalDue !== null && (
                            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <Wallet className="h-16 w-16 text-primary" />
                                </div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Total Outstanding Due</p>
                                <p className="text-5xl font-black text-slate-900 tracking-tighter">₹{totalDue.toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Collect Payment */}
                <GlassCard className="p-10 relative overflow-hidden" intensity="high">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Transaction Sync</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Finalize collection</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                Ledger Entry Amount (₹)
                            </label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="h-14 text-2xl font-black text-emerald-600 bg-emerald-500/[0.02] border-emerald-500/10"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 ml-1">
                                Settlement Channel
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMode("CASH")}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 gap-2",
                                        paymentMode === "CASH"
                                            ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20 scale-[1.02]"
                                            : "bg-white/50 text-slate-400 border-white/20 hover:border-slate-300"
                                    )}
                                >
                                    <Wallet className="h-6 w-6" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Physical Cash</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMode("UPI")}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 gap-2",
                                        paymentMode === "UPI"
                                            ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]"
                                            : "bg-white/50 text-slate-400 border-white/20 hover:border-primary/30"
                                    )}
                                >
                                    <CreditCard className="h-6 w-6" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Digital UPI</span>
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handleCollectPayment}
                            disabled={isProcessing || !familyId}
                            variant="primary"
                            className="w-full h-16 text-[14px] font-black uppercase tracking-[0.3em] gap-3 shadow-2xl group"
                        >
                            {isProcessing ? "Processing Vault..." : "Execute Payment"}
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </GlassCard>
            </div>

            {/* Recent Transactions */}
            <GlassCard className="p-0 overflow-hidden" intensity="medium">
                <div className="p-8 border-b border-white/20 bg-white/40 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900/5 rounded-xl border border-slate-900/10">
                            <Clock className="h-5 w-5 text-slate-900" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Audit Ledger</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Financial Activity</p>
                        </div>
                    </div>
                    <Button
                        onClick={loadTransactions}
                        variant="glass"
                        size="sm"
                        disabled={loadingTransactions}
                        className="text-[10px] font-black uppercase tracking-widest gap-2"
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", loadingTransactions && "animate-spin")} />
                        Synch Records
                    </Button>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-20 text-center opacity-30">
                        <Receipt className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-sm font-black uppercase tracking-widest">No Recent Settlements Detected</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <th className="px-8 py-5 text-left border-b border-white/20 uppercase tracking-[0.2em]">Timestamp</th>
                                    <th className="px-8 py-5 text-left border-b border-white/20 uppercase tracking-[0.2em]">Family Entity</th>
                                    <th className="px-8 py-5 text-left border-b border-white/20 uppercase tracking-[0.2em]">Sync Type</th>
                                    <th className="px-8 py-5 text-left border-b border-white/20 uppercase tracking-[0.2em]">Value (₹)</th>
                                    <th className="px-8 py-5 text-left border-b border-white/20 uppercase tracking-[0.2em]">Metadata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {transactions.map((txn) => (
                                    <tr key={txn.id} className="group hover:bg-white/40 transition-colors duration-200">
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-slate-600">
                                                {format(new Date(txn.createdAt), "MMM dd, yyyy")}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">
                                                {format(new Date(txn.createdAt), "HH:mm:ss")}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{txn.fatherName || "N/A"}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">ID: #{txn.familyId}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span
                                                className={cn(
                                                    "px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-widest border",
                                                    txn.type === "CREDIT"
                                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                        : "bg-red-500/10 text-red-600 border-red-500/20"
                                                )}
                                            >
                                                {txn.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "text-lg font-black tracking-tight",
                                                txn.type === "CREDIT" ? "text-emerald-600" : "text-red-600"
                                            )}>
                                                {txn.type === "CREDIT" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-xs font-medium text-slate-500 max-w-[200px] truncate">
                                                {txn.description || "System automatic ledger entry"}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>

            {/* Receipt Modal */}
            {showReceipt && receiptData && (
                <ReceiptModal
                    receipt={receiptData}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </div>
    );
}
