"use client";

import { useState } from "react";
import { GraduationCap, Users, Clock, DollarSign, Plus, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { GlassCard } from "@/components/modern/Card";
import { createBatch, enrollStudentInBatch } from "@/actions/academics";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Teacher = { id: number; name: string; role: string };
type Student = { id: number; name: string; class: string };
type Batch = { id: number; name: string; schedule: string | null; fee: number };

export default function AcademicsClient({
    teachers,
    students,
    batches,
    canManageBatches = false
}: {
    teachers: Teacher[];
    students: Student[];
    batches: Batch[];
    canManageBatches?: boolean;
}) {
    const router = useRouter();

    // Create Batch State
    const [batchName, setBatchName] = useState("");
    const [batchFee, setBatchFee] = useState("");
    const [batchSchedule, setBatchSchedule] = useState("");
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [isCreatingBatch, setIsCreatingBatch] = useState(false);

    // Enroll Student State
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [isEnrolling, setIsEnrolling] = useState(false);

    const handleCreateBatch = async () => {
        if (!batchName || !batchFee || !batchSchedule || !selectedTeacherId) {
            toast.error("Please fill all batch fields and select a teacher");
            return;
        }

        setIsCreatingBatch(true);
        const result = await createBatch({
            name: batchName,
            fee: parseFloat(batchFee),
            schedule: batchSchedule,
            teacherId: parseInt(selectedTeacherId),
        });
        setIsCreatingBatch(false);

        if (result.batch) {
            toast.success(`Batch "${result.batch.name}" created successfully!`);
            setBatchName("");
            setBatchFee("");
            setBatchSchedule("");
            setSelectedTeacherId("");
            router.refresh();
        } else {
            toast.error("Failed to create batch");
        }
    };

    const handleEnrollStudent = async () => {
        if (!selectedStudentId || !selectedBatchId) {
            toast.error("Please select both a student and a batch");
            return;
        }

        setIsEnrolling(true);
        const result = await enrollStudentInBatch(selectedStudentId, selectedBatchId);
        setIsEnrolling(false);

        if (result.success) {
            toast.success("Student enrolled successfully!");
            setSelectedStudentId("");
            setSelectedBatchId("");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to enroll student");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Batch Card */}
                {canManageBatches ? (
                    <GlassCard className="p-8" intensity="medium">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Plus className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Create New Batch</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                    Batch Name
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g., Physics Advanced"
                                    value={batchName}
                                    onChange={(e) => setBatchName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                    Assign Teacher
                                </label>
                                <select
                                    className="flex h-12 w-full rounded-xl border border-input bg-white/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 backdrop-blur-sm shadow-sm"
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                >
                                    <option value="">Select a Teacher</option>
                                    {teachers.filter(t => t.role === 'TEACHER').map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                        <DollarSign className="inline h-3 w-3 mr-1" /> Monthly Fee
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="500"
                                        value={batchFee}
                                        onChange={(e) => setBatchFee(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                        <Clock className="inline h-3 w-3 mr-1" /> Schedule
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Mon/Wed 4-5pm"
                                        value={batchSchedule}
                                        onChange={(e) => setBatchSchedule(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateBatch}
                                disabled={isCreatingBatch}
                                variant="primary"
                                className="w-full mt-4"
                            >
                                {isCreatingBatch ? "Provisioning..." : "Create Batch"}
                            </Button>
                        </div>
                    </GlassCard>
                ) : (
                    <GlassCard className="p-8 border-dashed flex flex-col items-center justify-center text-center opacity-70" intensity="low">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                            <Plus className="h-8 w-8 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-500 uppercase tracking-tight mb-2">Create New Batch</h2>
                        <p className="text-slate-400 text-sm max-w-[280px]">
                            Administrator privileges required to create and manage academic batches.
                        </p>
                    </GlassCard>
                )}

                {/* Enroll Student Card */}
                <GlassCard className="p-8" intensity="medium">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-cta/10 rounded-xl">
                            <Users className="h-6 w-6 text-cta" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Enroll Student</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                Select Student
                            </label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-input bg-white/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 backdrop-blur-sm shadow-sm"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="">Select a Student</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (Class {s.class})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                Target Batch
                            </label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-input bg-white/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 backdrop-blur-sm shadow-sm"
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                            >
                                <option value="">Select a Batch</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.schedule})</option>
                                ))}
                            </select>
                        </div>

                        <Button
                            onClick={handleEnrollStudent}
                            disabled={isEnrolling}
                            variant="cta"
                            className="w-full mt-4"
                        >
                            {isEnrolling ? "Processing..." : "Enroll Student"}
                        </Button>

                        <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <div className="flex gap-3">
                                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-600 leading-relaxed italic">
                                    <strong className="text-primary not-italic">Conflict Check:</strong> The system automatically verifies schedule overlaps. Enrollment will be flagged if time conflicts are detected.
                                </p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Current Batches List */}
            <GlassCard className="p-0 overflow-hidden" intensity="high">
                <div className="p-8 border-b border-white/20 bg-white/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <GraduationCap className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Current Batches</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">managed academic units</p>
                        </div>
                    </div>
                </div>

                {batches.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <div className="mb-4 opacity-20">
                            <GraduationCap className="h-16 w-16 mx-auto" />
                        </div>
                        <p className="text-lg font-medium">No active batches found</p>
                        <p className="text-sm opacity-60">Create a batch to begin your academic session</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Batch Name</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Schedule</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Fee</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {batches.map((batch) => (
                                    <tr key={batch.id} className="group hover:bg-white/40 transition-colors duration-200">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{batch.name}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: #{batch.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                <span>{batch.schedule || 'Unscheduled'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="text-sm font-black text-slate-900">₹{batch.fee.toLocaleString()}</div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-[10px] font-black leading-5 uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <Link href={`/batches/${batch.id}`}>
                                                <Button variant="glass" size="sm" className="gap-2 text-[10px] uppercase font-black tracking-widest">
                                                    View Details
                                                    <ArrowRight className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
