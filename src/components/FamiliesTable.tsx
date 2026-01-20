"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Phone,
    CreditCard,
    ChevronRight,
    Filter,
    ArrowUpRight,
    MessageSquare
} from "lucide-react";
import { PaginationControls } from "@/components/PaginationControls";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { QuickPaymentDialog } from "@/components/QuickPaymentDialog";

interface Family {
    id: number;
    fatherName: string | null;
    phone: string | null;
    balance: number;
    studentCount: number;
}

interface FamiliesTableProps {
    families: Family[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export function FamiliesTable({ families, pagination }: FamiliesTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(searchTerm, 300);

    // Payment Dialog State
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);

    const handlePayClick = (family: Family) => {
        setSelectedFamily(family);
        setPaymentOpen(true);
    };

    const handlePaymentSuccess = () => {
        router.refresh(); // Refresh to update family balance
    };

    // Update URL when debounced search changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }
        params.set("page", "1"); // Reset to first page on search
        router.push(`?${params.toString()}`);
    }, [debouncedSearch, router, searchParams]);

    return (
        <div className="space-y-6">
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by father's name or phone..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <Filter className="h-4 w-4" />
                        More Filters
                    </button>
                    <Link
                        href="/admission"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Users className="h-4 w-4" />
                        New Admission
                    </Link>
                </div>
            </div>

            {/* Families List/Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Family ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Students</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {families.length > 0 ? (
                                families.map((family) => (
                                    <tr key={family.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                #{family.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900">{family.fatherName || "Not Provided"}</span>
                                                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                                                    <Phone className="h-3 w-3" />
                                                    {family.phone || "-"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                                {family.studentCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold ${family.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {family.balance < 0 ? '-' : ''} {formatCurrency(Math.abs(family.balance))}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                                    {family.balance < 0 ? 'Outstanding Due' : 'Available Balance'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/families/${family.id}`}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => toast.info("Reminder system coming in Phase 4")}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Send Reminder"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePayClick(family)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all border border-indigo-100"
                                                >
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                    Pay
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <Users className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900">No families found</h3>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                                                Try adjusting your search or add a new family via student admission.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <PaginationControls
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        total={pagination.total}
                        limit={pagination.limit}
                    />
                )}
            </div>

            {/* Quick Payment Dialog */}
            {selectedFamily && (
                <QuickPaymentDialog
                    open={paymentOpen}
                    onClose={() => {
                        setPaymentOpen(false);
                        setSelectedFamily(null);
                    }}
                    familyId={selectedFamily.id}
                    familyName={selectedFamily.fatherName || "Family"}
                    currentDue={selectedFamily.balance < 0 ? Math.abs(selectedFamily.balance) : 0}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
