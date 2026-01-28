"use client";

import { useState, useEffect, memo, useCallback } from "react";
import {
    Users,
    Search,
    Phone,
    CreditCard,
    Filter,
    MessageSquare,
    Wallet
} from "lucide-react";
import { PaginationControls } from "@/components/PaginationControls";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { QuickPaymentDialog } from "@/components/QuickPaymentDialog";
import { GlassCard } from "@/components/modern/Card";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";

interface Family {
    id: number;
    fatherName: string | null;
    phone: string | null;
    balance: number;
    studentCount: number;
    children?: {
        id: number;
        name: string;
        class: string;
    }[];
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

// Memoized Mobile Card Component - only re-renders when family data changes
const FamilyMobileCard = memo(function FamilyMobileCard({
    family,
    onPayClick
}: {
    family: Family;
    onPayClick: (family: Family) => void;
}) {
    return (
        <div className="bg-white/40 dark:bg-slate-800/40 rounded-2xl p-4 border border-white/20 dark:border-slate-700/50">
            <div className="flex items-start justify-between mb-3">
                <Link href={`/families/${family.id}`} className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm border border-primary/20">
                            {family.studentCount}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">{family.fatherName || "Anonymous"}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {family.children?.map(child => (
                                    <span key={child.id} className="text-[8px] font-black bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase tracking-tighter">
                                        {child.name.split(' ')[0]}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 opacity-60">
                                <Phone className="h-3 w-3" />
                                <span className="text-[10px] font-bold text-muted-foreground">{family.phone || "-"}</span>
                            </div>
                        </div>
                    </div>
                </Link>
                <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-wider">
                    ID-{family.id.toString().padStart(4, '0')}
                </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/10 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "p-1.5 rounded-lg border",
                        family.balance < 0
                            ? 'bg-cta/10 border-cta/20 text-cta'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    )}>
                        <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                        <span className={cn(
                            "text-sm font-black tracking-tight",
                            family.balance < 0 ? 'text-cta' : 'text-emerald-500'
                        )}>
                            {formatCurrency(Math.abs(family.balance))}
                        </span>
                        <span className={cn(
                            "ml-1 text-[10px] font-bold uppercase",
                            family.balance < 0 ? 'text-cta/60' : 'text-emerald-500/60'
                        )}>
                            {family.balance < 0 ? 'Due' : 'Credit'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toast.info("Reminder system coming soon")}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl transition-all border border-white/20"
                    >
                        <MessageSquare className="h-4 w-4" />
                    </button>
                    <Button
                        size="sm"
                        variant="glass"
                        className="text-primary hover:bg-primary hover:text-white border-primary/20"
                        onClick={() => onPayClick(family)}
                    >
                        <CreditCard className="h-3.5 w-3.5 mr-1" />
                        Pay
                    </Button>
                </div>
            </div>
        </div>
    );
});

// Memoized Desktop Table Row Component - only re-renders when family data changes
const FamilyTableRow = memo(function FamilyTableRow({
    family,
    onPayClick
}: {
    family: Family;
    onPayClick: (family: Family) => void;
}) {
    return (
        <tr className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-300 group">
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black bg-slate-100 dark:bg-slate-800/50 text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                    ID-{family.id.toString().padStart(4, '0')}
                </span>
            </td>
            <td className="px-6 py-4">
                <Link href={`/families/${family.id}`} className="block group/link">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground group-hover/link:text-primary transition-colors">
                            {family.fatherName || "Anonymous"}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {family.children?.map(child => (
                                <span key={child.id} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                    {child.name}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-muted-foreground/60 tracking-wider">
                            <Phone className="h-3 w-3 opacity-40" />
                            {family.phone || "-"}
                        </div>
                    </div>
                </Link>
            </td>
            <td className="px-6 py-4 text-center">
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary text-xs font-black border border-primary/20 shadow-sm">
                    {family.studentCount}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-xl border shadow-sm",
                        family.balance < 0
                            ? 'bg-cta/10 border-cta/20 text-cta'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    )}>
                        <Wallet className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className={cn(
                            "text-sm font-black tracking-tight",
                            family.balance < 0 ? 'text-cta' : 'text-emerald-500'
                        )}>
                            {family.balance < 0 ? '-' : ''} {formatCurrency(Math.abs(family.balance))}
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-wider">
                            {family.balance < 0 ? 'Due' : 'Balance'}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => toast.info("Reminder system coming soon")}
                        className="p-2.5 text-muted-foreground hover:text-primary hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl transition-all border border-transparent hover:border-white/40 shadow-none hover:shadow-lg"
                        title="Push Notification"
                    >
                        <MessageSquare className="h-4 w-4" />
                    </button>
                    <Button
                        size="sm"
                        variant="glass"
                        className="text-primary hover:bg-primary hover:text-white border-primary/20 px-4"
                        onClick={() => onPayClick(family)}
                    >
                        <CreditCard className="h-3.5 w-3.5 mr-2" />
                        Pay
                    </Button>
                </div>
            </td>
        </tr>
    );
});



