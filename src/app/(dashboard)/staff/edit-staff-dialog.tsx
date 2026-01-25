"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Phone, Mail, Shield, IndianRupee, Zap, Edit3, Save, KeyRound, Eye, EyeOff } from "lucide-react";
import { updateStaff, StaffRole, getStaffIdentityStatus } from "@/actions/staff";
import { getStaffRoleTypes } from "@/actions/staff-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface CustomRoleType {
    id: number;
    name: string;
}

interface EditStaffDialogProps {
    staff: {
        id: number;
        name: string;
        phone: string;
        email: string | null;
        role: string;
        roleType: string | null;
        baseSalary: number;
    };
}

export function EditStaffDialog({ staff }: EditStaffDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingIdentity, setFetchingIdentity] = useState(false);
    const [customRoleTypes, setCustomRoleTypes] = useState<CustomRoleType[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showExisting, setShowExisting] = useState(false);
    const [existingPassword, setExistingPassword] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: staff.name,
        phone: staff.phone,
        email: staff.email || "",
        role: staff.role as StaffRole,
        roleType: staff.roleType || "",
        baseSalary: staff.baseSalary.toString(),
        password: "",
        confirmPassword: "",
    });

    const loadRoleTypes = useCallback(async () => {
        const res = await getStaffRoleTypes();
        if (res.success && res.roleTypes) {
            setCustomRoleTypes(res.roleTypes);
        }
    }, []);

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                loadRoleTypes();
                setFetchingIdentity(true);
                getStaffIdentityStatus(staff.id).then(res => {
                    if (res.success && res.displayPassword) {
                        setExistingPassword(res.displayPassword);
                    }
                    setFetchingIdentity(false);
                });
            }, 0);
            return () => clearTimeout(timer);
        } else {
            setExistingPassword(null);
            setShowExisting(false);
        }
    }, [open, loadRoleTypes, staff.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match. Please enter the same password in both fields.");
            return;
        }

        setLoading(true);

        const res = await updateStaff(staff.id, {
            name: formData.name,
            phone: formData.phone,
            email: formData.email || undefined,
            role: formData.role,
            roleType: formData.roleType === "" ? null : formData.roleType,
            baseSalary: parseInt(formData.baseSalary) || 0,
            password: formData.password || undefined
        });

        setLoading(false);

        if (res.success) {
            toast.success("Personnel node recalibrated");
            setOpen(false);
            // Reset passwords on success
            setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        } else {
            toast.error(res.error || "Recalibration failed");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/50 border border-white/80 rounded-xl hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm">
                    <Edit3 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-slate-50/80 backdrop-blur-3xl border-white/20 p-0 overflow-hidden rounded-[32px] shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                <DialogHeader className="p-8 pb-4 relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <Edit3 className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                            Recalibrate Node
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Synthesizing operational parameters for ID #{staff.id.toString().padStart(4, '0')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-8 relative z-10">
                    <div className="space-y-6">
                        {/* Primary Identity Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-3 w-3 text-indigo-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Identity Data Shift</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Legal Name</Label>
                                    <Input
                                        required
                                        className="bg-white/50 border-white h-12 focus:ring-indigo-500/20 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Mobile Node</Label>
                                    <Input
                                        required
                                        className="bg-white/50 border-white h-12 focus:ring-indigo-500/20 rounded-xl font-mono text-[10px] font-bold"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Digital Identity (Email)</Label>
                                <Input
                                    type="email"
                                    className="bg-white/50 border-white h-12 focus:ring-indigo-500/20 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Operational Clearance Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-3 w-3 text-amber-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Clearance Reconfiguration</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`role-${staff.id}`} className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">System Role Vector</Label>
                                    <select
                                        id={`role-${staff.id}`}
                                        className="w-full h-12 px-4 bg-white/50 border border-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                                    >
                                        <option value="STAFF">SUPPORT STAFF / OTHER</option>
                                        <option value="TEACHER">TEACHER</option>
                                        <option value="RECEPTIONIST">RECEPTIONIST</option>
                                        <option value="ADMIN">ADMINISTRATOR</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`specialty-${staff.id}`} className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Functional Specialty</Label>
                                    <select
                                        id={`specialty-${staff.id}`}
                                        className="w-full h-12 px-4 bg-white/50 border border-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
                                        value={formData.roleType}
                                        onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                                    >
                                        <option value="">CORE PROTOCOL</option>
                                        {customRoleTypes.map((rt) => (
                                            <option key={rt.id} value={rt.name}>{rt.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Security & Access Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <KeyRound className="h-3 w-3 text-rose-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security Credentials</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <Label htmlFor={`password-${staff.id}`} className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id={`password-${staff.id}`}
                                            type={showPassword ? "text" : "password"}
                                            className="bg-white/50 border-white h-12 focus:ring-indigo-500/20 rounded-xl font-mono text-[10px] font-bold pr-10"
                                            placeholder="LEAVE BLANK TO UNCHANGED"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`confirm-${staff.id}`} className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Protocol</Label>
                                    <Input
                                        id={`confirm-${staff.id}`}
                                        type={showPassword ? "text" : "password"}
                                        className="bg-white/50 border-white h-12 focus:ring-indigo-500/20 rounded-xl font-mono text-[10px] font-bold"
                                        placeholder="REPEAT TO VALIDATE"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Admin Visibility for current password */}
                            {existingPassword && (
                                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[8px] text-amber-600 font-bold uppercase tracking-widest">
                                            Current DB Passkey
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowExisting(!showExisting)}
                                            className="text-[9px] font-bold text-amber-700 hover:underline"
                                        >
                                            {showExisting ? "Hide" : "Reveal"}
                                        </button>
                                    </div>
                                    <p className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200">
                                        {showExisting ? existingPassword : "••••••••"}
                                    </p>
                                    <p className="text-[8px] text-amber-600/70 leading-tight uppercase font-black">
                                        Entering a new password above will overwrite this record.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Financial Ledger Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <IndianRupee className="h-3 w-3 text-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ledger Recalibration</span>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-1">Base Retainer Salary</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                        type="number"
                                        required
                                        className="pl-12 bg-white/50 border-white h-12 focus:ring-indigo-500/20 rounded-xl font-mono text-sm font-bold"
                                        value={formData.baseSalary}
                                        onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-16 shadow-2xl transition-all hover:scale-[1.01] overflow-hidden group/submit"
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                {loading ? (
                                    <>
                                        <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Synchronizing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 text-indigo-400" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Commit Changes to Matrix</span>
                                    </>
                                )}
                            </div>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
