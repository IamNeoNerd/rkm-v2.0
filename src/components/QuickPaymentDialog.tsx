"use client";

import { useState } from "react";
import { IndianRupee, CreditCard, Banknote, Loader2, CheckCircle2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { processPayment } from "@/actions/billing";
import { toast } from "sonner";

interface QuickPaymentDialogProps {
    open: boolean;
    onClose: () => void;
    familyId: number;
    familyName: string;
    studentName?: string;
    currentDue?: number;
    onSuccess?: () => void;
}

type PaymentMode = "CASH" | "UPI";

export function QuickPaymentDialog({
    open,
    onClose,
    familyId,
    familyName,
    studentName,
    currentDue = 0,
    onSuccess,
}: QuickPaymentDialogProps) {
    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState<PaymentMode>("CASH");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setLoading(true);

        const result = await processPayment({
            familyId: familyId.toString(),
            amount: amountNum,
            mode,
        });

        setLoading(false);

        if ("error" in result) {
            toast.error(result.error);
            return;
        }

        setSuccess(true);
        setReceiptNumber("receiptNumber" in result ? result.receiptNumber : null);
        toast.success("Payment recorded successfully!");
        onSuccess?.();
    };

    const handleClose = () => {
        setAmount("");
        setMode("CASH");
        setSuccess(false);
        setReceiptNumber(null);
        onClose();
    };

    const handlePrint = () => {
        // TODO: Open receipt dialog with print functionality
        toast.info("Receipt printing coming soon");
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(value);

    const paymentModes: { value: PaymentMode; label: string; icon: React.ReactNode }[] = [
        { value: "CASH", label: "Cash", icon: <Banknote className="h-4 w-4" /> },
        { value: "UPI", label: "UPI", icon: <IndianRupee className="h-4 w-4" /> },
    ];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IndianRupee className="h-5 w-5 text-green-600" />
                        Quick Payment
                    </DialogTitle>
                    <DialogDescription>
                        {studentName ? `Collect fee for ${studentName}` : `Collect fee from ${familyName}`}
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="text-center py-6">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Successful!</h3>
                        <p className="text-sm text-gray-600 mb-2">
                            Received {formatCurrency(parseFloat(amount))} from {familyName}
                        </p>
                        {receiptNumber && (
                            <p className="text-xs text-gray-500 font-mono mb-4">
                                Receipt: {receiptNumber}
                            </p>
                        )}
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={handlePrint}>
                                <Receipt className="h-4 w-4 mr-2" />
                                Print Receipt
                            </Button>
                            <Button onClick={handleClose}>Done</Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Due Amount Display */}
                        {currentDue > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-orange-700">Current Due</span>
                                    <span className="font-bold text-orange-700">
                                        {formatCurrency(currentDue)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Amount Input */}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="pl-8 text-lg h-12"
                                    min="1"
                                    required
                                    autoFocus
                                />
                            </div>
                            {currentDue > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 text-xs text-indigo-600"
                                    onClick={() => setAmount(currentDue.toString())}
                                >
                                    Pay full due: {formatCurrency(currentDue)}
                                </Button>
                            )}
                        </div>

                        {/* Payment Mode */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Mode
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {paymentModes.map((m) => (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => setMode(m.value)}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${mode === m.value
                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        {m.icon}
                                        <span className="text-sm font-medium">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-green-600 hover:bg-green-700"
                            disabled={loading || !amount}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <IndianRupee className="h-5 w-5 mr-2" />
                                    Collect Payment
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook to manage QuickPaymentDialog state
 */
export function useQuickPayment() {
    const [isOpen, setIsOpen] = useState(false);
    const [paymentData, setPaymentData] = useState<{
        familyId: number;
        familyName: string;
        studentName?: string;
        currentDue?: number;
    } | null>(null);

    const openPayment = (data: {
        familyId: number;
        familyName: string;
        studentName?: string;
        currentDue?: number;
    }) => {
        setPaymentData(data);
        setIsOpen(true);
    };

    const closePayment = () => {
        setIsOpen(false);
        setPaymentData(null);
    };

    return {
        isOpen,
        paymentData,
        openPayment,
        closePayment,
    };
}
