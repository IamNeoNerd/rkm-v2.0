"use client";

import { useState } from "react";
import { deactivateStaff, reactivateStaff } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Power, PowerOff, ShieldAlert, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeactivateStaffButtonProps {
    staffId: number;
    name: string;
    isActive: boolean;
}

export function DeactivateStaffButton({ staffId, name, isActive }: DeactivateStaffButtonProps) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleToggleStatus = async () => {
        setLoading(true);
        const action = isActive ? deactivateStaff : reactivateStaff;
        const res = await action(staffId);
        setLoading(false);

        if (res.success) {
            toast.success(isActive ? "Personnel node deactivated" : "Personnel node reactivated");
            setOpen(false); // Close dialog on success
        } else {
            toast.error(res.error || "Status shift failed");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-9 w-9 rounded-xl transition-all shadow-sm",
                        isActive
                            ? "bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white"
                            : "bg-emerald-50 border border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                    )}
                >
                    {isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white/80 backdrop-blur-3xl border-white/20 p-0 overflow-hidden rounded-[32px] shadow-2xl max-w-md">
                {/* Close button */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                    <X className="h-4 w-4 text-slate-500" />
                </button>

                <div className={cn(
                    "p-8 pb-6 relative z-10 flex flex-col items-center text-center",
                    isActive ? "bg-rose-500/5" : "bg-emerald-500/5"
                )}>
                    <div className={cn(
                        "h-16 w-16 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-in zoom-in duration-500",
                        isActive ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-emerald-500 text-white shadow-emerald-500/20"
                    )}>
                        <ShieldAlert className="h-8 w-8" />
                    </div>
                    <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">
                        {isActive ? "Deactivate Node" : "Reactivate Node"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Personnel Vector: {name.toUpperCase()}
                    </AlertDialogDescription>
                </div>

                <div className="p-8 pt-4 space-y-6">
                    <p className="text-sm text-slate-600 text-center leading-relaxed">
                        {isActive
                            ? "Are you absolutely sure you want to deactivate this operational node? This will suspend all system access and clearance tokens immediately."
                            : "Are you sure you want to reactivate this personnel node and restore all primary clearance tokens?"
                        }
                    </p>

                    <AlertDialogFooter className="flex-col sm:flex-col gap-3">
                        <Button
                            onClick={handleToggleStatus}
                            disabled={loading}
                            className={cn(
                                "w-full h-14 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] border-none group",
                                isActive ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {loading ? (
                                    <Zap className="h-5 w-5 animate-pulse" />
                                ) : (
                                    <Power className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                )}
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                                    {loading ? "PROCESSING..." : (isActive ? "CONFIRM DEACTIVATION" : "CONFIRM REACTIVATION")}
                                </span>
                            </div>
                        </Button>
                        <AlertDialogCancel className="w-full h-14 rounded-2xl border-slate-200 text-slate-500 hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest transition-all">
                            ABORT PROTOCOL
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </div>

                <div className="p-4 bg-slate-950 flex items-center justify-center gap-3 opacity-80">
                    <ShieldAlert className="h-3 w-3 text-amber-500" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
                        Node Shift ID: 0x{staffId.toString(16).padStart(4, '0')}
                    </span>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
