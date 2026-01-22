"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { GlassCard } from "@/components/modern/Card";
import { Loader2, Sparkles, Key, User, GraduationCap, Eye, EyeOff, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { suggestStudentId, updateStudentIdentity, getStudentIdentityStatus } from "@/actions/identity";
import { cn } from "@/lib/utils";

interface EditStudentDialogProps {
    open: boolean;
    onClose: () => void;
    studentDbId: number;
    studentName: string;
    studentClass: string;
    onSuccess?: () => void;
}

export function EditStudentDialog({
    open,
    onClose,
    studentDbId,
    studentName,
    studentClass,
    onSuccess,
}: EditStudentDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Identity fields
    const [studentId, setStudentId] = useState("");
    const [passkey, setPasskey] = useState("");
    const [showPasskey, setShowPasskey] = useState(false);
    const [copied, setCopied] = useState(false);

    // Status flags
    const [hasExistingIdentity, setHasExistingIdentity] = useState(false);
    const [hasLinkedUser, setHasLinkedUser] = useState(false);

    // Fetch current identity status on open
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setIsFetching(true);
                getStudentIdentityStatus(studentDbId).then((status) => {
                    if (status.studentId) {
                        setStudentId(status.studentId);
                    }
                    setHasExistingIdentity(status.hasIdentity);
                    setHasLinkedUser(status.hasLinkedUser);
                    setIsFetching(false);
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open, studentDbId]);

    const handleSuggestId = async () => {
        const result = await suggestStudentId();
        if (result.id) {
            setStudentId(result.id);
            toast.success(`Suggested ID: ${result.id}`);
        } else {
            toast.error(result.error || "Failed to suggest ID");
        }
    };

    const generateRandomPasskey = () => {
        const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let result = "";
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPasskey(result);
        setShowPasskey(true);
    };

    const copyCredentials = () => {
        const text = `Student ID: ${studentId}\nPasskey: ${passkey}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Credentials copied to clipboard");
    };

    const handleSubmit = async () => {
        if (!studentId || studentId.length !== 6) {
            toast.error("Please enter a valid 6-digit Student ID");
            return;
        }

        setIsLoading(true);
        const result = await updateStudentIdentity(studentDbId, {
            studentId,
            passkey: passkey || undefined,
        });
        setIsLoading(false);

        if (result.success) {
            toast.success("Student identity updated successfully!");
            onSuccess?.();
            onClose();
        } else {
            toast.error(result.error || "Failed to update identity");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-white/20">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        Edit Student Identity
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Configure login credentials for <span className="font-bold text-foreground">{studentName}</span>.
                    </DialogDescription>
                </DialogHeader>

                {isFetching ? (
                    <div className="py-12 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        {/* Profile Summary */}
                        <GlassCard className="p-4 flex items-center gap-4" intensity="low">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                                {studentName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">{studentName}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <GraduationCap className="h-3 w-3" />
                                    <span>{studentClass}</span>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Student ID Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
                                <span>Student ID (6 digits)</span>
                                <button
                                    type="button"
                                    onClick={handleSuggestId}
                                    className="flex items-center gap-1 text-primary hover:underline"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    Suggest
                                </button>
                            </label>
                            <Input
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="e.g., 260001"
                                maxLength={6}
                                className="font-mono text-lg tracking-[0.2em] text-center"
                            />
                            {hasExistingIdentity && (
                                <p className="text-[10px] text-muted-foreground/60 text-center">
                                    Current ID: {studentId}
                                </p>
                            )}
                        </div>

                        {/* Passkey Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
                                <span>{hasLinkedUser ? "Reset Passkey (Optional)" : "Create Passkey"}</span>
                                <button
                                    type="button"
                                    onClick={generateRandomPasskey}
                                    className="flex items-center gap-1 text-primary hover:underline"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Generate
                                </button>
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPasskey ? "text" : "password"}
                                    value={passkey}
                                    onChange={(e) => setPasskey(e.target.value)}
                                    placeholder={hasLinkedUser ? "Leave blank to keep current" : "Enter or generate a passkey"}
                                    className="pr-20 font-mono"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasskey(!showPasskey)}
                                        className="p-1.5 rounded-lg hover:bg-white/20 text-muted-foreground"
                                    >
                                        {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            {hasLinkedUser && (
                                <p className="text-[10px] text-amber-600 font-bold">
                                    ⚠️ This student already has login access. Entering a new passkey will reset it.
                                </p>
                            )}
                        </div>

                        {/* Copy Credentials Button (show only when both are set) */}
                        {studentId.length === 6 && passkey && (
                            <GlassCard
                                className={cn(
                                    "p-4 border-2 transition-all",
                                    copied ? "border-emerald-500/50 bg-emerald-500/5" : "border-primary/20"
                                )}
                                intensity="medium"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Credentials Preview</p>
                                        <p className="text-sm font-mono mt-1">
                                            <span className="text-muted-foreground">ID:</span> <span className="text-foreground font-bold">{studentId}</span>
                                            <span className="mx-2 text-muted-foreground/30">|</span>
                                            <span className="text-muted-foreground">Key:</span> <span className="text-foreground font-bold">{showPasskey ? passkey : "••••••••"}</span>
                                        </p>
                                    </div>
                                    <Button
                                        variant="glass"
                                        size="sm"
                                        onClick={copyCredentials}
                                        className={cn(copied && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </GlassCard>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-3">
                    <Button variant="glass" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || studentId.length !== 6}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Key className="h-4 w-4 mr-2" />
                        )}
                        Save Identity
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
