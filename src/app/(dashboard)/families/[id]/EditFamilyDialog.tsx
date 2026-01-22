"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { GlassCard } from "@/components/modern/Card";
import { Loader2, Key, Users, Phone, Eye, EyeOff, Copy, Check, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getFamilyIdentityStatus, updateFamilyIdentity } from "@/actions/family-identity";
import { cn } from "@/lib/utils";

interface EditFamilyDialogProps {
    open: boolean;
    onClose: () => void;
    familyId: number;
    familyName: string;
    familyPhone: string;
    onSuccess?: () => void;
}

export function EditFamilyDialog({
    open,
    onClose,
    familyId,
    familyName,
    familyPhone,
    onSuccess,
}: EditFamilyDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Identity fields
    const [passkey, setPasskey] = useState("");
    const [showPasskey, setShowPasskey] = useState(false);
    const [copied, setCopied] = useState(false);

    // Status flags
    const [hasLinkedUser, setHasLinkedUser] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    // Fetch current identity status on open
    useEffect(() => {
        if (open) {
            setIsFetching(true);
            setPasskey("");
            getFamilyIdentityStatus(familyId).then((status) => {
                setHasLinkedUser(status.hasLinkedUser);
                setUserName(status.userName);
                setIsFetching(false);
            });
        }
    }, [open, familyId]);

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
        const text = `Phone: ${familyPhone}\nPasskey: ${passkey}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Credentials copied to clipboard");
    };

    const handleSubmit = async () => {
        if (!passkey || passkey.length < 6) {
            toast.error("Passkey must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        const result = await updateFamilyIdentity(familyId, { passkey });
        setIsLoading(false);

        if (result.success) {
            toast.success("Parent identity activated successfully!");
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
                        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        Parent Identity Access
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Configure login credentials for <span className="font-bold text-foreground">{familyName}</span>.
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
                            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 font-black">
                                {familyName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-foreground">{familyName}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    <span className="font-mono">{familyPhone}</span>
                                </div>
                            </div>
                            {hasLinkedUser && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                </div>
                            )}
                        </GlassCard>

                        {/* Phone (Read Only) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Login Identifier (Phone)
                            </label>
                            <Input
                                value={familyPhone}
                                disabled
                                className="font-mono text-lg tracking-[0.2em] text-center bg-slate-100 dark:bg-slate-800"
                            />
                            <p className="text-[10px] text-muted-foreground/60 text-center">
                                Parents log in using their registered phone number
                            </p>
                        </div>

                        {/* Passkey Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
                                <span>{hasLinkedUser ? "Reset Passkey" : "Create Passkey"}</span>
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
                                    placeholder={hasLinkedUser ? "Enter new passkey to reset" : "Enter or generate a passkey"}
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
                                    ⚠️ This parent already has login access. Entering a new passkey will reset their password.
                                </p>
                            )}
                        </div>

                        {/* Copy Credentials Button */}
                        {passkey && passkey.length >= 6 && (
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
                                            <span className="text-muted-foreground">Phone:</span> <span className="text-foreground font-bold">{familyPhone}</span>
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
                    <Button onClick={handleSubmit} disabled={isLoading || !passkey || passkey.length < 6}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Key className="h-4 w-4 mr-2" />
                        )}
                        {hasLinkedUser ? "Reset Access" : "Activate Access"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
