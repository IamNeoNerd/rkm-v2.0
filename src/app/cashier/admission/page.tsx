"use client";

import { useState } from "react";
import { UserPlus, Loader2, Users, CheckCircle, Phone, GraduationCap, MapPin, IndianRupee, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { GlassCard } from "@/components/modern/Card";
import { toast } from "sonner";
import { registerAdmission } from "@/actions/cashier";
import { cn } from "@/lib/utils";

export default function CashierAdmissionPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<{ studentName: string, studentId: number } | null>(null);

    const [formData, setFormData] = useState({
        fatherName: "",
        motherName: "",
        phone: "",
        address: "",
        studentName: "",
        studentClass: "",
        admissionFee: "",
    });

    function handleChange(field: string, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.fatherName || !formData.phone || !formData.studentName || !formData.studentClass) {
            toast.error("Required neural fields are empty");
            return;
        }

        if (formData.phone.length !== 10) {
            toast.error("Invalid mobile identifier (10 digits required)");
            return;
        }

        setLoading(true);
        const result = await registerAdmission({
            ...formData,
            admissionFee: formData.admissionFee ? parseInt(formData.admissionFee) : undefined,
        });
        setLoading(false);

        if (result.success) {
            toast.success("Identity Registered Successfully");
            setSuccess({ studentName: formData.studentName, studentId: result.studentId! });
            setFormData({
                fatherName: "",
                motherName: "",
                phone: "",
                address: "",
                studentName: "",
                studentClass: "",
                admissionFee: "",
            });
        } else {
            toast.error(result.error || "Neural Registration Failed");
        }
    }

    if (success) {
        return (
            <div className="max-w-2xl mx-auto py-12 animate-in zoom-in-95 duration-500">
                <GlassCard className="p-12 text-center relative overflow-hidden border-emerald-500/30" intensity="high">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full" />

                    <div className="relative">
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40">
                            <CheckCircle className="h-12 w-12 text-white" />
                        </div>

                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4 italic">Registration Complete</h2>
                        <p className="text-slate-500 font-medium mb-8">
                            <span className="text-slate-900 font-bold">{success.studentName}</span> has been integrated into the institutional matrix.
                        </p>

                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm tracking-widest uppercase mb-10">
                            Identity Core: #{success.studentId}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => setSuccess(null)}
                                className="w-full bg-slate-900 text-white hover:bg-slate-800 h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Initialize Next Enrollment
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-slate-200 hover:bg-slate-50 h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                                asChild
                            >
                                <a href="/cashier">Return to Terminal</a>
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-4xl mx-auto py-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">
                        Enrollment Matrix
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-amber-50 text-[10px] font-black text-amber-600 uppercase tracking-widest border border-amber-100">
                            <Sparkles className="h-3 w-3" />
                            Secure Intake Node
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-10">
                        {/* Parent Identity */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                                <Users className="h-3 w-3" /> Guardian Node Identity
                            </h2>
                            <GlassCard className="p-8 space-y-6 border-white/60 shadow-xl" intensity="medium">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Father's Legal Name</label>
                                    <Input
                                        value={formData.fatherName}
                                        onChange={(e) => handleChange('fatherName', e.target.value)}
                                        placeholder="Full Name"
                                        className="h-12 font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mother's Legal Name</label>
                                    <Input
                                        value={formData.motherName}
                                        onChange={(e) => handleChange('motherName', e.target.value)}
                                        placeholder="Optional"
                                        className="h-12 font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-amber-600">Primary Mobile</label>
                                        <div className="relative">
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="10-digit"
                                                className="h-12 pl-10 font-black tracking-widest"
                                                required
                                            />
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location Map</label>
                                        <div className="relative">
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => handleChange('address', e.target.value)}
                                                placeholder="City/Area"
                                                className="h-12 pl-10 font-bold"
                                            />
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Student Identity */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                                <GraduationCap className="h-3 w-3" /> Student Entity Matrix
                            </h2>
                            <GlassCard className="p-8 space-y-6 border-white/60 shadow-xl" intensity="medium">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Integrated Name</label>
                                    <Input
                                        value={formData.studentName}
                                        onChange={(e) => handleChange('studentName', e.target.value)}
                                        placeholder="Enter Student Name"
                                        className="h-12 font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Grade Allocation</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 pl-4 pr-10 rounded-xl bg-white/50 border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition-all font-black uppercase text-xs tracking-widest appearance-none"
                                            value={formData.studentClass}
                                            onChange={(e) => handleChange('studentClass', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Grade</option>
                                            {['8', '9', '10', '11', '12'].map(c => <option key={c} value={c}>Class {c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Revenue Section */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                                <IndianRupee className="h-3 w-3" /> Financial Onboarding
                            </h2>
                            <GlassCard className="p-8 border-amber-500/20 bg-amber-50/20 shadow-xl" intensity="low">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Initial Admission Fee</label>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            value={formData.admissionFee}
                                            onChange={(e) => handleChange('admissionFee', e.target.value)}
                                            placeholder="Leave blank for zero"
                                            className="h-14 pl-12 font-black text-xl tracking-tight bg-white group-hover:bg-amber-50 transition-colors"
                                        />
                                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-amber-500" />
                                    </div>
                                    <p className="text-[10px] text-amber-800/60 font-medium italic">Quantum value recorded immediately upon submission</p>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>

                {/* Secure Process Button */}
                <div className="pt-6 border-t border-slate-200/50 flex justify-end">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-16 px-12 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-900/20 flex items-center gap-3 group transition-all transform active:scale-95"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span>Commit Enrollment</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
