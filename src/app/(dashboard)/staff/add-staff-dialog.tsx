"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, User, Phone, Mail, Shield, UserCog, IndianRupee, Zap, X } from "lucide-react";
import { createStaff, StaffRole } from "@/actions/staff";
import { getStaffRoleTypes } from "@/actions/staff-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { GlassCard } from "@/components/modern/Card";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface CustomRoleType {
    id: number;
    name: string;
}

export function AddStaffDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [customRoleTypes, setCustomRoleTypes] = useState<CustomRoleType[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        role: "STAFF" as StaffRole,
        roleType: "",
        baseSalary: "",
    });

    const loadRoleTypes = useCallback(async () => {
        const res = await getStaffRoleTypes();
        if (res.success && res.roleTypes) {
            setCustomRoleTypes(res.roleTypes);
        }
    }, []);

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                loadRoleTypes();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open, loadRoleTypes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createStaff({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || undefined,
            role: formData.role,
            roleType: formData.roleType || undefined,
            baseSalary: parseInt(formData.baseSalary) || 0
        });

        setLoading(false);

        if (res.success) {
            toast.success("Personnel node integrated successfully");
            setOpen(false);
            setFormData({ name: "", phone: "", email: "", role: "STAFF", roleType: "", baseSalary: "" });
        } else {
            toast.error(res.error || "Integration failed");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 px-6 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] group">
                    <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Add Personnel Node</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-slate-50/80 backdrop-blur-3xl border-white/20 p-0 overflow-hidden rounded-[32px] shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                <DialogHeader className="p-8 pb-4 relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <Plus className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                            Add Personnel
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Calibrate new operational identity profile
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-8 relative z-10">
                    <div className="space-y-6">
                        {/* Primary Identity Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-3 w-3 text-indigo-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Core Identity Data</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Legal Name</Label>
                                    <Input
                                        required
                                        className="bg-white/50 border-white h-12 focus:ring-indigo-500/20 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                                        placeholder="ENTER NAME"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Mobile Node</Label>
                                    <Input
                                        required
                                        className="bg-white/50 border-white h-12 focus:ring-indigo-500/20 rounded-xl font-mono text-[10px] font-bold"
                                        placeholder="+91 XXXXX XXXXX"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Official Digital Identity (Email)</Label>
                                <Input
                                    type="email"
                                    className="bg-white/50 border-white h-12 focus:ring-indigo-500/20 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                                    placeholder="STAFF@RKINSTITUTE.COM"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Operational Clearance Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-3 w-3 text-amber-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security Clearance & Protocol</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">System Role Vector</Label>
                                    <select
                                        className="w-full h-12 px-4 bg-white/50 border border-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer shadow-sm"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                                    >
                                        <option value="STAFF">SUPPORT STAFF / OTHER</option>
                                        <option value="TEACHER">TEACHER</option>
                                        <option value="RECEPTIONIST">RECEPTIONIST</option>
                                        <option value="ADMIN">ADMINISTRATOR</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Functional Specialty</Label>
                                    <select
                                        className="w-full h-12 px-4 bg-white/50 border border-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer shadow-sm"
                                        value={formData.roleType}
                                        onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                                    >
                                        <option value="">CORE PROTOCOL</option>
                                        {customRoleTypes.map((rt) => (
                                            <option key={rt.id} value={rt.name}>{rt.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Financial Ledger Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <IndianRupee className="h-3 w-3 text-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Financial Ledger Data</span>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Base Retainer Salary</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                        type="number"
                                        required
                                        className="pl-12 bg-white/50 border-white h-12 focus:ring-indigo-500/20 rounded-xl font-mono text-sm font-bold"
                                        placeholder="0.00"
                                        value={formData.baseSalary}
                                        onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-16 shadow-2xl transition-all hover:scale-[1.01] overflow-hidden group/submit"
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                {loading ? (
                                    <>
                                        <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Synchronizing Node...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-5 w-5 text-indigo-400 transition-transform group-hover/submit:rotate-90" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Initialize Personnel Node</span>
                                    </>
                                )}
                            </div>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
