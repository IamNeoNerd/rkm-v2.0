"use client";

import { useState } from "react";
import { Phone, Users, CreditCard, Calendar, Receipt, ChevronRight, Wallet, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupFamilyByPhone, getFamilyChildren, getParentPaymentHistory } from "@/actions/parent";
import { format } from "date-fns";

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

type Transaction = {
    id: number;
    type: "CREDIT" | "DEBIT";
    amount: number;
    description: string | null;
    createdAt: Date;
    receiptNumber: string | null;
    paymentMode: string | null;
};

import { ParentPortalSkeleton } from "@/components/ui/skeletons";
import { StudentDetails } from "@/components/parent/StudentDetails";
import { ReceiptModal } from "@/components/ReceiptModal";

export default function ParentPortal() {
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [family, setFamily] = useState<Family | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Detail View State
    const [selectedStudent, setSelectedStudent] = useState<Child | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Receipt Modal State
    const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

    const handleLookup = async () => {
        if (phone.length !== 10) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await lookupFamilyByPhone(phone);

            if (result.error) {
                setError(result.error);
                setFamily(null);
                setChildren([]);
                setTransactions([]);
            } else if (result.family) {
                setFamily(result.family);

                // Fetch children and payments
                const [childrenRes, paymentsRes] = await Promise.all([
                    getFamilyChildren(result.family.id),
                    getParentPaymentHistory(result.family.id),
                ]);

                setChildren(childrenRes.children || []);
                setTransactions(paymentsRes.transactions as Transaction[] || []);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setPhone("");
        setFamily(null);
        setChildren([]);
        setTransactions([]);
        setError("");
        setDetailsOpen(false);
        setSelectedStudent(null);
        setSelectedReceipt(null);
    };

    const handleChildClick = (child: Child) => {
        setSelectedStudent(child);
        setDetailsOpen(true);
    };

    const handleReceiptClick = (txn: Transaction) => {
        if (txn.type === 'CREDIT' && family) {
            setSelectedReceipt({
                receiptNumber: txn.receiptNumber || `PAY-${txn.id}`,
                date: txn.createdAt,
                familyName: family.fatherName,
                familyId: family.id,
                amount: txn.amount,
                paymentMode: txn.paymentMode || 'CASH',
                newBalance: family.balance // Showing current balance as approximation
            });
        }
    };

    // Show skeleton while loading details after phone submission
    if (isLoading) {
        return <ParentPortalSkeleton />;
    }

    // If not logged in, show phone input
    if (!family) {
        return (
            <div className="max-w-md mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Parent Portal</h2>
                    <p className="text-gray-600">Enter your registered phone number to view your children&apos;s details and fee information.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <Input
                                type="tel"
                                placeholder="Enter 10-digit phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                maxLength={10}
                                className="text-lg"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <Button
                            onClick={handleLookup}
                            disabled={isLoading || phone.length !== 10}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isLoading ? "Looking up..." : "View Details"}
                        </Button>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Can&apos;t find your account? Contact the institute office.
                </p>
            </div>
        );
    }

    // Logged in - show dashboard
    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {family.fatherName}</h2>
                    <p className="text-sm text-gray-500">Family ID: #{family.id}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <X className="h-4 w-4 mr-1" />
                    Logout
                </Button>
            </div>

            {/* Balance Card */}
            <div className={`p-5 rounded-xl mb-6 ${family.balance < 0 ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Wallet className={`h-8 w-8 ${family.balance < 0 ? 'text-red-500' : 'text-green-500'}`} />
                        <div>
                            <p className={`text-sm font-medium ${family.balance < 0 ? 'text-red-700' : 'text-green-700'}`}>
                                {family.balance < 0 ? 'Amount Due' : 'Balance'}
                            </p>
                            <p className={`text-3xl font-bold ${family.balance < 0 ? 'text-red-700' : 'text-green-700'}`}>
                                ₹{Math.abs(family.balance)}
                            </p>
                        </div>
                    </div>
                    {family.balance < 0 && (
                        <div className="text-right">
                            <p className="text-xs text-red-600">Please clear dues</p>
                            <p className="text-xs text-red-500">at the office</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Children Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Your Children ({children.length})
                </h3>

                {children.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No students found.</p>
                ) : (
                    <div className="space-y-3">
                        {children.map((child) => (
                            <button
                                key={child.id}
                                onClick={() => handleChildClick(child)}
                                className={`w-full text-left p-4 rounded-lg border transition-all hover:shadow-md active:scale-[0.98] ${child.isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-full">
                                            <GraduationCap className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{child.name}</p>
                                            <p className="text-xs text-gray-600">{child.class}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-indigo-300" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Receipt className="h-5 w-5 text-indigo-600" />
                    Recent Payments
                </h3>

                {transactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No payment history yet.</p>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((txn) => (
                            <button
                                key={txn.id}
                                onClick={() => handleReceiptClick(txn)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${txn.type === 'CREDIT' ? 'bg-gray-50 hover:bg-green-50 cursor-pointer' : 'bg-gray-50 opacity-80 cursor-default'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.type === 'CREDIT' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <CreditCard className={`h-4 w-4 ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-900">
                                            {txn.type === 'CREDIT' ? 'Payment Received' : 'Fee Charge'}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(txn.createdAt), "MMM dd, yyyy")}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className={`font-semibold text-right ${txn.type === 'CREDIT' ? 'text-green-700' : 'text-red-700'}`}>
                                        {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-mono text-right">{txn.receiptNumber || 'No Receipt'}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Student Detail View */}
            <StudentDetails
                student={selectedStudent}
                isOpen={detailsOpen}
                onClose={() => setDetailsOpen(false)}
            />

            {/* Receipt Modal */}
            {selectedReceipt && (
                <ReceiptModal
                    receipt={selectedReceipt}
                    onClose={() => setSelectedReceipt(null)}
                />
            )}
        </div>
    );
}
