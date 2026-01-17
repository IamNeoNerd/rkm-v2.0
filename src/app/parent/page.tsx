"use client";

import { useState } from "react";
import { Phone, Users, CreditCard, Calendar, Receipt, ChevronRight, Wallet, X } from "lucide-react";
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
    type: string;
    amount: number;
    description: string | null;
    createdAt: Date;
    receiptNumber: string | null;
};

export default function ParentPortal() {
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [family, setFamily] = useState<Family | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const handleLookup = async () => {
        if (phone.length !== 10) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setIsLoading(true);
        setError("");

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
            setTransactions(paymentsRes.transactions || []);
        }
        setIsLoading(false);
    };

    const handleReset = () => {
        setPhone("");
        setFamily(null);
        setChildren([]);
        setTransactions([]);
        setError("");
    };

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
                            <div
                                key={child.id}
                                className={`p-4 rounded-lg border ${child.isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">{child.name}</p>
                                        <p className="text-sm text-gray-600">{child.class}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${child.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {child.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
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
                            <div
                                key={txn.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.type === 'CREDIT' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <CreditCard className={`h-4 w-4 ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {txn.type === 'CREDIT' ? 'Payment' : 'Fee Charge'}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(txn.createdAt), "MMM dd, yyyy")}
                                        </div>
                                    </div>
                                </div>
                                <span className={`font-semibold ${txn.type === 'CREDIT' ? 'text-green-700' : 'text-red-700'}`}>
                                    {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
