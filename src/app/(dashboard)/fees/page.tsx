"use client"

import { useState, useEffect, useCallback } from "react";
import { Receipt, Search, DollarSign, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateTotalDue, processPayment, getRecentTransactions, searchFamilies } from "@/actions/billing";
import { format } from "date-fns";
import { ReceiptModal } from "@/components/ReceiptModal";

type ReceiptData = {
    receiptNumber: string;
    date: Date;
    familyName: string;
    familyId: number;
    amount: number;
    paymentMode: string;
    newBalance: number;
};

type Transaction = {
    id: number;
    type: string;
    category: string;
    amount: number;
    description: string | null;
    createdAt: Date;
    familyId: number;
    fatherName: string | null;
    phone: string | null;
};

type FamilyResult = {
    id: number;
    fatherName: string;
    phone: string;
    balance: number;
    matchedBy?: string;
    studentName?: string;
};

export default function FeesPage() {
    const [familyId, setFamilyId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<FamilyResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<FamilyResult | null>(null);
    const [totalDue, setTotalDue] = useState<number | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI">("CASH");
    const [message, setMessage] = useState("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

    // Debounced search
    useEffect(() => {
        if (searchQuery.length < 2) return;

        const timer = setTimeout(async () => {
            setIsSearching(true);
            const result = await searchFamilies(searchQuery);
            setSearchResults(result.families || []);
            setShowResults(true);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectFamily = (family: FamilyResult) => {
        setSelectedFamily(family);
        setFamilyId(family.id.toString());
        setSearchQuery(family.fatherName);
        setShowResults(false);
        // Auto-calculate due
        handleSearchFamily(family.id.toString());
    };

    const handleSearchFamily = async (id?: string) => {
        const searchId = id || familyId;
        if (!searchId) {
            setMessage("Please enter or select a family");
            return;
        }

        const due = await calculateTotalDue(searchId);
        setTotalDue(due);
        setMessage(`Total due calculated: ₹${due}`);
        setPaymentAmount(due.toString());
    };

    const handleCollectPayment = async () => {
        if (!familyId || !paymentAmount) {
            setMessage("Please enter Family ID and Payment Amount");
            return;
        }

        setIsProcessing(true);
        const result = await processPayment({
            familyId,
            amount: parseFloat(paymentAmount),
            mode: paymentMode,
        });

        if ("success" in result && result.success) {
            setMessage(`✓ Payment collected successfully! New Balance: ₹${result.newBalance}`);

            // Show receipt modal
            setReceiptData({
                receiptNumber: result.receiptNumber || 'N/A',
                date: new Date(),
                familyName: selectedFamily?.fatherName || 'Unknown',
                familyId: parseInt(familyId),
                amount: parseFloat(paymentAmount),
                paymentMode: paymentMode,
                newBalance: result.newBalance,
            });
            setShowReceipt(true);

            setPaymentAmount("");
            setTotalDue(null);
            setSelectedFamily(null);
            setSearchQuery("");
            setFamilyId("");
            loadTransactions();
        } else if ("error" in result) {
            setMessage(`✗ ${result.error || "Failed to process payment"}`);
        } else {
            setMessage("✗ Failed to process payment");
        }
        setIsProcessing(false);
    };

    const loadTransactions = useCallback(async () => {
        setLoadingTransactions(true);
        const result = await getRecentTransactions({ limit: 20 });
        if (result.transactions) {
            setTransactions(result.transactions as Transaction[]);
        }
        setLoadingTransactions(false);
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Receipt className="h-7 w-7 text-indigo-600" />
                    Fee Collection
                </h1>
                <p className="text-gray-600 mt-1">Collect fees and manage payments</p>
            </div>

            {message && (
                <div
                    className={`px-4 py-3 rounded mb-6 ${message.startsWith("✓")
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : message.startsWith("✗")
                            ? "bg-red-50 border border-red-200 text-red-700"
                            : "bg-blue-50 border border-blue-200 text-blue-700"
                        }`}
                >
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Search Family & Calculate Due */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Search className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Search Family</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search by Name, Student, or Phone
                            </label>
                            <Input
                                type="text"
                                placeholder="Type to search..."
                                value={searchQuery}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchQuery(val);
                                    if (val.length < 2) {
                                        setSearchResults([]);
                                    }
                                    setSelectedFamily(null);
                                }}
                                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                            />

                            {/* Search Results Dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {searchResults.map((family) => (
                                        <button
                                            key={family.id}
                                            onClick={() => handleSelectFamily(family)}
                                            className="w-full px-4 py-3 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">{family.fatherName}</span>
                                                {family.matchedBy === 'student' && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                        Student: {family.studentName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {family.phone} • ID: {family.id}
                                                {family.balance < 0 && (
                                                    <span className="text-red-600 ml-2">Due: ₹{Math.abs(family.balance)}</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {isSearching && (
                                <p className="text-xs text-gray-500 mt-1">Searching...</p>
                            )}
                            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">No families found</p>
                            )}
                        </div>

                        {selectedFamily && (
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                <p className="text-sm font-medium text-indigo-700">Selected: {selectedFamily.fatherName}</p>
                                <p className="text-xs text-indigo-600">ID: {selectedFamily.id} • {selectedFamily.phone}</p>
                            </div>
                        )}

                        <Button
                            onClick={() => handleSearchFamily()}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            disabled={!familyId}
                        >
                            Calculate Total Due
                        </Button>

                        {totalDue !== null && (
                            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                <p className="text-sm text-indigo-700 font-medium">Total Monthly Due</p>
                                <p className="text-3xl font-bold text-indigo-900">₹{totalDue}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collect Payment */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Collect Payment</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Amount
                            </label>
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Mode
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="CASH"
                                        checked={paymentMode === "CASH"}
                                        onChange={(e) => setPaymentMode(e.target.value as "CASH" | "UPI")}
                                        className="mr-2"
                                    />
                                    Cash
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="UPI"
                                        checked={paymentMode === "UPI"}
                                        onChange={(e) => setPaymentMode(e.target.value as "CASH" | "UPI")}
                                        className="mr-2"
                                    />
                                    UPI
                                </label>
                            </div>
                        </div>

                        <Button
                            onClick={handleCollectPayment}
                            disabled={isProcessing || !familyId}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? "Processing..." : "Collect Payment"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                    </div>
                    <Button
                        onClick={loadTransactions}
                        variant="outline"
                        size="sm"
                        disabled={loadingTransactions}
                    >
                        {loadingTransactions ? "Loading..." : "Refresh"}
                    </Button>
                </div>

                {transactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No transactions yet. Click &quot;Refresh&quot; to load recent transactions.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Family
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {format(new Date(txn.createdAt), "MMM dd, yyyy")}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {txn.fatherName || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded ${txn.type === "CREDIT"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {txn.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₹{txn.amount}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {txn.description || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            {showReceipt && receiptData && (
                <ReceiptModal
                    receipt={receiptData}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </div>
    );
}
