import { getRecentTransactions } from "@/actions/billing";
import { format } from "date-fns";
import { Receipt, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { ExportTransactionsButton } from "./export-button";

export default async function TransactionHistoryPage() {
    const { transactions } = await getRecentTransactions(100);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Receipt className="h-8 w-8 text-indigo-600" />
                        Transaction History
                    </h1>
                    <p className="text-gray-600 mt-1">View all financial transactions</p>
                </div>
                <ExportTransactionsButton transactions={transactions || []} />
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Mode
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions && transactions.length > 0 ? (
                            transactions.map((txn: any) => (
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
                                            {txn.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {txn.fatherName || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {txn.description || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {txn.paymentMode || "-"}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${txn.type === "CREDIT" ? "text-green-600" : "text-red-600"
                                        }`}>
                                        {txn.type === "CREDIT" ? "+" : "-"}₹{txn.amount}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-lg font-medium">No transactions yet</p>
                                    <p className="text-sm">Transactions will appear here after payments are made.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
