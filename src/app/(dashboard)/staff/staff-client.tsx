"use client";

import React, { useState, useMemo } from "react";
import {
    Users,
    Phone,
    Mail,
    Search,
    Filter,
    Plus,
    Activity,
    Shield,
    UserCog,
    IndianRupee,
    Calendar,
    Hash,
    MoreVertical,
    Zap,
    Cpu,
    CheckCircle2,
    XCircle,
    Edit3
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { GlassCard } from "@/components/modern/Card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/modern/Input";
import { Button } from "@/components/modern/Button";
import { AddStaffDialog } from "./add-staff-dialog";
import { EditStaffDialog } from "./edit-staff-dialog";
import { DeactivateStaffButton } from "./deactivate-staff-button";
import { StaffRoleTypesManager } from "./staff-role-types-manager";
import { purgeTestStaff } from "@/actions/staff";

interface StaffMember {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    role: string;
    roleType: string | null;
    baseSalary: number;
    isActive: boolean;
    createdAt: Date | null;
}

interface StaffClientProps {
    initialStaff: StaffMember[];
    isSuperAdmin: boolean;
}

export default function StaffClient({ initialStaff, isSuperAdmin }: StaffClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState<string>("ALL");

    const filteredStaff = useMemo(() => {
        return initialStaff.filter(member => {
            const matchesSearch =
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.phone.includes(searchQuery) ||
                (member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                member.id.toString().includes(searchQuery);

            const matchesRole = selectedRole === "ALL" || member.role === selectedRole;

            return matchesSearch && matchesRole;
        });
    }, [initialStaff, searchQuery, selectedRole]);

    const stats = useMemo(() => {
        const total = initialStaff.length;
        const active = initialStaff.filter(s => s.isActive).length;
        const teachers = initialStaff.filter(s => s.role === "TEACHER").length;
        return { total, active, teachers };
    }, [initialStaff]);

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Pulsar Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/10">
                            <Users className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                                Personnel Terminal
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
                                Strategic Identity & Access Matrix
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <StaffRoleTypesManager />
                    <AddStaffDialog />
                </div>
            </div>

            {/* Neural Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "OPERATIONAL NODES", value: stats.total, icon: Cpu, color: "text-indigo-500", accent: "bg-indigo-500/10" },
                    { label: "ACTIVE SIGNATURES", value: stats.active, icon: Activity, color: "text-emerald-500", accent: "bg-emerald-500/10" },
                    { label: "ACADEMIC STAFF", value: stats.teachers, icon: UserCog, color: "text-amber-500", accent: "bg-amber-500/10" }
                ].map((stat, idx) => (
                    <GlassCard key={idx} className="p-6 border-white/20" intensity="medium">
                        <div className="flex items-center gap-5">
                            <div className={cn("p-4 rounded-2xl shadow-lg transition-all", stat.accent, stat.color)}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight font-mono italic">{stat.value.toString().padStart(2, '0')}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Search & Filter Matrix */}
            <GlassCard className="p-6 border-white/30" intensity="high">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="OPERATIONAL SEARCH (NAME / PHONE / ID)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-14 bg-white/50 border-white/40 rounded-2xl font-black uppercase text-[10px] tracking-widest focus:ring-indigo-500/20 shadow-inner"
                        />
                    </div>
                    <div className="w-full md:w-64 relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white/50 border border-white/40 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all cursor-pointer shadow-inner"
                        >
                            <option value="ALL">ALL ROLES</option>
                            <option value="ADMIN">ADMINS</option>
                            <option value="TEACHER">TEACHERS</option>
                            <option value="RECEPTIONIST">RECEPTIONISTS</option>
                            <option value="STAFF">GENERAL STAFF</option>
                        </select>
                    </div>
                </div>
            </GlassCard>

            {/* Personnel Identity Table */}
            <GlassCard className="overflow-hidden border-white/20" intensity="low">
                {filteredStaff.length === 0 ? (
                    <div className="py-24 text-center">
                        <Users className="h-16 w-16 text-slate-300 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Zero Identities Detected</h3>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2 font-black uppercase text-[10px] tracking-widest">
                            The requested search parameters returned zero results from the pulsar database.
                        </p>
                        <Button
                            variant="glass"
                            size="sm"
                            onClick={() => { setSearchQuery(""); setSelectedRole("ALL"); }}
                            className="mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-600"
                        >
                            Abort Search Parameters
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Mobile Progressive Card Layout */}
                        <div className="md:hidden space-y-4 p-4">
                            {filteredStaff.map((employee) => (
                                <GlassCard key={employee.id} className="p-5 border-white/40 shadow-xl relative overflow-hidden group" intensity="medium">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-lg",
                                                employee.isActive ? "bg-indigo-500" : "bg-slate-400 grayscale"
                                            )}>
                                                {employee.name.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className={cn("text-sm font-black tracking-tight", employee.isActive ? "text-slate-900" : "text-slate-500")}>
                                                    {employee.name}
                                                </p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: #{employee.id.toString().padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md border",
                                            employee.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            {employee.isActive ? "Operational" : "Offline"}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10 dark:border-slate-800/50">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Security clearance</p>
                                            <p className="text-[10px] font-black text-slate-700 uppercase">{employee.role}</p>
                                            {employee.roleType && (
                                                <p className="text-[7px] font-black bg-amber-50 text-amber-600 px-1 rounded uppercase w-fit">{employee.roleType}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Monthly Retainer</p>
                                            <p className="text-[10px] font-black text-slate-900 font-mono italic">₹{employee.baseSalary.toLocaleString()}</p>
                                        </div>
                                        <div className="col-span-2 space-y-1.5 mt-1">
                                            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-600">
                                                <Phone className="h-3 w-3 text-slate-400" />
                                                {employee.phone}
                                            </div>
                                            {employee.email && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                    <Mail className="h-3 w-3 text-slate-300" />
                                                    {employee.email.toLowerCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-3 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Joined: {employee.createdAt ? format(new Date(employee.createdAt), "MMM yyyy") : "---"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <EditStaffDialog staff={employee} />
                                            {isSuperAdmin && (
                                                <DeactivateStaffButton
                                                    staffId={employee.id}
                                                    name={employee.name}
                                                    isActive={employee.isActive}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden md:block overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-900/5 dark:bg-slate-900/40 border-b border-slate-900/10 dark:border-white/10">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Personnel Identity</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security clearance</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Communication Node</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Retainer (Salary)</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
                                    {filteredStaff.map((employee) => (
                                        <React.Fragment key={employee.id}>
                                            <tr className="hover:bg-white/60 dark:hover:bg-slate-800/40 transition-all duration-300 group">
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-6",
                                                            employee.isActive ? "bg-indigo-500" : "bg-slate-400 grayscale"
                                                        )}>
                                                            {employee.name.substring(0, 1).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className={cn(
                                                                "text-sm font-black tracking-tight",
                                                                employee.isActive ? "text-slate-900" : "text-slate-500"
                                                            )}>
                                                                {employee.name}
                                                            </div>
                                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                                ID: #{employee.id.toString().padStart(4, '0')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                                                {employee.role}
                                                            </span>
                                                        </div>
                                                        {employee.roleType && (
                                                            <span className="ml-3.5 px-2 py-0.5 w-fit text-[8px] font-black uppercase tracking-tighter bg-amber-50 text-amber-600 border border-amber-100 rounded-md">
                                                                {employee.roleType}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-600">
                                                            <Phone className="h-3 w-3 text-slate-400" />
                                                            {employee.phone}
                                                        </div>
                                                        {employee.email && (
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                                <Mail className="h-3 w-3 text-slate-300" />
                                                                {employee.email.toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl w-fit border border-white/10 group-hover:border-indigo-500/30 transition-colors">
                                                        <IndianRupee className="h-3 w-3 text-amber-500" />
                                                        <span className="text-sm font-black text-white font-mono italic tracking-tighter">
                                                            ₹{employee.baseSalary.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className={cn(
                                                        "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-2 w-fit",
                                                        employee.isActive
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            : "bg-slate-50 text-slate-400 border-slate-100 opacity-60"
                                                    )}>
                                                        {employee.isActive && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                                        {employee.isActive ? "Operational" : "Deactivated"}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <EditStaffDialog staff={employee} />
                                                        {isSuperAdmin && (
                                                            <DeactivateStaffButton
                                                                staffId={employee.id}
                                                                name={employee.name}
                                                                isActive={employee.isActive}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {employee.id === filteredStaff[filteredStaff.length - 1].id && (
                                                <tr key="footer-note">
                                                    <td colSpan={6} className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/20 italic">
                                                        <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                            <Calendar className="h-3 w-3" />
                                                            Operational Node Synced: {employee.createdAt ? format(new Date(employee.createdAt), "MMM yyyy") : "N/A"}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </GlassCard>

            {/* Matrix Operational Footer */}
            <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl opacity-50" />
                <div className="relative p-8 bg-slate-950 border border-white/10 rounded-[40px] flex items-center gap-6 backdrop-blur-3xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-2xl">
                        <Cpu className="h-6 w-6 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Personnel Synchronization Priority</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed italic opacity-80">
                            [System-Note] all personnel nodes are stored in the primary pulsar database.
                            modifications synchronize with RBAC clearance protocols automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
