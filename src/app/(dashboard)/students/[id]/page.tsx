import { notFound } from "next/navigation";
import { getStudentById, getFamilyFeeHistory, getStudentEnrollments, getStudentAttendance } from "@/actions/student";
import { Users, Phone, GraduationCap, Home, ArrowLeft, Receipt, Calendar, CreditCard, Wallet, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { student } = await getStudentById(parseInt(id));

    if (!student) {
        notFound();
    }

    const { transactions, balance } = await getFamilyFeeHistory(student.familyId);
    const { enrollments } = await getStudentEnrollments(parseInt(id));
    const { attendance } = await getStudentAttendance(parseInt(id));

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <Link href="/students">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Students
                </Button>
            </Link>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                {/* Header */}
                <div className="border-b pb-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {student.name}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Student ID: #{student.id}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${student.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {student.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Student & Family Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            Student Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Class</label>
                                <div className="flex items-center mt-1">
                                    <GraduationCap className="h-4 w-4 mr-2 text-indigo-600" />
                                    <p className="text-gray-900 font-medium">{student.class}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <p className="text-gray-900 mt-1">
                                    {student.isActive ? "Currently Enrolled" : "Not Enrolled"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Home className="h-5 w-5 text-indigo-600" />
                            Family Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Father&apos;s Name</label>
                                <p className="text-gray-900 mt-1 font-medium">{student.fatherName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Contact</label>
                                <div className="flex items-center mt-1">
                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                    <p className="text-gray-900">{student.phone}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Family ID</label>
                                <p className="text-gray-900 mt-1">#{student.familyId}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance Summary Card */}
                <div className={`p-4 rounded-lg mb-6 ${balance < 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wallet className={`h-5 w-5 ${balance < 0 ? 'text-red-600' : 'text-green-600'}`} />
                            <span className={`text-sm font-medium ${balance < 0 ? 'text-red-700' : 'text-green-700'}`}>
                                {balance < 0 ? 'Amount Due' : 'Balance'}
                            </span>
                        </div>
                        <span className={`text-2xl font-bold ${balance < 0 ? 'text-red-700' : 'text-green-700'}`}>
                            ₹{Math.abs(balance)}
                        </span>
                    </div>
                </div>

                {/* Enrolled Batches */}
                {enrollments.length > 0 && (
                    <div className="border-t pt-6 mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <GraduationCap className="h-5 w-5 text-indigo-600" />
                            Enrolled Batches
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {enrollments.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className={`p-3 rounded-lg border ${enrollment.isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{enrollment.batchName}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-indigo-600">₹{enrollment.fee}/mo</span>
                                    </div>
                                    {enrollment.schedule && (
                                        <p className="text-xs text-gray-500 mt-1">{enrollment.schedule}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attendance History */}
                <div className="border-t pt-6 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        Attendance History
                    </h2>
                    {attendance.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No attendance records found.</p>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                {attendance.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-900">{format(new Date(record.date), "MMM dd, yyyy")}</p>
                                            <p className="text-xs text-gray-500">{record.batchName}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Fee History */}
                <div className="border-t pt-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Receipt className="h-5 w-5 text-indigo-600" />
                        Payment History
                    </h2>

                    {transactions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No payment history yet.</p>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.map((txn) => (
                                            <tr key={txn.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {format(new Date(txn.createdAt), "MMM dd, yyyy")}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${txn.type === "CREDIT" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                        {txn.type === "CREDIT" ? "Payment" : "Charge"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {txn.description || txn.category || "-"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {txn.paymentMode || "-"}
                                                </td>
                                                <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${txn.type === "CREDIT" ? "text-green-700" : "text-red-700"}`}>
                                                    {txn.type === "CREDIT" ? "+" : "-"}₹{txn.amount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card Layout */}
                            <div className="sm:hidden space-y-3">
                                {transactions.map((txn) => (
                                    <div key={txn.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {format(new Date(txn.createdAt), "MMM dd, yyyy")}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded ${txn.type === "CREDIT" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {txn.type === "CREDIT" ? "Payment" : "Charge"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{txn.description || txn.category || "-"}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <CreditCard className="h-3 w-3" />
                                                {txn.paymentMode || "-"}
                                            </div>
                                            <span className={`font-bold ${txn.type === "CREDIT" ? "text-green-700" : "text-red-700"}`}>
                                                {txn.type === "CREDIT" ? "+" : "-"}₹{txn.amount}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="border-t pt-6 mt-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link href={`/academics`}>
                            <Button variant="outline">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Enroll in Batch
                            </Button>
                        </Link>
                        <Link href={`/fees?familyId=${student.familyId}`}>
                            <Button variant="outline">
                                <Receipt className="h-4 w-4 mr-2" />
                                Collect Fee
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
