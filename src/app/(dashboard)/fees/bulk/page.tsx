"use client";

import { useState, useEffect, useCallback } from "react";
import { getDashboardData } from "@/actions/dashboard";
import { processPayment } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, IndianRupee, Receipt, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Family {
    id: number;
    fatherName: string;
    phone: string;
    balance: number;
}

export default function BulkFeeCollectionPage() {
    const [families, setFamilies] = useState<Family[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedFamilies, setSelectedFamilies] = useState<Set<number>>(new Set());
    const [amounts, setAmounts] = useState<Record<number, string>>({});
    const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI">("CASH");
    const [results, setResults] = useState<Record<number, { success: boolean; receipt?: string; error?: string }>>({});

    const loadFamilies = useCallback(async () => {
        const data = await getDashboardData();
        // getDashboardData returns an array with {id, father_name, phone, total_due, ...}
        const mappedFamilies = data.map((f: { id: string; father_name: string; phone: string; total_due: number }) => ({
            id: parseInt(f.id),
            fatherName: f.father_name,
            phone: f.phone,
            balance: f.total_due, // negative = due
        }));
        setFamilies(mappedFamilies);
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadFamilies();
        };
        init();
    }, [loadFamilies]);

    function toggleFamily(id: number) {
        const newSelected = new Set(selectedFamilies);
        const newAmounts = { ...amounts };

        if (newSelected.has(id)) {
            newSelected.delete(id);
            delete newAmounts[id];
        } else {
            newSelected.add(id);
            // Auto-fill the due amount when selecting
            const family = families.find(f => f.id === id);
            if (family && family.balance < 0) {
                newAmounts[id] = Math.abs(family.balance).toString();
            }
        }
        setSelectedFamilies(newSelected);
        setAmounts(newAmounts);
    }

    function selectAll() {
        const allWithDue = families.filter(f => f.balance < 0);
        setSelectedFamilies(new Set(allWithDue.map(f => f.id)));
        // Auto-populate amounts with due amounts
        const newAmounts: Record<number, string> = {};
        allWithDue.forEach(f => {
            newAmounts[f.id] = Math.abs(f.balance).toString();
        });
        setAmounts(newAmounts);
    }

    function clearSelection() {
        setSelectedFamilies(new Set());
        setAmounts({});
        setResults({});
    }

    async function processBulkPayments() {
        if (selectedFamilies.size === 0) {
            toast.error("Please select at least one family");
            return;
        }

        setProcessing(true);
        setResults({});

        const newResults: typeof results = {};

        for (const familyId of selectedFamilies) {
            const amount = parseInt(amounts[familyId] || "0");
            if (amount <= 0) {
                newResults[familyId] = { success: false, error: "Invalid amount" };
                continue;
            }

            try {
                const result = await processPayment({
                    familyId: familyId.toString(),
                    amount,
                    mode: paymentMode,
                });

                if ('success' in result && result.success) {
                    newResults[familyId] = {
                        success: true,
                        receipt: result.receiptNumber
                    };
                } else {
                    newResults[familyId] = {
                        success: false,
                        error: 'error' in result ? result.error : "Failed"
                    };
                }
            } catch {
                newResults[familyId] = { success: false, error: "Network error" };
            }
        }

        setResults(newResults);
        setProcessing(false);

        const successCount = Object.values(newResults).filter(r => r.success).length;
        if (successCount > 0) {
            toast.success(`${successCount} payment(s) processed successfully`);
            loadFamilies();
        }
    }

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    const familiesWithDue = families.filter(f => f.balance < 0);
    const totalSelected = selectedFamilies.size;
    const totalAmount = Array.from(selectedFamilies).reduce((sum, id) => {
        return sum + (parseInt(amounts[id] || "0") || 0);
    }, 0);

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-7 w-7 text-indigo-600" />
                        Bulk Fee Collection
                    </h1>
                    <p className="text-gray-600 mt-1">Collect fees from multiple families at once</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as "CASH" | "UPI")}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={selectAll}>
                        Select All Due
                    </Button>
                    <Button variant="outline" onClick={clearSelection}>
                        Clear
                    </Button>
                </div>
            </div>

            {/* Summary Card */}
            {totalSelected > 0 && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white mb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                            <p className="text-indigo-100 text-sm">Selected Families</p>
                            <p className="text-2xl sm:text-3xl font-bold">{totalSelected}</p>
                        </div>
                        <div>
                            <p className="text-indigo-100 text-sm">Total Amount</p>
                            <p className="text-2xl sm:text-3xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex items-end">
                            <Button
                                onClick={processBulkPayments}
                                disabled={processing || totalAmount === 0}
                                className="w-full bg-white text-indigo-600 hover:bg-indigo-50"
                            >
                                {processing ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                                ) : (
                                    <><Receipt className="h-4 w-4 mr-2" /> Collect All</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Families Table */}
            {familiesWithDue.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <IndianRupee className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No pending dues!</h3>
                    <p className="text-gray-500 mt-1">All families have cleared their balances</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">
                                        <span className="sr-only">Select</span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Family</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Phone</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {familiesWithDue.map((family) => {
                                    const isSelected = selectedFamilies.has(family.id);
                                    const result = results[family.id];
                                    const dueAmount = Math.abs(family.balance);

                                    return (
                                        <tr key={family.id} className={isSelected ? "bg-indigo-50" : "hover:bg-gray-50"}>
                                            <td className="px-4 py-4">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleFamily(family.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-medium text-gray-900">{family.fatherName}</p>
                                                <p className="text-sm text-gray-500 sm:hidden">{family.phone}</p>
                                            </td>
                                            <td className="px-4 py-4 text-right text-gray-500 hidden sm:table-cell">
                                                {family.phone}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="text-red-600 font-semibold">
                                                    ₹{dueAmount.toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Input
                                                    type="number"
                                                    placeholder="Amount"
                                                    value={amounts[family.id] || ""}
                                                    onChange={(e) => setAmounts(prev => ({
                                                        ...prev,
                                                        [family.id]: e.target.value
                                                    }))}
                                                    className="w-24 sm:w-32 text-right"
                                                    min="1"
                                                    disabled={!isSelected || processing}
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {result && (
                                                    result.success ? (
                                                        <span className="inline-flex items-center text-green-600">
                                                            <Check className="h-5 w-5" />
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-red-600" title={result.error}>
                                                            <X className="h-5 w-5" />
                                                        </span>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
