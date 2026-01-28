"use client";

import { useState, useCallback } from "react";
import { createSession, activateSession, getAllSessions } from "@/actions/session";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/modern/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, CheckCircle2, RefreshCw, Zap, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { SessionTransitionDialog } from "./session-transition-dialog";

interface AcademicSession {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
}

interface SessionsClientProps {
    initialSessions: AcademicSession[];
}

export default function SessionsClient({ initialSessions }: SessionsClientProps) {
    const [sessions, setSessions] = useState<AcademicSession[]>(initialSessions);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
    const [activatingId, setActivatingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
    });

    const currentSession = sessions.find(s => s.isCurrent) || null;

    const loadSessions = useCallback(async () => {
        const result = await getAllSessions();
        if (result.success && result.sessions) {
            setSessions(result.sessions);
        }
    }, []);

    async function handleCreateSession(e: React.FormEvent) {
        e.preventDefault();

        const result = await createSession({
            name: formData.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
        });

        if (result.success) {
            toast.success("Session created successfully");
            setDialogOpen(false);
            setFormData({ name: "", startDate: "", endDate: "" });
            loadSessions();
        } else {
            toast.error(result.error || "Failed to create session");
        }
    }

    async function handleActivate(sessionId: number) {
        if (!confirm("Are you sure you want to activate this session? This will deactivate the current session.")) {
            return;
        }

        setActivatingId(sessionId);
        const result = await activateSession(sessionId);
        setActivatingId(null);

        if (result.success) {
            toast.success("Session activated successfully");
            loadSessions();
        } else {
            toast.error(result.error || "Failed to activate session");
        }
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Hub */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3 font-satoshi">
                        Academic Sessions
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Session Management & Year Transitions
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="glass"
                        onClick={() => setTransitionDialogOpen(true)}
                        className="h-12 px-6 text-[10px] font-black uppercase tracking-[0.2em] gap-2"
                        disabled={!currentSession || sessions.length < 2}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Year Transition
                    </Button>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="primary" className="h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em] gap-2 shadow-xl">
                                <Plus className="h-4 w-4" />
                                New Session
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-xl border-white/40 shadow-2xl rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    Create Session
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSession} className="space-y-6 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sessionName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        Session Name
                                    </Label>
                                    <Input
                                        id="sessionName"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., 2025-26"
                                        className="h-12 bg-white/50 border-white/40 font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            Start Date
                                        </Label>
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
                                        <Label htmlFor="endDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                            End Date
                                        </Label>
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
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" className="uppercase tracking-widest text-[10px] font-black" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" className="px-8 uppercase tracking-widest text-[10px] font-black">
                                        Create
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Current Session Highlight */}
            {currentSession && (
                <GlassCard className="p-8 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent" intensity="high">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                <Zap className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">Active Session</p>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentSession.name}</h2>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Duration</p>
                            <p className="text-sm font-bold text-slate-600">
                                {formatDate(currentSession.startDate)} — {formatDate(currentSession.endDate)}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Sessions List */}
            <GlassCard className="overflow-hidden border-white/20" intensity="high">
                <div className="p-8 border-b border-white/20 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <CalendarDays className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">All Sessions</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                        {sessions.length} Total
                    </Badge>
                </div>

                {sessions.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="relative inline-block mb-6">
                            <Calendar className="h-20 w-20 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No sessions created</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                            Create your first academic session to get started.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-white/20">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Session</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Start Date</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">End Date</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {sessions.map((session) => (
                                    <tr key={session.id} className="group hover:bg-white/40 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <span className="text-lg font-black text-slate-900 uppercase tracking-tight">{session.name}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-slate-600">{formatDate(session.startDate)}</span>
                                        </td>
                                        <td className="px-8 py-6 hidden sm:table-cell">
                                            <span className="text-sm font-bold text-slate-600">{formatDate(session.endDate)}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {session.isCurrent ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {!session.isCurrent && (
                                                <Button
                                                    variant="glass"
                                                    size="sm"
                                                    onClick={() => handleActivate(session.id)}
                                                    disabled={activatingId === session.id}
                                                    className="h-10 px-4 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    {activatingId === session.id ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Zap className="h-3 w-3 mr-1" />
                                                            Activate
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GlassCard className="p-8 border-l-4 border-l-indigo-500" intensity="medium">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Sessions</h4>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                        {sessions.length} <span className="text-sm font-bold text-slate-400 uppercase">Configured</span>
                    </p>
                </GlassCard>
                <GlassCard className="p-8 border-r-4 border-r-emerald-500" intensity="medium">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Current Session</h4>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                        {currentSession?.name || <span className="text-slate-400">None</span>}
                    </p>
                </GlassCard>
            </div>

            {/* Session Transition Dialog */}
            <SessionTransitionDialog
                open={transitionDialogOpen}
                onOpenChange={setTransitionDialogOpen}
                sessions={sessions}
                currentSession={currentSession}
                onTransitionComplete={loadSessions}
            />
        </div>
    );
}
