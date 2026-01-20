"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, ShieldAlert, Loader2, Trash2, Key } from "lucide-react";
import { toast } from "sonner";
import { updateUserRole, deleteUser, verifyUser, resetUserPassword } from "@/actions/users";
import { useSession } from "next-auth/react";

interface User {
    id: string;
    name: string | null;
    email: string;
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
        <Table>
            <TableHeader className="bg-gray-50/50">
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50/30 transition-colors">
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-gray-100 shadow-sm">
                                    <AvatarImage src={user.image || ""} />
                                    <AvatarFallback className="bg-indigo-50 text-indigo-600 text-xs">
                                        {user.name?.[0] || user.email[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{user.name || "N/A"}</span>
                                    <span className="text-xs text-gray-500">{user.email}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            {user.isVerified ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 flex items-center gap-1 w-fit">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Verified
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 flex items-center gap-1 w-fit">
                                    <ShieldAlert className="h-3 w-3" />
                                    Pending
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell>
                            {user.id === session?.user?.id ? (
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                                    {user.role} (You)
                                </Badge>
                            ) : (
                                <Select
                                    defaultValue={user.role}
                                    onValueChange={(value) => handleRoleChange(user.id, value)}
                                    disabled={loadingId === user.id}
                                >
                                    <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="super-admin">Super Admin</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="cashier">Cashier</SelectItem>
                                        <SelectItem value="parent">Parent</SelectItem>
                                        <SelectItem value="user">Pending User</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-2">
                            {!user.isVerified && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 bg-indigo-600 text-white hover:bg-indigo-700"
                                    onClick={() => handleVerify(user.id)}
                                    disabled={loadingId === user.id}
                                >
                                    {loadingId === user.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        "Verify"
                                    )}
                                </Button>
                            )}
                            {user.id !== session?.user?.id && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                    onClick={() => handleResetPassword(user.id)}
                                    disabled={resetPasswordId === user.id}
                                    title="Reset Password"
                                >
                                    {resetPasswordId === user.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Key className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(user.id)}
                                disabled={loadingId === user.id || user.id === session?.user?.id}
                            >
                                {loadingId === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
