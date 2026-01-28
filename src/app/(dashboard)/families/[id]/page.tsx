import { getFamilyById } from "@/actions/families";
import { formatCurrency, cn } from "@/lib/utils";
import {
    Users,
    Phone,
    Receipt,
    History,
    GraduationCap,
    ArrowLeft,
    Shield,
    Wallet
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/modern/Button";
import { GlassCard } from "@/components/modern/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Metadata } from "next";
import { FamilyQuickActions } from "./FamilyQuickActions";

export const metadata: Metadata = {
    title: "Family Profile | RKM 3.0",
    description: "High-end management matrix for family nodes and financial telemetry.",
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
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in duration-500">
                <GlassCard className="p-12 max-w-md border-red-500/20 bg-red-500/5">
                    <div className="bg-red-500/10 p-4 rounded-3xl mb-6 mx-auto w-fit border border-red-500/20 text-red-500">
                        <Users className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground">Node Not Found</h2>
                    <p className="text-muted-foreground mt-4 text-xs font-bold leading-relaxed uppercase tracking-widest">
                        The requested family matrix identifier does not exist in the pulsar database.
                    </p>
                    <Link href="/families" className="mt-8 block">
                        <Button variant="glass" className="w-full">
                            &larr; Return to Matrix
                        </Button>
                    </Link>
                </GlassCard>
            </div>
        );
    }

    const { family, students, transactions } = result;
    type StudentType = NonNullable<typeof students>[number];
    type TransactionType = NonNullable<typeof transactions>[number];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-6">
                <Link
                    href="/families"
                    className="p-3 bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all text-muted-foreground hover:text-primary border border-white/40 dark:border-slate-800 shadow-sm"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tighter">Family Profile</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-1">ID • {family.id.toString().padStart(6, '0')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Family Meta */}
                <div className="lg:col-span-1 space-y-8">
                    <GlassCard className="p-8 text-center" intensity="high">
                        <div className="flex flex-col items-center pb-8 border-b border-white/10 dark:border-slate-800/50">
                            <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 text-primary border-2 border-primary/20 shadow-2xl shadow-primary/20">
                                <Users className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-foreground">{family.fatherName}</h2>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-2">
                                <Phone className="h-3.5 w-3.5 opacity-40" />
                                <span>{family.phone}</span>
                            </div>
                        </div>

                        <div className="py-8 space-y-6 text-left">
                            <div className={cn(
                                "flex flex-col p-6 rounded-3xl border-2 transition-all",
                                family.balance < 0
                                    ? 'bg-cta/5 border-cta/20 text-cta'
                                    : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                            )}>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Account Balance</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black tracking-tighter">
                                        {formatCurrency(Math.abs(family.balance))}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className={cn(
                                        "p-1.5 rounded-lg border",
                                        family.balance < 0 ? 'bg-cta/10 border-cta/20' : 'bg-emerald-500/10 border-emerald-500/20'
                                    )}>
                                        <Wallet className="h-4 w-4" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">
                                        {family.balance < 0 ? 'Outstanding Debt' : 'Liquid Assets'}
                                    </p>
                                </div>
                            </div>

                            {family.balance < 0 && (
                                <GlassCard className="p-4 border-cta/30 bg-cta/10 flex items-center gap-3 animate-pulse" intensity="medium">
                                    <Shield className="h-4 w-4 text-cta" />
                                    <p className="text-[9px] font-bold text-cta uppercase tracking-widest leading-relaxed">
                                        Attention Required: Account requires reconciliation immediately.
                                    </p>
                                </GlassCard>
                            )}

                            {/* Quick Actions Section */}
                            <div className="space-y-3 pt-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Quick Actions</h3>
                                <FamilyQuickActions
                                    familyId={family.id}
                                    familyName={family.fatherName}
                                    familyPhone={family.phone}
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Quick Stats Matrix */}
                    <div className="grid grid-cols-2 gap-4">
                        <GlassCard className="p-6 text-center" intensity="medium">
                            <GraduationCap className="h-5 w-5 text-primary mx-auto mb-3" />
                            <div className="text-2xl font-black text-foreground">{students.length}</div>
                            <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mt-1">Nodes</div>
                        </GlassCard>
                        <GlassCard className="p-6 text-center" intensity="medium">
                            <History className="h-5 w-5 text-primary mx-auto mb-3" />
                            <div className="text-2xl font-black text-foreground">{transactions.length}</div>
                            <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mt-1">Logs</div>
                        </GlassCard>
                    </div>
                </div>

                {/* Right Column: Linked Nodes & Activity Logs */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="students" className="w-full">
                        <TabsList className="bg-white/40 dark:bg-slate-900/40 p-1.5 rounded-[1.5rem] border border-white/40 dark:border-slate-800 mb-8 h-auto grid grid-cols-2">
                            <TabsTrigger value="students" className="rounded-2xl py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-all data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-primary/20">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Family Nodes
                            </TabsTrigger>
                            <TabsTrigger value="transactions" className="rounded-2xl py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-all data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-primary/20">
                                <Receipt className="h-4 w-4 mr-2" />
                                Telemetry Logs
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="students" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
                            {students.length === 0 ? (
                                <GlassCard className="p-16 text-center border-dashed" intensity="low">
                                    <GraduationCap className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">No Active Student Nodes Linked</p>
                                </GlassCard>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {students.map((student: StudentType) => (
                                        <Link
                                            key={student.id}
                                            href={`/students/${student.id}`}
                                            className="group"
                                        >
                                            <GlassCard className="p-6 hover:shadow-2xl transition-all duration-500 hover:border-primary/40 group-hover:-translate-y-2" intensity="low">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                                                        <GraduationCap className="h-6 w-6" />
                                                    </div>
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                        student.isActive
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                            : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                    )}>
                                                        {student.isActive ? 'Active' : 'Dormant'}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{student.name}</h3>
                                                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1">Tier • {student.class}</p>
                                            </GlassCard>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="transactions" className="focus-visible:outline-none animate-in fade-in slide-in-from-left-4 duration-500">
                            <GlassCard className="overflow-hidden" intensity="low">
                                {transactions.length === 0 ? (
                                    <div className="py-24 text-center opacity-40">
                                        <Receipt className="h-16 w-16 mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Empty Financial Matrix</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white/30 dark:bg-slate-900/30 border-b border-white/10 dark:border-slate-800/50">
                                                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Timestamp</th>
                                                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Vector</th>
                                                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 dark:divide-slate-800/50">
                                                {transactions.map((txn: TransactionType) => (
                                                    <tr key={txn.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-300">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-black text-foreground tracking-tight">
                                                                    {format(new Date(txn.createdAt), "dd MMM yyyy")}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                                                                    {txn.paymentMode || 'N/A'} • #{txn.id}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                                txn.type === 'CREDIT'
                                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                                    : 'bg-primary/10 text-primary border-primary/20'
                                                            )}>
                                                                {txn.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={cn(
                                                                "text-sm font-black tracking-tight",
                                                                txn.type === 'CREDIT' ? 'text-emerald-500' : 'text-primary'
                                                            )}>
                                                                {txn.type === 'CREDIT' ? '+' : '-'} {formatCurrency(txn.amount)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </GlassCard>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

