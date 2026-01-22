import { notFound } from "next/navigation";
import { getStudentById, getFamilyFeeHistory, getStudentEnrollments, getStudentAttendance } from "@/actions/student";
import { Users, Phone, GraduationCap, Home, ArrowLeft, Receipt, Calendar, CreditCard, Wallet, Clock, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/modern/Button";
import { GlassCard } from "@/components/modern/Card";
import { format } from "date-fns";
import { StudentQuickActions } from "./StudentQuickActions";
import { cn, formatCurrency } from "@/lib/utils";

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
        <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <Link href="/students">
                    <Button variant="glass" size="sm" className="rounded-xl border-white/20">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Pulse List
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Profile Status</p>
                        <p className="text-sm font-bold text-foreground">Fully Synced</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Identity */}
                <div className="lg:col-span-1 space-y-8">
                    <GlassCard className="p-8 text-center" intensity="high">
                        <div className="relative inline-block mb-6">
                            <div className="h-24 w-24 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-3xl font-black shadow-2xl shadow-primary/20">
                                {student.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className={cn(
                                "absolute -bottom-2 -right-2 h-8 w-8 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center",
                                student.isActive ? "bg-emerald-500" : "bg-slate-500"
                            )}>
                                {student.isActive ? <Activity className="h-4 w-4 text-white" /> : <Clock className="h-4 w-4 text-white" />}
                            </div>
                        </div>

                        <h1 className="text-2xl font-black tracking-tight text-foreground mb-1">
                            {student.name}
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-6">
                            ID • {student.id.toString().padStart(6, '0')}
                        </p>

                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {student.class} Student
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 dark:border-slate-800/50 space-y-4">
                            <div className="flex items-center justify-between text-left">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Family Link</span>
                                <span className="text-xs font-bold text-foreground">#{student.familyId}</span>
                            </div>
                            <div className="flex items-center justify-between text-left">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Phone Matrix</span>
                                <span className="text-xs font-bold text-foreground">{student.phone || "N/A"}</span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Financial Pulse */}
                    <GlassCard
                        className={cn(
                            "p-6 border-2",
                            balance < 0 ? "border-cta/20 bg-cta/5" : "border-emerald-500/20 bg-emerald-500/5"
                        )}
                        intensity="medium"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={cn(
                                "p-2 rounded-xl border",
                                balance < 0 ? "bg-cta/10 border-cta/20 text-cta" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            )}>
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Current Status</p>
                                <p className={cn(
                                    "text-xs font-bold",
                                    balance < 0 ? "text-cta" : "text-emerald-500"
                                )}>
                                    {balance < 0 ? "Outstanding" : "In Credit"}
                                </p>
                            </div>
                        </div>
                        <h3 className={cn(
                            "text-3xl font-black tracking-tighter",
                            balance < 0 ? "text-cta" : "text-emerald-500"
                        )}>
                            {formatCurrency(Math.abs(balance))}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">
                            Available Liquidity
                        </p>
                    </GlassCard>
                </div>

                {/* Right Column: Detailed Telemetry */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <GlassCard className="p-6" intensity="low">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 mb-6">
                                <Users className="h-4 w-4 text-primary" />
                                Entity Details
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-white/20 dark:border-slate-800/50">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Legal Name</label>
                                    <p className="text-sm font-bold text-foreground mt-0.5">{student.name}</p>
                                </div>
                                <div className="p-4 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-white/20 dark:border-slate-800/50">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Paternal Link</label>
                                    <p className="text-sm font-bold text-foreground mt-0.5">{student.fatherName}</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6" intensity="low">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 mb-6">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                Academic Pulse
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-white/20 dark:border-slate-800/50">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Current Tier</label>
                                    <p className="text-sm font-bold text-foreground mt-0.5">{student.class}</p>
                                </div>
                                <div className="p-4 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-white/20 dark:border-slate-800/50">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Enrollment Phase</label>
                                    <p className="text-sm font-bold text-foreground mt-0.5">
                                        {student.isActive ? "Active Deployment" : "Dormant State"}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Quick Actions Integration */}
                    <GlassCard className="p-6 overflow-hidden relative" intensity="medium">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-[4] rotate-12">
                            <Activity className="h-16 w-16" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-foreground mb-2">Neural Link Actions</h2>
                        <p className="text-xs text-muted-foreground mb-4">Execute high-priority operations on this student profile.</p>
                        <StudentQuickActions
                            studentDbId={student.id}
                            studentName={student.name}
                            studentClass={student.class}
                            familyId={student.familyId}
                            fatherName={student.fatherName || "Family"}
                            balance={balance}
                        />
                    </GlassCard>

                    {/* Enrolled Batches */}
                    {enrollments.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 ml-1">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                Active Batch Matrix
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {enrollments.map((enrollment) => (
                                    <GlassCard
                                        key={enrollment.id}
                                        className={cn(
                                            "p-4 border-l-4",
                                            enrollment.isActive ? 'border-l-primary bg-primary/5' : 'border-l-muted-foreground bg-muted/5'
                                        )}
                                        intensity="low"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-bold text-foreground">{enrollment.batchName}</p>
                                            <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded-lg bg-primary/10">
                                                {formatCurrency(enrollment.fee)}/mo
                                            </span>
                                        </div>
                                        {enrollment.schedule && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                <Clock className="h-3 w-3" />
                                                {enrollment.schedule}
                                            </div>
                                        )}
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tabs / Tables Section */}
                    <div className="space-y-8 mt-12">
                        {/* Attendance History */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 ml-1">
                                <Clock className="h-4 w-4 text-primary" />
                                Attendance Telemetry
                            </h2>
                            <GlassCard className="overflow-hidden" intensity="low">
                                {attendance.length === 0 ? (
                                    <div className="py-12 text-center opacity-40">
                                        <Clock className="h-12 w-12 mx-auto mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Telemetry Recorded</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 p-2">
                                        {attendance.map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-4 bg-white/20 dark:bg-slate-900/20 rounded-xl border border-white/10 dark:border-slate-800/50">
                                                <div>
                                                    <p className="text-xs font-bold text-foreground">{format(new Date(record.date), "MMM dd, yyyy")}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{record.batchName}</p>
                                                </div>
                                                <span className={cn(
                                                    "px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border",
                                                    record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        record.status === 'Absent' ? 'bg-cta/10 text-cta border-cta/20' :
                                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                )}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </div>

                        {/* Fee History */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 ml-1">
                                <Receipt className="h-4 w-4 text-primary" />
                                Financial History
                            </h2>
                            <GlassCard className="overflow-hidden" intensity="low">
                                {transactions.length === 0 ? (
                                    <div className="py-12 text-center opacity-40">
                                        <Receipt className="h-12 w-12 mx-auto mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Transactions Logs</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white/30 dark:bg-slate-900/30 border-b border-white/10 dark:border-slate-800/50">
                                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Timestamp</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Vector</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Mode</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 dark:divide-slate-800/50">
                                                {transactions.slice(0, 10).map((txn) => (
                                                    <tr key={txn.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-300">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                                                <Calendar className="h-3.5 w-3.5 text-primary opacity-40" />
                                                                {format(new Date(txn.createdAt), "MMM dd, yyyy")}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={cn(
                                                                "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg border",
                                                                txn.type === "CREDIT" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-cta/10 text-cta border-cta/20"
                                                            )}>
                                                                {txn.type === "CREDIT" ? "Credit" : "Debit"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-muted-foreground">
                                                            {txn.paymentMode || "System"}
                                                        </td>
                                                        <td className={cn(
                                                            "px-6 py-4 whitespace-nowrap text-sm font-black text-right",
                                                            txn.type === "CREDIT" ? "text-emerald-500" : "text-cta"
                                                        )}>
                                                            {txn.type === "CREDIT" ? "+" : "-"}{formatCurrency(txn.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
