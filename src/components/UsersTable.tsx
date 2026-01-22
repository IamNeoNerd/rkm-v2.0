"use client";

import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/modern/Button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, ShieldAlert, Loader2, Trash2, Key, UserCheck, Shield, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { updateUserRole, deleteUser, verifyUser, resetUserPassword } from "@/actions/users";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    name: string | null;
    email: string | null; // Made nullable for students/parents
    role: string;
    isVerified: boolean;
    image: string | null;
    createdAt: string | null;
}

export function UsersTable({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
    const { data: session } = useSession();

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoadingId(userId);
        try {
            await updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast.success("User role updated successfully");
        } catch (error) {
            toast.error("Failed to update user role");
        } finally {
            setLoadingId(null);
        }
    };

    const handleVerify = async (userId: string) => {
        setLoadingId(userId);
        try {
            await verifyUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
            toast.success("User verified successfully");
        } catch (error) {
            toast.error("Failed to verify user");
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        setLoadingId(userId);
        try {
            await deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            toast.success("User deleted successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete user");
        } finally {
            setLoadingId(null);
        }
    };

    const handleResetPassword = async (userId: string) => {
        const password = prompt("Enter new password (min 8 characters):");
        if (!password || password.length < 8) {
            if (password) toast.error("Password must be at least 8 characters");
            return;
        }

        setResetPasswordId(userId);
        try {
            await resetUserPassword(userId, password);
            toast.success("Password reset successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to reset password");
        } finally {
            setResetPasswordId(null);
        }
    };

    return (
        <div className="w-full">
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3 p-4">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="bg-white/40 dark:bg-slate-800/40 rounded-2xl p-4 border border-white/20 dark:border-slate-700/50"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border-2 border-white/50 shadow-lg">
                                        <AvatarImage src={user.image || ""} />
                                        <AvatarFallback className="bg-indigo-500 text-white font-black text-lg">
                                            {user.name?.[0] || user.email?.[0]?.toUpperCase() || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    {user.isVerified && (
                                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white">
                                            <UserCheck className="h-2 w-2 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{user.name || "Anonymous"}</p>
                                    <p className="text-[10px] font-medium text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            {user.isVerified ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-black">
                                    Verified
                                </Badge>
                            ) : (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-2 py-0.5 rounded-full text-[8px] font-black">
                                    Pending
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-white/10 dark:border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                    {user.role}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {!user.isVerified && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="h-8 px-3 text-[9px]"
                                        onClick={() => handleVerify(user.id)}
                                        disabled={loadingId === user.id}
                                    >
                                        {loadingId === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
                                    </Button>
                                )}
                                {user.id !== session?.user?.id && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-rose-500"
                                        onClick={() => handleDelete(user.id)}
                                        disabled={loadingId === user.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-white/20 text-left">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entity Signature</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Tier</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activation</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-white/40 transition-all duration-300">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-white/50 shadow-xl group-hover:scale-105 transition-transform">
                                                <AvatarImage src={user.image || ""} />
                                                <AvatarFallback className="bg-indigo-500 text-white font-black text-lg">
                                                    {user.name?.[0] || user.email?.[0]?.toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            {user.isVerified && (
                                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white shadow-lg">
                                                    <UserCheck className="h-2 w-2 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.name || "Anonymous Entity"}</span>
                                            <span className="text-[11px] font-medium text-slate-400 font-mono italic">{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    {user.isVerified ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest gap-1.5 flex items-center w-fit shadow-sm">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest gap-1.5 flex items-center w-fit shadow-sm">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            Pending
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    {user.id === session?.user?.id ? (
                                        <Badge className="bg-indigo-500 text-white border-transparent px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest gap-1.5 flex items-center w-fit shadow-lg shadow-indigo-500/25">
                                            <Shield className="h-3 w-3" />
                                            {user.role} (Current)
                                        </Badge>
                                    ) : (
                                        <Select
                                            defaultValue={user.role}
                                            onValueChange={(value) => handleRoleChange(user.id, value)}
                                            disabled={loadingId === user.id}
                                        >
                                            <SelectTrigger className="w-[180px] h-10 text-[10px] font-black uppercase tracking-widest bg-white/40 border-white/20 hover:bg-white/60 transition-all rounded-xl focus:ring-0 focus:ring-offset-0 border-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl rounded-2xl p-2 overflow-hidden">
                                                <SelectItem value="super-admin" className="text-[10px] font-black uppercase tracking-widest cursor-pointer px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors">Super Admin</SelectItem>
                                                <SelectItem value="admin" className="text-[10px] font-black uppercase tracking-widest cursor-pointer px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors">Admin</SelectItem>
                                                <SelectItem value="teacher" className="text-[10px] font-black uppercase tracking-widest cursor-pointer px-4 py-3 rounded-xl hover:bg-emerald-50 transition-colors">Teacher</SelectItem>
                                                <SelectItem value="cashier" className="text-[10px] font-black uppercase tracking-widest cursor-pointer px-4 py-3 rounded-xl hover:bg-amber-50 transition-colors">Cashier</SelectItem>
                                                <SelectItem value="user" className="text-[10px] font-black uppercase tracking-widest cursor-pointer px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors">Pending User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-800 tracking-tight">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Unknown Epoch"}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Registration Stamp</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        {!user.isVerified && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="h-9 px-4 text-[9px] font-black uppercase tracking-widest shadow-xl"
                                                onClick={() => handleVerify(user.id)}
                                                disabled={loadingId === user.id}
                                            >
                                                {loadingId === user.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    "Authenticate"
                                                )}
                                            </Button>
                                        )}
                                        {user.id !== session?.user?.id && (
                                            <Button
                                                variant="glass"
                                                size="icon"
                                                className="h-9 w-9 p-0 rounded-xl hover:bg-white"
                                                onClick={() => handleResetPassword(user.id)}
                                                disabled={resetPasswordId === user.id}
                                                title="Reset Credentials"
                                            >
                                                {resetPasswordId === user.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Key className="h-4 w-4 text-amber-500" />
                                                )}
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 p-0 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                            onClick={() => handleDelete(user.id)}
                                            disabled={loadingId === user.id || user.id === session?.user?.id}
                                        >
                                            {loadingId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