export function FamiliesTable({ families, pagination }: FamiliesTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");
    const debouncedSearch = useDebounce(searchTerm, 300);

    // Payment Dialog State
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);

    // Memoized callback to prevent re-renders of child components
    const handlePayClick = useCallback((family: Family) => {
        setSelectedFamily(family);
        setPaymentOpen(true);
    }, []);

    const handlePaymentSuccess = useCallback(() => {
        router.refresh(); // Refresh to update family balance
    }, [router]);

    // Update URL when debounced search changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        const currentSearch = searchParams?.get("search") || "";

        if (debouncedSearch !== currentSearch) {
            if (debouncedSearch) {
                params.set("search", debouncedSearch);
            } else {
                params.delete("search");
            }
            params.set("page", "1"); // Reset to first page on search
            router.push(`?${params.toString()}`);
        }
    }, [debouncedSearch, router, searchParams]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Filters Row */}
            <GlassCard className="p-6" intensity="medium">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full md:max-w-lg group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Find by name, phone or children name..."
                            className="pl-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="glass" size="lg" className="rounded-2xl border-white/40">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                        <Link href="/admission" className="flex-1 md:flex-none">
                            <Button variant="primary" size="lg" className="rounded-2xl shadow-primary/20 shadow-xl w-full">
                                <Users className="h-4 w-4 mr-2" />
                                New Admission
                            </Button>
                        </Link>
                    </div>
                </div>
            </GlassCard>

            {/* Families List/Table */}
            <GlassCard className="overflow-hidden border-white/20" intensity="low">
                {families.length === 0 ? (
                    <div className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40">
                            <Users className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Zero Matrix Links</h3>
                            <p className="text-muted-foreground text-xs max-w-xs mx-auto mt-2 font-bold leading-relaxed uppercase tracking-widest">
                                The search query yielded no results from the family node database.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card Layout */}
                        <div className="md:hidden space-y-3 p-4">
                            {families.map((family) => (
                                <FamilyMobileCard
                                    key={family.id}
                                    family={family}
                                    onPayClick={handlePayClick}
                                />
                            ))}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/30 dark:bg-slate-900/30 border-b border-white/10 dark:border-slate-800/50">
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Matrix ID</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">HOD Details</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Nodes</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Financial Pulse</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 dark:divide-slate-800/50">
                                    {families.map((family) => (
                                        <FamilyTableRow
                                            key={family.id}
                                            family={family}
                                            onPayClick={handlePayClick}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="p-6 border-t border-white/10 dark:border-slate-800/50 bg-white/10 dark:bg-slate-950/20">
                        <PaginationControls
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            total={pagination.total}
                            limit={pagination.limit}
                        />
                    </div>
                )}
            </GlassCard>

            {/* Quick Payment Dialog */}
            {
                selectedFamily && (
                    <QuickPaymentDialog
                        open={paymentOpen}
                        onClose={() => {
                            setPaymentOpen(false);
                            setSelectedFamily(null);
                        }}
                        familyId={selectedFamily.id}
                        familyName={selectedFamily.fatherName || "Family"}
                        familyPhone={selectedFamily.phone || "N/A"}
                        currentDue={selectedFamily.balance < 0 ? Math.abs(selectedFamily.balance) : 0}
                        onSuccess={handlePaymentSuccess}
                    />
                )
            }
        </div >
    );
}
