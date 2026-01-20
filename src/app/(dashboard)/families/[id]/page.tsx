
import { getFamilyById } from "@/actions/families";
import { formatCurrency } from "@/lib/utils";
import {
    Users,
    Phone,
    ChevronLeft,
    CreditCard,
    IndianRupee,
    Receipt,
    History,
    GraduationCap,
    Calendar,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Family Profile | RK Institute",
    description: "Manage family settings, student enrollments and fee payments.",
};

interface FamilyPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function FamilyDetailPage({ params }: FamilyPageProps) {
    const { id } = await params;
    const familyId = parseInt(id);
    const result = await getFamilyById(familyId);

    if (result.error || !result.family) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <Users className="h-10 w-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Family Not Found</h2>
                <p className="text-slate-500 mt-2 max-w-sm">
                    The family record you are looking for doesn&apos;t exist or you don&apos;t have permission to view it.
                </p>
                <Link href="/families" className="mt-6 text-indigo-600 hover:text-indigo-700 font-medium">
                    &larr; Back to Management
                </Link>
            </div>
        );
    }

    const { family, students, transactions } = result;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Link
                    href="/families"
                    className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-indigo-600 shadow-sm md:shadow-none"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Family Profile</h1>
                    <p className="text-slate-500 text-sm">Family ID: #{family.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Family Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                            <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                                <Users className="h-10 w-10" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{family.fatherName}</h2>
                            <div className="flex items-center gap-2 text-slate-500 mt-1">
                                <Phone className="h-4 w-4" />
                                <span>{family.phone}</span>
                            </div>
                        </div>

                        <div className="py-6 space-y-4">
                            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Account Balance</span>
                                    <span className={`text-2xl font-black mt-1 ${family.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {formatCurrency(Math.abs(family.balance))}
                                    </span>
                                </div>
                                <div className={`p-2 rounded-lg ${family.balance < 0 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                                    <IndianRupee className={`h-6 w-6 ${family.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`} />
                                </div>
                            </div>

                            {family.balance < 0 && (
                                <p className="text-xs text-center text-red-500 font-medium bg-red-50 p-2 rounded-lg animate-pulse">
                                    ⚠️ Outstanding balance of {formatCurrency(Math.abs(family.balance))} needs attention.
                                </p>
                            )}

                            <Link href={`/fees?family=${family.id}`} className="block">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl text-base font-bold shadow-lg shadow-indigo-100">
                                    <IndianRupee className="h-5 w-5 mr-2" />
                                    Collect Payment
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <GraduationCap className="h-5 w-5 text-indigo-500 mb-2" />
                            <div className="text-2xl font-bold">{students.length}</div>
                            <div className="text-xs text-slate-500">Students</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <History className="h-5 w-5 text-indigo-500 mb-2" />
                            <div className="text-2xl font-bold">{transactions.length}</div>
                            <div className="text-xs text-slate-500">Records</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Students & Transactions */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="students" className="w-full">
                        <TabsList className="bg-white p-1 rounded-xl border border-slate-200 mb-6 h-auto">
                            <TabsTrigger value="students" className="rounded-lg py-2.5 font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Family Students
                            </TabsTrigger>
                            <TabsTrigger value="transactions" className="rounded-lg py-2.5 font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                                <Receipt className="h-4 w-4 mr-2" />
                                Transaction Log
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="students" className="space-y-4 focus-visible:outline-none">
                            {students.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                    <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500">No students found for this family.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {students.map((student) => (
                                        <Link
                                            key={student.id}
                                            href={`/students/${student.id}`}
                                            className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    <GraduationCap className="h-6 w-6" />
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${student.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'}`}>
                                                    {student.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                                            <p className="text-slate-500 text-sm font-medium">Class: {student.class}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="transactions" className="focus-visible:outline-none">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                {transactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                                        <p className="text-slate-500">No transaction logs available.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {transactions.map((txn) => (
                                                    <tr key={txn.id} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900">
                                                                    {format(new Date(txn.createdAt), "dd MMM yyyy")}
                                                                </span>
                                                                <span className="text-[10px] font-medium text-slate-400">
                                                                    {txn.paymentMode || 'N/A'} • #{txn.id}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${txn.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                                                                {txn.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`text-sm font-black ${txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                                                {txn.type === 'CREDIT' ? '+' : '-'} {formatCurrency(txn.amount)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

