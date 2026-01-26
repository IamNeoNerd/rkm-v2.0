"use client";

import { useState, useEffect } from "react";
import { Users, Phone, GraduationCap, Filter, X, IndianRupee, Search, MessageSquare } from "lucide-react";
import { PaginationControls } from "@/components/PaginationControls";
import Link from "next/link";
import { GlassCard } from "@/components/modern/Card";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { QuickPaymentDialog } from "@/components/QuickPaymentDialog";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Student = {
    id: number;
    name: string;
    class: string;
    fatherName: string | null;
    phone: string | null;
    isActive: boolean;
    familyId?: number;
    balance?: number | null;
};

interface StudentsTableProps {
    students: Student[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function StudentsTable({ students, pagination }: StudentsTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get filters from URL
    const currentSearch = searchParams?.get("search") || "";
    const classFilter = searchParams?.get("class") || "all";
    const statusFilter = searchParams?.get("status") || "all";

    const [searchTerm, setSearchTerm] = useState(currentSearch);

    // Get unique classes for filter dropdown (from current page data)
    const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort();

    // Payment dialog state
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Debounce search update to URL
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTerm !== currentSearch) {
                const params = new URLSearchParams(searchParams?.toString() || "");
                if (searchTerm) {
                    params.set("search", searchTerm);
                } else {
                    params.delete("search");
                }
                params.set("page", "1"); // Reset to page 1 on search
                router.push(`?${params.toString()}`);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, currentSearch, router, searchParams]);

    const handleClassChange = (newClass: string) => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (newClass === 'all') {
            params.delete('class');
        } else {
            params.set('class', newClass);
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const handleStatusChange = (newStatus: string) => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (newStatus === 'all') {
            params.delete('status');
        } else {
            params.set('status', newStatus);
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const filteredStudents = students;
    const hasActiveFilters = searchTerm || classFilter !== "all" || statusFilter !== "all";

    const clearFilters = () => {
        setSearchTerm("");
        router.push(window.location.pathname);
    };

    const handlePayClick = (student: Student) => {
        setSelectedStudent(student);
        setPaymentOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Filter Controls */}
            <GlassCard className="p-6" intensity="medium">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Filter className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
                            Refine Database
                        </h2>
                    </div>
                    {hasActiveFilters && (
                        <Button
                            variant="glass"
                            size="sm"
                            onClick={clearFilters}
                            className="text-red-500 hover:text-red-600 border-red-500/20"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Matrix
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                            Search Pulsar
                        </label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Name, father, or phone..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="pl-11"
                            />
                        </div>
                    </div>

                    {/* Class Filter */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                            Academic Tier
                        </label>
                        <select
                            value={classFilter}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="w-full bg-white/40 dark:bg-slate-900/40 border-2 border-white/40 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-bold uppercase tracking-widest transition-all outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 appearance-none"
                        >
                            <option value="all">All Tiers</option>
                            {uniqueClasses.map((cls: string) => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                            Enrollment Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full bg-white/40 dark:bg-slate-900/40 border-2 border-white/40 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-bold uppercase tracking-widest transition-all outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 appearance-none"
                        >
                            <option value="all">All States</option>
                            <option value="active">Active Pulses</option>
                            <option value="inactive">Dormant</option>
                        </select>
                    </div>
                </div>

                {/* Filter Results Count */}
                <div className="mt-6 pt-6 border-t border-white/10 dark:border-slate-800/50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <div>
                        Showing <span className="text-primary">{filteredStudents.length}</span> entities
                    </div>
                </div>
            </GlassCard>

            {/* Students Table */}
            <GlassCard className="overflow-hidden border-white/20" intensity="low">
                {filteredStudents.length === 0 ? (
                    <div className="py-24 text-center">
                        <Users className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-foreground">No Records Detected</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                            The requested search parameters returned zero results from the pulsar database.
                        </p>
                        {hasActiveFilters && (
                            <Button
                                variant="glass"
                                onClick={clearFilters}
                                className="mt-6"
                            >
                                Reset Search Parameters
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile Card Layout */}
                        <div className="md:hidden space-y-3 p-4">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className="bg-white/40 dark:bg-slate-800/40 rounded-2xl p-4 border border-white/20 dark:border-slate-700/50"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <Link href={`/students/${student.id}`} className="flex items-center gap-3 flex-1">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm border border-primary/20">
                                                {student.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{student.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <GraduationCap className="h-3 w-3 text-primary opacity-60" />
                                                    <span className="text-xs font-bold text-muted-foreground">{student.class}</span>
                                                </div>
                                            </div>
                                        </Link>
                                        <span
                                            className={cn(
                                                "px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border",
                                                student.isActive
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                    : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                            )}
                                        >
                                            {student.isActive ? "Active" : "Dormant"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/10 dark:border-slate-700/50">
                                        <div className="flex gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Guardian</p>
                                                <p className="text-xs font-bold text-foreground">{student.fatherName || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Contact</p>
                                                <p className="text-xs font-bold text-muted-foreground">{student.phone || "---"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => import("sonner").then(m => m.toast.info("Reminder system coming in Phase 4"))}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl transition-all border border-white/20"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </button>
                                            <Button
                                                size="sm"
                                                variant="glass"
                                                className="text-primary hover:bg-primary hover:text-white border-primary/20"
                                                onClick={() => handlePayClick(student)}
                                            >
                                                <IndianRupee className="h-3.5 w-3.5 mr-1" />
                                                Pay
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/30 dark:bg-slate-900/30 border-b border-white/10 dark:border-slate-800/50">
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Student Identity</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tier</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Paternal Link</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Contact</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 dark:divide-slate-800/50">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-300 group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link href={`/students/${student.id}`} className="block">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20 group-hover:scale-110 transition-transform">
                                                            {student.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                            {student.name}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                    <GraduationCap className="h-4 w-4 text-primary opacity-60" />
                                                    {student.class}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-muted-foreground">
                                                {student.fatherName || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                    <Phone className="h-3.5 w-3.5 opacity-40" />
                                                    {student.phone || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={cn(
                                                        "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border",
                                                        student.isActive
                                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                            : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                                    )}
                                                >
                                                    {student.isActive ? "Active" : "Dormant"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => import("sonner").then(m => m.toast.info("Reminder system coming in Phase 4"))}
                                                        className="p-2.5 text-muted-foreground hover:text-primary hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl transition-all border border-transparent hover:border-white/40"
                                                        title="Push Notification"
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                    </button>
                                                    <Button
                                                        size="sm"
                                                        variant="glass"
                                                        className="text-primary hover:bg-primary hover:text-white border-primary/20"
                                                        onClick={() => handlePayClick(student)}
                                                    >
                                                        <IndianRupee className="h-3.5 w-3.5 mr-2" />
                                                        Collect
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Pagination Controls */}
                {pagination && (
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
            {selectedStudent && (
                <QuickPaymentDialog
                    open={paymentOpen}
                    onClose={() => {
                        setPaymentOpen(false);
                        setSelectedStudent(null);
                    }}
                    familyId={selectedStudent.familyId || 0}
                    familyName={selectedStudent.fatherName || "Family"}
                    familyPhone={selectedStudent.phone || "N/A"}
                    studentName={selectedStudent.name}
                    currentDue={selectedStudent.balance ? Math.abs(selectedStudent.balance) : 0}
                />
            )}
        </div>
    );
}

