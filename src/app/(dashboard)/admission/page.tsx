"use client";

import { useState } from "react";
import { processAdmission } from "@/actions/admission";
import { format } from "date-fns";
import { calculateJoiningFee } from "@/lib/billing";
import { toast } from "sonner";
import { GlassCard } from "@/components/modern/Card";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { UserPlus, User, Phone, GraduationCap, IndianRupee, Calendar, AlertCircle, Sparkles, CheckCircle2, ChevronDown, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdmissionPage() {
    const [formData, setFormData] = useState({
        fatherName: "",
        phone: "",
        studentName: "",
        studentClass: "10",
        monthlyFee: 2000,
        joiningDate: format(new Date(), "yyyy-MM-dd"),
        overrideAmount: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneError, setPhoneError] = useState("");

    // Real-time suggestion calculation
    const joiningDateObj = formData.joiningDate ? new Date(formData.joiningDate) : new Date();
    const suggestion = formData.joiningDate
        ? calculateJoiningFee(joiningDateObj, formData.monthlyFee)
        : { suggestedAmount: formData.monthlyFee, isConflict: false, explanation: "", isProRated: false, remainingDaysInCycle: 0, billingSummary: "" };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phone) {
            setPhoneError("Phone number is required");
            return false;
        }
        if (!phoneRegex.test(phone)) {
            setPhoneError("Phone must be exactly 10 digits");
            return false;
        }
        setPhoneError("");
        return true;
    };

    const handlePhoneChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '');
        setFormData({ ...formData, phone: digitsOnly });
        if (digitsOnly) validatePhone(digitsOnly);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePhone(formData.phone)) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setIsSubmitting(true);

        const finalAmount = formData.overrideAmount
            ? parseInt(formData.overrideAmount)
            : suggestion.suggestedAmount;

        const result = await processAdmission({
            ...formData,
            joiningDate: new Date(formData.joiningDate),
            initialPayment: finalAmount,
        });

        if (result.success && 'studentId' in result) {
            toast.success(`Admission successful! Student ID: ${result.studentId}`);
            setFormData({
                fatherName: "",
                phone: "",
                studentName: "",
                studentClass: "10",
                monthlyFee: 2000,
                joiningDate: format(new Date(), "yyyy-MM-dd"),
                overrideAmount: "",
            });
        } else {
            toast.error(result.error || "Failed to process admission");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3 font-satoshi">
                        Admission Matrix
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Initiate Neural Enrollment & Financial Onboarding
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                        <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Primary Guardian Node */}
                    <GlassCard className="p-8 space-y-6" intensity="high">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Guardian Protocol</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Father's Full Name</label>
                                <Input
                                    required
                                    placeholder="Enter full legal name"
                                    value={formData.fatherName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fatherName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Communication Channel (Phone)</label>
                                <div className="relative">
                                    <Input
                                        type="tel"
                                        required
                                        maxLength={10}
                                        placeholder="10-digit mobile identifier"
                                        className={cn(phoneError && "border-red-500/50 focus:border-red-500")}
                                        value={formData.phone}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePhoneChange(e.target.value)}
                                    />
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                </div>
                                {phoneError && (
                                    <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1">{phoneError}</p>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Student Identity Node */}
                    <GlassCard className="p-8 space-y-6" intensity="high">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <GraduationCap className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Student Identity</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Individual Name</label>
                                <Input
                                    required
                                    placeholder="Enter student name"
                                    value={formData.studentName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, studentName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Tier (Class)</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-slate-900 appearance-none"
                                        value={formData.studentClass}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, studentClass: e.target.value })}
                                    >
                                        {['8', '9', '10', '11', '12'].map(c => <option key={c} value={c}>Class {c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Billing & Temporal Matrix */}
                <GlassCard className="p-8 border-l-4 border-l-primary" intensity="medium">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <IndianRupee className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Billing & Temporal Matrix</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Monthly Subscription Fee</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="2000"
                                        value={formData.monthlyFee}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                            setFormData({ ...formData, monthlyFee: val });
                                        }}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">INR</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Neural Joining Epoch</label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={formData.joiningDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, joiningDate: e.target.value })}
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            {suggestion.isConflict ? (
                                <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-3xl space-y-4 animate-in zoom-in-95 duration-500">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-600">Pro-Rata Conflict Detected</h3>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                                        "{suggestion.explanation}"
                                    </p>
                                    <div className="flex flex-col gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, overrideAmount: "" })}
                                            className={cn(
                                                "w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300",
                                                !formData.overrideAmount ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20" : "bg-white/50 text-slate-600 hover:bg-white"
                                            )}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">Accept Suggestion</span>
                                            <span className="text-sm font-black">₹{suggestion.suggestedAmount}</span>
                                        </button>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, overrideAmount: suggestion.suggestedAmount.toString() })}
                                                className={cn(
                                                    "w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 mb-2",
                                                    formData.overrideAmount ? "bg-slate-900 text-white shadow-xl" : "bg-white/50 text-slate-600 hover:bg-white"
                                                )}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">Override Neural Logic</span>
                                                <Sparkles className="h-4 w-4" />
                                            </button>
                                            {formData.overrideAmount !== "" && (
                                                <div className="px-1 animate-in slide-in-from-top-2 duration-300">
                                                    <Input
                                                        type="number"
                                                        placeholder="Custom Amount"
                                                        className="h-10 text-center font-black"
                                                        value={formData.overrideAmount}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, overrideAmount: e.target.value })}
                                                        autoFocus
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                                    <CheckCircle2 className="h-10 w-10 text-slate-300" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Invoicing Pattern Active</p>
                                </div>
                            )}
                        </div>
                    </div>
                </GlassCard>

                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full h-16 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 group"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-3">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            Synchronizing...
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            Process Neural Admission
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                    )}
                </Button>
            </form>
        </div>
    );
}

