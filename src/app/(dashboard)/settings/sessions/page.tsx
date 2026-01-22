"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllSessions as getAcademicSessions, createSession as createAcademicSession, activateSession as setCurrentSession } from "@/actions/session";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/modern/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Star, RefreshCw, History, Timer, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { SessionTransitionDialog } from "./session-transition-dialog";
import { cn } from "@/lib/utils";

interface AcademicSession {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
}

export default function SessionsSettingsPage() {
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
    });

    const loadSessions = useCallback(async () => {
        const result = await getAcademicSessions();
        if (result.success && result.sessions) {
            setSessions(result.sessions);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadSessions();
        };
        init();
    }, [loadSessions]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const result = await createAcademicSession(formData);

        if (result.success) {
            toast.success("Academic session created");
            setDialogOpen(false);
            setFormData({ name: "", startDate: "", endDate: "", isCurrent: false });
            loadSessions();
        } else {
            toast.error(result.error || "Failed to create session");
        }
    }

    async function handleSetCurrent(id: number) {
        const result = await setCurrentSession(id);
        if (result.success) {
            toast.success("Current session updated");
            loadSessions();
        } else {
            toast.error(result.error || "Failed to update session");
        }
    }

    if (loading) {
        return (
            <div className="p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
                <div className="h-12 bg-slate-200 rounded-2xl w-1/3 opacity-50" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Hub */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3 font-satoshi">
                        Timeline Control
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Academic Temporal Matrix & Session Governance
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="glass"
                        onClick={() => setTransitionDialogOpen(true)}
                        className="h-12 px-6 text-[10px] font-black uppercase tracking-[0.2em] gap-2 border-primary/20 text-primary group"
                    >
                        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                        Start New Year
                    </Button>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="primary" className="h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em] gap-2 shadow-xl">
                                <Plus className="h-4 w-4" />
                                Create Epoch
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-xl border-white/40 shadow-2xl rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Initialize Session</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Session Identifier</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., 2025-26"
                                        className="h-12 bg-white/50 border-white/40 font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Point</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="h-12 bg-white/50 border-white/40 font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Point</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                            className="h-12 bg-white/50 border-white/40 font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <input
                                        type="checkbox"
                                        id="isCurrent"
                                        checked={formData.isCurrent}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isCurrent: e.target.checked }))}
                                        className="h-5 w-5 rounded-lg border-primary/20 text-primary focus:ring-primary/20"
                                    />
                                    <Label htmlFor="isCurrent" className="text-[11px] font-black uppercase tracking-widest text-primary cursor-pointer">Set as Active Current</Label>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" className="uppercase tracking-widest text-[10px] font-black" onClick={() => setDialogOpen(false)}>Abort</Button>
                                    <Button type="submit" variant="primary" className="px-8 uppercase tracking-widest text-[10px] font-black">Record Session</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <SessionTransitionDialog
                open={transitionDialogOpen}
                onOpenChange={setTransitionDialogOpen}
                sessions={sessions}
                currentSession={sessions.find(s => s.isCurrent) || null}
                onTransitionComplete={loadSessions}
            />

            {sessions.length === 0 ? (
                <GlassCard className="p-20 text-center" intensity="high">
                    <div className="relative inline-block mb-6">
                        <Calendar className="h-20 w-20 text-slate-200" />
                        <Timer className="h-8 w-8 text-slate-400 absolute bottom-0 right-0 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Timeline is empty</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Initialize your first academic epoch to begin record keeping.</p>
                </GlassCard>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => (
                        <GlassCard
                            key={session.id}
                            className={cn(
                                "group p-6 border-2 transition-all duration-500 hover:scale-[1.02]",
                                session.isCurrent ? 'border-primary shadow-2xl shadow-primary/10' : 'border-white/20'
                            )}
                            intensity={session.isCurrent ? "high" : "medium"}
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                                {session.name}
                                            </h3>
                                            {session.isCurrent && (
                                                <Badge className="bg-primary text-white border-transparent px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                                                    Current
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <History className="h-3 w-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">Temporal Range</span>
                                        </div>
                                    </div>
                                    {!session.isCurrent && (
                                        <Button
                                            variant="glass"
                                            size="sm"
                                            onClick={() => handleSetCurrent(session.id)}
                                            className="h-10 w-10 p-0 rounded-xl hover:bg-white text-primary"
                                            title="Set as Current"
                                        >
                                            <Star className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Launch</span>
                                        <span className="text-slate-900 font-mono italic">{format(new Date(session.startDate), "dd MMM yyyy")}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Termination</span>
                                        <span className="text-slate-900 font-mono italic">{format(new Date(session.endDate), "dd MMM yyyy")}</span>
                                    </div>
                                </div>
                                {session.isCurrent && (
                                    <div className="mt-6 p-3 bg-primary/10 rounded-xl flex items-center gap-3">
                                        <Rocket className="h-4 w-4 text-primary" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">System Primary Node</span>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}
