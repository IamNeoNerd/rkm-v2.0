
"use client";

import { useState, useEffect } from "react";
import { processAdmission } from "@/actions/admission";
import { format } from "date-fns";
import { calculateJoiningFee, BILLING_CYCLE_START_DAY } from "@/lib/billing";
import { toast } from "sonner";

export default function AdmissionPage() {
    const [formData, setFormData] = useState({
        fatherName: "",
        phone: "",
        studentName: "",
        studentClass: "10",
        monthlyFee: 2000,
        joiningDate: "", // Will be set in useEffect
        overrideAmount: "",
    });

    // Set default date on client-side to avoid hydration mismatch
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            joiningDate: format(new Date(), "yyyy-MM-dd")
        }));
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneError, setPhoneError] = useState("");

    // Real-time suggestion calculation (only when joiningDate is set)
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
        // Only allow digits
        const digitsOnly = value.replace(/\D/g, '');
        setFormData({ ...formData, phone: digitsOnly });
        if (digitsOnly) validatePhone(digitsOnly);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate phone before submission
        if (!validatePhone(formData.phone)) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setIsSubmitting(true);

        // Determine the finalized amount (Option A or B)
        const finalAmount = formData.overrideAmount
            ? parseInt(formData.overrideAmount)
            : suggestion.suggestedAmount;

        const result = await processAdmission({
            ...formData,
            joiningDate: new Date(formData.joiningDate),
            initialPayment: finalAmount,
        });

        if (result.success) {
            toast.success(`Admission successful! Student ID: ${result.studentId}`);
            // Reset form
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
        <div className="p-4 sm:p-8 max-w-2xl mx-auto font-sans">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">New Admission</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Father's Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
                            value={formData.fatherName}
                            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Phone</label>
                        <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="10-digit phone number"
                            className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'
                                }`}
                            value={formData.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                        />
                        {phoneError && (
                            <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                        )}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h2 className="text-lg font-semibold mb-4">Student Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Student Name</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
                                value={formData.studentName}
                                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Class</label>
                            <select
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
                                value={formData.studentClass}
                                onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                            >
                                {['9', '10', '11', '12'].map(c => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4 bg-slate-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Billing & Fees</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Monthly Fee</label>
                            <input
                                type="number"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
                                value={formData.monthlyFee}
                                onChange={(e) => {
                                    const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                    setFormData({ ...formData, monthlyFee: val });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Joining Date</label>
                            <input
                                type="date"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border"
                                value={formData.joiningDate}
                                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Scenario 1.2: Conflict Flag */}
                    {suggestion.isConflict && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md animate-in fade-in">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">⚠️</div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">Payment Conflict Flag</h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>{suggestion.explanation}</p>
                                        <p className="font-bold mt-1">System Suggests: Rs {suggestion.suggestedAmount}</p>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="billingOption"
                                                    checked={!formData.overrideAmount}
                                                    onChange={() => setFormData({ ...formData, overrideAmount: "" })}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Accept Suggestion (Rs {suggestion.suggestedAmount})</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="billingOption"
                                                    checked={!!formData.overrideAmount}
                                                    onChange={() => setFormData({ ...formData, overrideAmount: suggestion.suggestedAmount.toString() })}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Override Amount</span>
                                            </label>
                                        </div>
                                        {formData.overrideAmount !== "" && (
                                            <input
                                                type="number"
                                                placeholder="Enter Custom Amount"
                                                className="mt-2 block w-48 rounded-md border-slate-300 shadow-sm p-1 border text-sm"
                                                value={formData.overrideAmount}
                                                onChange={(e) => setFormData({ ...formData, overrideAmount: e.target.value })}
                                                autoFocus
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Processing..." : "Process Admission"}
                </button>
            </form>
        </div>
    );
}
