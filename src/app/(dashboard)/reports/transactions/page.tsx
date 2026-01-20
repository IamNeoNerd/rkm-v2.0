import { Suspense } from "react";
import { getRecentTransactions } from "@/actions/billing";
import { format } from "date-fns";
import { Receipt, ArrowUpCircle, ArrowDownCircle, Search, Filter } from "lucide-react";
import { ExportTransactionsButton } from "./export-button";
import { TableSkeleton } from "@/components/ui/skeletons";
import { PaginationControls } from "@/components/PaginationControls";

interface Transaction {
    id: number;
    receiptNumber: string | null;
    createdAt: Date | null;
    type: "CREDIT" | "DEBIT";
    fatherName: string | null;
    description: string | null;
    paymentMode: string | null;
    amount: number;
}

interface TransactionPageProps {
    searchParams: {
        page?: string;
        search?: string;
        type?: string;
        mode?: string;
    };
}

async function TransactionContent({ searchParams }: TransactionPageProps) {
    const page = parseInt(searchParams.page || "1");
    const search = searchParams.search || "";
    const type = searchParams.type || "all";
    const mode = searchParams.mode || "all";

    const { transactions, pagination } = await getRecentTransactions({
        page,
        limit: 20,
        search,
        type,
        mode
    });

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Receipt className="h-8 w-8 text-indigo-600" />
                        Transaction History
                    </h1>
                    <p className="text-gray-600 mt-1">View all financial transactions</p>
                </div>
                <div className="flex gap-2">
                    <ExportTransactionsButton transactions={transactions || []} />
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search receipt or family..."
                        defaultValue={search}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const val = (e.target as HTMLInputElement).value;
                                const params = new URLSearchParams(window.location.search);
                                if (val) params.set("search", val);
                                else params.delete("search");
                                params.set("page", "1");
                                window.location.href = `?${params.toString()}`;
                            }
                        }}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                        defaultValue={type}
                        onChange={(e) => {
                            const params = new URLSearchParams(window.location.search);
                            params.set("type", e.target.value);
                            params.set("page", "1");
                            window.location.href = `?${params.toString()}`;
                        }}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Types</option>
                        <option value="CREDIT">Payment (Credit)</option>
                        <option value="DEBIT">Charge (Debit)</option>
                    </select>

                    <select
                        defaultValue={mode}
                        onChange={(e) => {
                            const params = new URLSearchParams(window.location.search);
                            params.set("mode", e.target.value);
                            params.set("page", "1");
                            window.location.href = `?${params.toString()}`;
                        }}
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Modes</option>
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Receipt #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Family
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase text-center">
                                Mode
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions && transactions.length > 0 ? (
                            transactions.map((txn: Transaction) => (
                                <tr key={txn.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-600">
                                        {txn.receiptNumber || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {txn.createdAt ? format(new Date(txn.createdAt), "MMM dd, yyyy HH:mm") : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${txn.type === "CREDIT"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`}>
                                            {txn.type === "CREDIT" ? (
                                                <ArrowUpCircle className="h-3 w-3" />
                                            ) : (
                                                <ArrowDownCircle className="h-3 w-3" />
                                            )}
                                            {txn.type === "CREDIT" ? "Credit" : "Debit"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {txn.fatherName || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {txn.description || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        {txn.paymentMode ? (
                                            <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold uppercase tracking-wider">
                                                {txn.paymentMode}
                                            </span>
                                        ) : "-"}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${txn.type === "CREDIT" ? "text-green-600" : "text-red-600"
                                        }`}>
                                        {txn.type === "CREDIT" ? "+" : "-"}₹{txn.amount}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-lg font-medium">No transactions matching filters</p>
                                    <p className="text-sm">Try adjusting your filters or search term.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="mt-6">
                    <PaginationControls
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        total={pagination.total}
                        limit={pagination.limit}
                    />
                </div>
            )}
        </>
    );
}

export default async function TransactionHistoryPage({ searchParams }: TransactionPageProps) {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Suspense fallback={<TableSkeleton rows={10} columns={7} />}>
                <TransactionContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
