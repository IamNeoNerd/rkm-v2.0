"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllSessions as getAcademicSessions, createSession as createAcademicSession, activateSession as setCurrentSession } from "@/actions/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Star, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { SessionTransitionDialog } from "./session-transition-dialog";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";

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
            <div className="p-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <SettingsPageLayout
            title="Academic Sessions"
            description="Manage academic years and session periods"
            icon={<Calendar className="h-8 w-8 text-indigo-600" />}
            maxWidth="lg"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setTransitionDialogOpen(true)}
                        className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span className="hidden sm:inline">Start New Year</span>
                        <span className="sm:hidden">Transition</span>
                    </Button>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add Session</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Academic Session</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Session Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., 2025-26"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isCurrent"
                                        checked={formData.isCurrent}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isCurrent: e.target.checked }))}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="isCurrent" className="font-normal">Set as current session</Label>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Create</Button>
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
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No academic sessions</h3>
                    <p className="text-gray-500 mt-1">Add your first academic session to get started</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`bg-white rounded-lg shadow p-4 border-2 ${session.isCurrent ? 'border-purple-500' : 'border-transparent'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        {session.name}
                                        {session.isCurrent && (
                                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {format(new Date(session.startDate), "MMM dd, yyyy")} - {format(new Date(session.endDate), "MMM dd, yyyy")}
                                    </p>
                                </div>
                                {!session.isCurrent && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSetCurrent(session.id)}
                                        className="text-purple-600 hover:text-purple-700"
                                    >
                                        <Star className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SettingsPageLayout>
    );
}
