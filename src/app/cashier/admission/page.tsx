"use client";

import { useState } from "react";
import { UserPlus, Loader2, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { registerAdmission } from "@/actions/cashier";

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
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        const result = await registerAdmission({
            ...formData,
            admissionFee: formData.admissionFee ? parseInt(formData.admissionFee) : undefined,
        });
        setLoading(false);

        if (result.success) {
            toast.success(result.message);
            setSuccess({ studentName: formData.studentName, studentId: result.studentId! });
            // Reset form
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
            toast.error(result.error || "Failed to register admission");
        }
    }

    function handleNewAdmission() {
        setSuccess(null);
    }

    if (success) {
        return (
            <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-8 text-center">
                    <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Admission Successful!</h2>
                    <p className="text-slate-300">
                        {success.studentName} has been registered successfully.
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                        Student ID: #{success.studentId}
                    </p>
                    <Button
                        onClick={handleNewAdmission}
                        className="mt-6 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        New Admission
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <UserPlus className="h-6 w-6 text-amber-400" />
                    New Admission
                </h1>
                <p className="text-slate-400 mt-1">Register a new student</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Parent Information */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-amber-400" />
                        Parent Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Father's Name *</label>
                            <Input
                                value={formData.fatherName}
                                onChange={(e) => handleChange('fatherName', e.target.value)}
                                placeholder="Enter father's name"
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Mother's Name</label>
                            <Input
                                value={formData.motherName}
                                onChange={(e) => handleChange('motherName', e.target.value)}
                                placeholder="Enter mother's name"
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Phone Number *</label>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="10-digit phone number"
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Address</label>
                            <Input
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Enter address"
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Student Information */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-amber-400" />
                        Student Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Student Name *</label>
                            <Input
                                value={formData.studentName}
                                onChange={(e) => handleChange('studentName', e.target.value)}
                                placeholder="Enter student's name"
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Class *</label>
                            <Input
                                value={formData.studentClass}
                                onChange={(e) => handleChange('studentClass', e.target.value)}
                                placeholder="e.g., Class 10, JEE Prep"
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Admission Fee (Optional)</h2>
                    <div className="max-w-xs">
                        <label className="block text-sm text-slate-400 mb-1">Amount (₹)</label>
                        <Input
                            type="number"
                            value={formData.admissionFee}
                            onChange={(e) => handleChange('admissionFee', e.target.value)}
                            placeholder="Enter admission fee if paid"
                            className="bg-slate-700 border-slate-600 text-white"
                        />
                        <p className="text-slate-500 text-xs mt-1">
                            Leave blank if fee is not collected now
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-amber-600 hover:bg-amber-700 px-8"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Register Admission
                    </Button>
                </div>
            </form>
        </div>
    );
}
