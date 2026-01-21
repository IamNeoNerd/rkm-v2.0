"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowRight,
    AlertTriangle,
    Users,
    BookOpen,
    DollarSign,
    RefreshCw,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { getTransitionPreview, transitionToNewSession } from "@/actions/session";

interface AcademicSession {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
}

interface TransitionPreview {
    activeStudents: number;
    activeEnrollments: number;
    studentsWithOverrides: number;
    feeStructuresToCopy: number;
}

interface TransitionOptions {
    promoteStudents: boolean;
    resetEnrollments: boolean;
    resetFeeOverrides: boolean;
    copyFeeStructures: boolean;
}

interface SessionTransitionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessions: AcademicSession[];
    currentSession: AcademicSession | null;
    onTransitionComplete: () => void;
}

export function SessionTransitionDialog({
    open,
    onOpenChange,
    sessions,
    currentSession,
    onTransitionComplete,
}: SessionTransitionDialogProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [preview, setPreview] = useState<TransitionPreview | null>(null);
    const [loading, setLoading] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const [options, setOptions] = useState<TransitionOptions>({
        promoteStudents: true,
        resetEnrollments: true,
        resetFeeOverrides: true,
        copyFeeStructures: true,
    });

    const nonCurrentSessions = sessions.filter(s => !s.isCurrent);
    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setStep(1);
            setSelectedSessionId(null);
            setPreview(null);
            setOptions({
                promoteStudents: true,
                resetEnrollments: true,
                resetFeeOverrides: true,
                copyFeeStructures: true,
            });
        }
    }, [open]);

    async function handlePreview() {
        if (!selectedSessionId) return;

        setLoading(true);
        try {
            const result = await getTransitionPreview(selectedSessionId);
            if (result.success && result.preview) {
                setPreview(result.preview);
                setStep(2);
            } else {
                toast.error(result.error || "Failed to generate preview");
            }
        } catch (error) {
            toast.error("Failed to generate preview");
        } finally {
            setLoading(false);
        }
    }

    async function handleTransition() {
        if (!selectedSessionId) return;

        setTransitioning(true);
        try {
            const result = await transitionToNewSession(selectedSessionId, options);
            if (result.success) {
                toast.success("Session transition completed successfully!");
                onOpenChange(false);
                onTransitionComplete();
            } else {
                toast.error(result.error || "Transition failed");
            }
        } catch (error) {
            toast.error("Transition failed");
        } finally {
            setTransitioning(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-purple-600" />
                        Academic Year Transition
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Select the new academic session to transition to."}
                        {step === 2 && "Review what will happen during the transition."}
                        {step === 3 && "Configure options and confirm the transition."}
                    </DialogDescription>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 py-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                ${step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {s}
                            </div>
                            {s < 3 && <ArrowRight className="h-4 w-4 text-gray-400" />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Select Session */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <Label>Current Session</Label>
                            <p className="text-lg font-semibold text-gray-900">
                                {currentSession?.name || "None set"}
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="targetSession">Transition To</Label>
                            <select
                                id="targetSession"
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                value={selectedSessionId || ""}
                                onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                            >
                                <option value="">Select a session...</option>
                                {nonCurrentSessions.map((session) => (
                                    <option key={session.id} value={session.id}>
                                        {session.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {nonCurrentSessions.length === 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                                <AlertTriangle className="h-4 w-4 inline mr-2" />
                                No other sessions available. Create a new session first.
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePreview}
                                disabled={!selectedSessionId || loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Preview Changes
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Preview */}
                {step === 2 && preview && (
                    <div className="space-y-4">
                        <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-sm text-purple-800">
                                Transitioning from <strong>{currentSession?.name}</strong> to{" "}
                                <strong>{selectedSession?.name}</strong>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border rounded-lg p-4">
                                <div className="flex items-center gap-2 text-blue-600 mb-2">
                                    <Users className="h-5 w-5" />
                                    <span className="font-medium">Students</span>
                                </div>
                                <p className="text-2xl font-bold">{preview.activeStudents}</p>
                                <p className="text-sm text-gray-500">Active students to promote</p>
                            </div>

                            <div className="bg-white border rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-600 mb-2">
                                    <BookOpen className="h-5 w-5" />
                                    <span className="font-medium">Enrollments</span>
                                </div>
                                <p className="text-2xl font-bold">{preview.activeEnrollments}</p>
                                <p className="text-sm text-gray-500">Batch enrollments to reset</p>
                            </div>

                            <div className="bg-white border rounded-lg p-4">
                                <div className="flex items-center gap-2 text-orange-600 mb-2">
                                    <DollarSign className="h-5 w-5" />
                                    <span className="font-medium">Fee Overrides</span>
                                </div>
                                <p className="text-2xl font-bold">{preview.studentsWithOverrides}</p>
                                <p className="text-sm text-gray-500">Custom fees to clear</p>
                            </div>

                            <div className="bg-white border rounded-lg p-4">
                                <div className="flex items-center gap-2 text-purple-600 mb-2">
                                    <RefreshCw className="h-5 w-5" />
                                    <span className="font-medium">Fee Structures</span>
                                </div>
                                <p className="text-2xl font-bold">{preview.feeStructuresToCopy}</p>
                                <p className="text-sm text-gray-500">Structures to copy</p>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                Back
                            </Button>
                            <Button onClick={() => setStep(3)}>
                                Configure Options
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Configure & Confirm */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Checkbox
                                    id="promoteStudents"
                                    checked={options.promoteStudents}
                                    onCheckedChange={(checked) =>
                                        setOptions(prev => ({ ...prev, promoteStudents: !!checked }))
                                    }
                                />
                                <div>
                                    <Label htmlFor="promoteStudents" className="font-medium cursor-pointer">
                                        Promote Students to Next Class
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Class 1 → 2, Class 2 → 3, ..., Class 12 → Graduate
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Checkbox
                                    id="resetEnrollments"
                                    checked={options.resetEnrollments}
                                    onCheckedChange={(checked) =>
                                        setOptions(prev => ({ ...prev, resetEnrollments: !!checked }))
                                    }
                                />
                                <div>
                                    <Label htmlFor="resetEnrollments" className="font-medium cursor-pointer">
                                        Reset Batch Enrollments
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Deactivate all current batch enrollments
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Checkbox
                                    id="resetFeeOverrides"
                                    checked={options.resetFeeOverrides}
                                    onCheckedChange={(checked) =>
                                        setOptions(prev => ({ ...prev, resetFeeOverrides: !!checked }))
                                    }
                                />
                                <div>
                                    <Label htmlFor="resetFeeOverrides" className="font-medium cursor-pointer">
                                        Clear Fee Overrides
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Reset custom student fees to standard class rates
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Checkbox
                                    id="copyFeeStructures"
                                    checked={options.copyFeeStructures}
                                    onCheckedChange={(checked) =>
                                        setOptions(prev => ({ ...prev, copyFeeStructures: !!checked }))
                                    }
                                />
                                <div>
                                    <Label htmlFor="copyFeeStructures" className="font-medium cursor-pointer">
                                        Copy Fee Structures
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Copy current fee structures to the new session
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-2 text-red-800">
                                <AlertTriangle className="h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="font-medium">This action cannot be undone!</p>
                                    <p className="text-sm mt-1">
                                        Review your selections carefully before proceeding.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                Back
                            </Button>
                            <Button
                                onClick={handleTransition}
                                disabled={transitioning}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {transitioning ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Transitioning...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Confirm Transition
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
