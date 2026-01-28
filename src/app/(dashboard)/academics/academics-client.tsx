"use client";

import { useState } from "react";
import { GraduationCap, Users, Clock, DollarSign, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { GlassCard } from "@/components/modern/Card";
import { createBatch, enrollStudentInBatch } from "@/actions/academics";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Teacher = { id: number; name: string; role: string };
type Student = { id: number; name: string; class: string };
type Batch = {
    id: number;
    name: string;
    schedule: string | null;
    fee: number;
    teacherName: string | null;
    studentCount: number;
    teacherId: number | null;
};

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
    const [batchSearch, setBatchSearch] = useState("");

    const filteredBatches = batches.filter(batch =>
        batch.name.toLowerCase().includes(batchSearch.toLowerCase()) ||
        (batch.teacherName && batch.teacherName.toLowerCase().includes(batchSearch.toLowerCase()))
    );

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
                <div className="p-8 border-b border-white/20 bg-white/40 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <GraduationCap className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Current Batches</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">managed academic units</p>
                        </div>
                    </div>

                    <div className="relative w-full md:max-w-xs">
                        <Input
                            placeholder="Search by batch or teacher..."
                            className="pl-10 h-10 text-xs"
                            value={batchSearch}
                            onChange={(e) => setBatchSearch(e.target.value)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
                            <Users className="h-4 w-4" />
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
                    <>
                        {/* Mobile Batch Card Layout */}
                        <div className="md:hidden space-y-3 p-4 bg-slate-50/30">
                            {filteredBatches.map((batch) => (
                                <GlassCard key={batch.id} className="p-5 border-white/60 shadow-lg relative group" intensity="medium">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instructional Node</p>
                                            <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-none">{batch.name}</h4>
                                            <p className="text-[8px] font-black text-slate-400 mt-1">CODE: RK-B{batch.id.toString().padStart(3, '0')}</p>
                                        </div>
                                        <Link href={`/batches/${batch.id}`}>
                                            <Button variant="glass" size="sm" className="h-10 w-10 p-0 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/20">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Lead Instructor</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                                                    {batch.teacherName?.[0] || 'T'}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-700 truncate">{batch.teacherName || 'NOT_ASSIGNED'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Revenue Node</p>
                                            <p className="text-[10px] font-black text-slate-900 font-mono italic">₹{batch.fee.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 italic">
                                            <Users className="h-3 w-3" />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">{batch.studentCount} Students</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                            <Clock className="h-3.5 w-3.5 opacity-40" />
                                            {batch.schedule || 'Unscheduled'}
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Batch Name</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Lead Node (Teacher)</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Schedule</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Enrollment</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Fee</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/20">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filteredBatches.map((batch) => (
                                        <tr key={batch.id} className="group hover:bg-white/40 transition-colors duration-200">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{batch.name}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: #{batch.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-primary border border-slate-200">
                                                        {batch.teacherName?.[0] || 'T'}
                                                    </div>
                                                    <span>{batch.teacherName || 'Not Assigned'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                    <span>{batch.schedule || 'Unscheduled'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                    <Users className="h-3 w-3" />
                                                    {batch.studentCount} Students
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm font-black text-slate-900">₹{batch.fee.toLocaleString()}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/batches/${batch.id}`}>
                                                        <Button variant="glass" size="sm" className="text-primary hover:bg-primary hover:text-white px-2">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {canManageBatches && (
                                                        <Button
                                                            variant="glass"
                                                            size="sm"
                                                            className="text-cta hover:bg-cta hover:text-white px-2"
                                                            onClick={() => {
                                                                // For now, view details handles edit, but we could add quick editing
                                                                toast.info("Opening detail page for management...");
                                                                router.push(`/batches/${batch.id}`);
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4 rotate-45" /> {/* Use rotate-45 of plus as edit if no edit icon, but let's see */}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </GlassCard>
        </div>
    );
}
