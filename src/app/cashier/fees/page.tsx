"use client";

import { useState } from "react";
import { IndianRupee, Users, Wallet, Loader2, ArrowRight, User, Phone, Activity, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { GlassCard } from "@/components/modern/Card";
import { toast } from "sonner";
import { lookupFamilyByPhone, collectFee } from "@/actions/cashier";
import { cn } from "@/lib/utils";

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

export default function CashierFeesPage() {
    const [phone, setPhone] = useState("");
    const [family, setFamily] = useState<Family | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(false);
    const [collecting, setCollecting] = useState(false);
    const [amount, setAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI">("CASH");

    async function handleSearch() {
        if (phone.length !== 10) {
            toast.error("Invalid mobile identifier (10 digits required)");
            return;
        }

        setLoading(true);
        const result = await lookupFamilyByPhone(phone);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
            setFamily(null);
            setChildren([]);
        } else if (result.family) {
            setFamily(result.family);
            setChildren(result.children || []);
            setAmount(result.family.balance < 0 ? Math.abs(result.family.balance).toString() : "");
            toast.success("Family Node Synchronized");
        }
    }

    async function handleCollect() {
        if (!family || !amount || parseInt(amount) <= 0) {
            toast.error("Valid quantum value required for collection");
            return;
        }

        setCollecting(true);
        const result = await collectFee({
            familyId: family.id,
            amount: parseInt(amount),
            paymentMode,
        });
        setCollecting(false);

        if (result.success) {
            toast.success(`Quantum Collected: ₹${amount}`);
            // Force refresh data
            const refresh = await lookupFamilyByPhone(phone);
            if (refresh.family) {
                setFamily(refresh.family);
                setChildren(refresh.children || []);
            }
            setAmount("");
        } else {
            toast.error(result.error || "Collection Protocol Failed");
        }
    }

    function handleReset() {
        setPhone("");
        setFamily(null);
        setChildren([]);
        setAmount("");
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Intelligent Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200/50">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">
                        Revenue Matrix
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                            <Activity className="h-3 w-3" />
                            Financial Node Active
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Execute Revenue Collection</p>
                    </div>
                </div>
            </div>

            {/* Precision Search Console */}
            <div className="max-w-xl">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 flex items-center gap-3">
                    <Smartphone className="h-3 w-3" /> Family Mobile Identifier
                </h2>
                <GlassCard className="p-2 border-white/60 shadow-xl flex items-center gap-2 rounded-2xl" intensity="high">
                    <div className="relative flex-1">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="tel"
                            placeholder="Search by 10-digit phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="pl-12 h-14 bg-transparent border-none text-xl font-black tracking-[0.2em] focus-visible:ring-0 shadow-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button
                        onClick={handleSearch}
                        disabled={loading || phone.length !== 10}
                        className="h-14 px-8 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sync Node"}
                    </Button>
                    {family && (
                        <button onClick={handleReset} className="p-4 text-slate-400 hover:text-red-500 transition-colors">
                            <Activity className="h-5 w-5 rotate-45" />
                        </button>
                    )}
                </GlassCard>
            </div>

            {/* Neural Results Matrix */}
            {family ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Family Metadata */}
                        <GlassCard className="p-10 border-white/60 shadow-2xl overflow-hidden relative" intensity="medium">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />

                            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xl relative group">
                                        <Users className="h-10 w-10 text-amber-500 transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 border border-white/20 rounded-3xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">{family.fatherName}</h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{family.phone}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                                <Smartphone className="h-3 w-3" /> Family Core
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={cn(
                                    "p-6 md:p-8 rounded-[2rem] border overflow-hidden relative shadow-2xl transform hover:scale-105 transition-transform duration-500 min-w-[240px]",
                                    family.balance < 0 ? "bg-red-50/50 border-red-200" : "bg-emerald-50/50 border-emerald-200"
                                )}>
                                    <div className={cn(
                                        "absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full -mr-16 -mt-16",
                                        family.balance < 0 ? "bg-red-500/20" : "bg-emerald-500/20"
                                    )} />
                                    <div className="relative">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                                            {family.balance < 0 ? 'Quantum Arrears' : 'Node Liquidity'}
                                        </p>
                                        <div className={cn(
                                            "text-4xl font-black tracking-tighter leading-none",
                                            family.balance < 0 ? "text-red-600" : "text-emerald-600"
                                        )}>
                                            ₹{Math.abs(family.balance).toLocaleString('en-IN')}
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full animate-pulse", family.balance < 0 ? "bg-red-500" : "bg-emerald-500")} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Real-time status</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                                    <User className="h-3 w-3" /> Sub-Node Entities ({children.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {children.map((child) => (
                                        <div
                                            key={child.id}
                                            className={cn(
                                                "p-5 rounded-2xl border transition-all duration-300",
                                                child.isActive
                                                    ? "bg-white/40 border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
                                                    : "bg-slate-50 border-slate-100 opacity-50 grayscale"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wider">{child.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{child.class}</p>
                                                </div>
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center border",
                                                    child.isActive ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-100 border-slate-200 text-slate-400"
                                                )}>
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-10">
                        {/* Collection Console */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                                <Wallet className="h-3 w-3" /> Revenue Input Node
                            </h2>
                            <GlassCard className="p-8 space-y-8 border-white/60 shadow-2xl border-t-4 border-t-slate-900" intensity="high">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantum Value (₹)</label>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="h-20 bg-slate-50 border-none text-4xl font-black text-center tracking-tighter focus-visible:ring-0 shadow-inner rounded-2xl group-hover:bg-amber-50/30 transition-colors"
                                        />
                                        <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-300 group-hover:text-amber-500 transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vector Selection</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setPaymentMode("CASH")}
                                            className={cn(
                                                "h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all flex items-center justify-center gap-2 shadow-sm",
                                                paymentMode === "CASH"
                                                    ? 'bg-slate-900 text-white border-slate-900 scale-105'
                                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                            )}
                                        >
                                            <Wallet className="h-4 w-4" />
                                            Cash Node
                                        </button>
                                        <button
                                            onClick={() => setPaymentMode("UPI")}
                                            className={cn(
                                                "h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all flex items-center justify-center gap-2 shadow-sm",
                                                paymentMode === "UPI"
                                                    ? 'bg-purple-600 text-white border-purple-600 scale-105'
                                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                            )}
                                        >
                                            <Smartphone className="h-4 w-4" />
                                            UPI Matrix
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCollect}
                                    disabled={collecting || !amount || parseInt(amount) <= 0}
                                    className={cn(
                                        "w-full h-20 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all flex items-center justify-center gap-4 group active:scale-95",
                                        "bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-none"
                                    )}
                                >
                                    {collecting ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] opacity-70">Commit Collection</span>
                                                <span>₹{Number(amount || 0).toLocaleString()}</span>
                                            </div>
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-3 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </GlassCard>

                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">Protocol Secured</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-xl animate-in fade-in duration-1000">
                    {!loading && phone.length === 10 ? (
                        <GlassCard className="p-16 text-center space-y-6 border-red-500/20" intensity="medium">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 flex items-center justify-center mx-auto">
                                <Users className="h-8 w-8 text-red-300" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">Node Not Found</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                                    The mobile identifier <span className="text-slate-900">{phone}</span> does not exist in the neural matrix.
                                </p>
                            </div>
                            <Button variant="outline" className="border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest px-8" asChild>
                                <a href="/cashier/admission">Initialize Enrollment</a>
                            </Button>
                        </GlassCard>
                    ) : (
                        <div className="opacity-40 space-y-4">
                            <div className="h-4 w-48 bg-slate-200 rounded-full animate-pulse" />
                            <GlassCard className="h-64 border-white/40" intensity="low">
                                <div className="w-full h-full" />
                            </GlassCard>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
