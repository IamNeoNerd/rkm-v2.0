"use client";

import { useState, useEffect, useCallback } from "react";
import { getFeeStructures, createFeeStructure, updateFeeStructure, deleteFeeStructure } from "@/actions/session";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/modern/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GraduationCap, Coins, Settings2 } from "lucide-react";
import { toast } from "sonner";

interface FeeStructure {
    id: number;
    className: string;
    monthlyFee: number;
    admissionFee: number;
    isActive: boolean;
}

export default function FeesSettingsPage() {
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        className: "",
        monthlyFee: "",
        admissionFee: "",
    });

    const loadStructures = useCallback(async () => {
        const result = await getFeeStructures();
        if (result.success && result.feeStructures) {
            setStructures(result.feeStructures);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadStructures();
        };
        init();
    }, [loadStructures]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const data = {
            className: formData.className,
            monthlyFee: parseInt(formData.monthlyFee),
            admissionFee: parseInt(formData.admissionFee) || 0,
        };

        let result;
        if (editingId) {
            result = await updateFeeStructure(editingId, data);
        } else {
            result = await createFeeStructure(data);
        }

        if (result.success) {
            toast.success(editingId ? "Fee structure updated" : "Fee structure created");
            setDialogOpen(false);
            resetForm();
            loadStructures();
        } else {
            toast.error(result.error || "Operation failed");
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this fee structure?")) return;

        const result = await deleteFeeStructure(id);
        if (result.success) {
            toast.success("Fee structure deleted");
            loadStructures();
        } else {
            toast.error(result.error || "Delete failed");
        }
    }

    function resetForm() {
        setFormData({ className: "", monthlyFee: "", admissionFee: "" });
        setEditingId(null);
    }

    function openEdit(structure: FeeStructure) {
        setFormData({
            className: structure.className,
            monthlyFee: structure.monthlyFee.toString(),
            admissionFee: structure.admissionFee.toString(),
        });
        setEditingId(structure.id);
        setDialogOpen(true);
    }

    if (loading) {
        return (
            <div className="p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
                <div className="h-12 bg-slate-200 rounded-2xl w-1/3 opacity-50" />
                <div className="h-96 bg-slate-100 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Hub */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3 font-satoshi">
                        Revenue Model
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Class-wise Fee Structures & Admission Tier Matrix
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button variant="primary" className="h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em] gap-2 shadow-xl">
                                <Plus className="h-4 w-4" />
                                Add Structure
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-xl border-white/40 shadow-2xl rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    {editingId ? "Edit" : "Add"} Structure
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="className" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Class Nomenclature</Label>
                                    <Input
                                        id="className"
                                        value={formData.className}
                                        onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
                                        placeholder="e.g., Class 10"
                                        className="h-12 bg-white/50 border-white/40 font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="monthlyFee" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Monthly Unit (₹)</Label>
                                        <Input
                                            id="monthlyFee"
                                            type="number"
                                            value={formData.monthlyFee}
                                            onChange={(e) => setFormData(prev => ({ ...prev, monthlyFee: e.target.value }))}
                                            placeholder="3000"
                                            className="h-12 bg-white/50 border-white/40 font-bold"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admissionFee" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admission Unit (₹)</Label>
                                        <Input
                                            id="admissionFee"
                                            type="number"
                                            value={formData.admissionFee}
                                            onChange={(e) => setFormData(prev => ({ ...prev, admissionFee: e.target.value }))}
                                            placeholder="1000"
                                            className="h-12 bg-white/50 border-white/40 font-bold"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" className="uppercase tracking-widest text-[10px] font-black" onClick={() => setDialogOpen(false)}>
                                        Abort
                                    </Button>
                                    <Button type="submit" variant="primary" className="px-8 uppercase tracking-widest text-[10px] font-black">
                                        {editingId ? "Synchronize" : "Finalize"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* List Visualization */}
            <GlassCard className="overflow-hidden border-white/20" intensity="high">
                <div className="p-8 border-b border-white/20 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Coins className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">Active Configurations</h3>
                    </div>
                </div>

                {structures.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="relative inline-block mb-6">
                            <GraduationCap className="h-20 w-20 text-slate-200" />
                            <Settings2 className="h-8 w-8 text-slate-400 absolute bottom-0 right-0 animate-spin-slow" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No fee structures defined</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Initialize your revenue model by adding a class structure.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-white/20">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Class Tier</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monthly Payload</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Admission Entry</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {structures.map((structure) => (
                                    <tr key={structure.id} className="group hover:bg-white/40 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <span className="text-lg font-black text-slate-900 uppercase tracking-tight">{structure.className}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-lg font-black text-emerald-600 font-mono tracking-tighter">₹{structure.monthlyFee.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right hidden sm:table-cell">
                                            <span className="text-sm font-bold text-slate-500 font-mono">₹{structure.admissionFee.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Button
                                                    variant="glass"
                                                    size="sm"
                                                    onClick={() => openEdit(structure)}
                                                    className="h-10 w-10 p-0 rounded-xl hover:bg-white"
                                                >
                                                    <Pencil className="h-4 w-4 text-slate-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(structure.id)}
                                                    className="h-10 w-10 p-0 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>

            {/* Matrix Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GlassCard className="p-8 border-l-4 border-l-emerald-500" intensity="medium">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Revenue Node Count</h4>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{structures.length} <span className="text-sm font-bold text-slate-400 uppercase">Tiers Active</span></p>
                </GlassCard>
                <GlassCard className="p-8 border-r-4 border-r-indigo-500" intensity="medium">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Average Monthly Unit</h4>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                        ₹{structures.length > 0
                            ? (structures.reduce((acc, s) => acc + s.monthlyFee, 0) / structures.length).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                            : 0
                        }
                    </p>
                </GlassCard>
            </div>
        </div>
    );
}
