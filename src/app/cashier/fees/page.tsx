"use client";

import { useState } from "react";
import { IndianRupee, Search, Users, Wallet, Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { lookupFamilyByPhone, collectFee } from "@/actions/cashier";

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
            toast.error("Please enter a valid 10-digit phone number");
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
        }
    }

    async function handleCollect() {
        if (!family || !amount || parseInt(amount) <= 0) {
            toast.error("Please enter a valid amount");
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
            toast.success(`₹${amount} collected successfully! Receipt: ${result.receiptNumber}`);
            // Refresh family data
            handleSearch();
            setAmount("");
        } else {
            toast.error(result.error || "Failed to collect fee");
        }
    }

    function handleReset() {
        setPhone("");
        setFamily(null);
        setChildren([]);
        setAmount("");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <IndianRupee className="h-6 w-6 text-emerald-400" />
                    Fee Collection
                </h1>
                <p className="text-slate-400 mt-1">Search family by phone number and collect fees</p>
            </div>

            {/* Search Box */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="tel"
                            placeholder="Enter 10-digit phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="pl-10 bg-slate-700 border-slate-600 text-white"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button
                        onClick={handleSearch}
                        disabled={loading || phone.length !== 10}
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                    </Button>
                    {family && (
                        <Button variant="outline" onClick={handleReset} className="border-slate-600 text-slate-300">
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Family Details */}
            {family && (
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 space-y-6">
                    {/* Family Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{family.fatherName}</h2>
                                <p className="text-slate-400">Phone: {family.phone}</p>
                            </div>
                        </div>
                        <div className={`text-right p-4 rounded-lg ${family.balance < 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                            <p className="text-sm text-slate-400">{family.balance < 0 ? 'Due Amount' : 'Balance'}</p>
                            <p className={`text-2xl font-bold ${family.balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                ₹{Math.abs(family.balance).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    {/* Children List */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Children ({children.length})</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {children.map((child) => (
                                <div
                                    key={child.id}
                                    className={`p-3 rounded-lg border ${child.isActive ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-800 border-slate-700 opacity-50'}`}
                                >
                                    <p className="text-white font-medium">{child.name}</p>
                                    <p className="text-slate-400 text-sm">{child.class}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Collection Form */}
                    <div className="border-t border-slate-700 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Collect Payment</h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Amount (₹)</label>
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Payment Mode</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPaymentMode("CASH")}
                                        className={`flex-1 py-2 rounded-lg transition-colors ${paymentMode === "CASH"
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        CASH
                                    </button>
                                    <button
                                        onClick={() => setPaymentMode("UPI")}
                                        className={`flex-1 py-2 rounded-lg transition-colors ${paymentMode === "UPI"
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        UPI
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleCollect}
                                    disabled={collecting || !amount || parseInt(amount) <= 0}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {collecting ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Receipt className="h-4 w-4 mr-2" />
                                    )}
                                    Collect ₹{amount || '0'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No Family Found */}
            {!family && !loading && phone.length === 10 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                    <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No family found with this phone number</p>
                    <p className="text-slate-500 text-sm mt-1">Try a different number or register a new admission</p>
                </div>
            )}
        </div>
    );
}
