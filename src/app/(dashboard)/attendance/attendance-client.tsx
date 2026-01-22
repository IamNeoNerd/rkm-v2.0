"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle, XCircle, Clock, Users, Check, Save } from "lucide-react";
import { Button } from "@/components/modern/Button";
import { GlassCard } from "@/components/modern/Card";
import {
    markAttendance,
    getBatchStudentsForAttendance,
    getAttendanceByBatch,
    AttendanceStatus
} from "@/actions/attendance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Batch = { id: number; name: string; schedule: string | null };
type Student = { studentId: number; studentName: string; studentClass: string };
type AttendanceRecord = { studentId: number; status: AttendanceStatus };

export default function AttendanceClient({ batches }: { batches: Batch[] }) {
    const router = useRouter();
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const loadBatchStudents = useCallback(async () => {
        setLoading(true);
        const { students: enrolled } = await getBatchStudentsForAttendance(parseInt(selectedBatchId));
        setStudents(enrolled);
        // Initialize all as Present by default
        const initial: Record<number, AttendanceStatus> = {};
        enrolled.forEach(s => {
            initial[s.studentId] = "Present";
        });
        setAttendance(initial);
        setLoading(false);
    }, [selectedBatchId]);

    const loadExistingAttendance = useCallback(async () => {
        const { attendance: existing } = await getAttendanceByBatch(
            parseInt(selectedBatchId),
            new Date(selectedDate)
        );
        if (existing.length > 0) {
            const attendanceMap: Record<number, AttendanceStatus> = {};
            existing.forEach(a => {
                attendanceMap[a.studentId] = a.status as AttendanceStatus;
            });
            setAttendance(prev => ({ ...prev, ...attendanceMap }));
        }
    }, [selectedBatchId, selectedDate]);

    // Load students when batch is selected
    useEffect(() => {
        const fetchStudents = async () => {
            if (selectedBatchId) {
                await loadBatchStudents();
            } else {
                setStudents([]);
                setAttendance({});
            }
        };
        fetchStudents();
    }, [selectedBatchId, loadBatchStudents]);

    // Load existing attendance when date changes
    useEffect(() => {
        const fetchAttendance = async () => {
            if (selectedBatchId && selectedDate) {
                await loadExistingAttendance();
            }
        };
        fetchAttendance();
    }, [selectedDate, selectedBatchId, loadExistingAttendance]);

    const setStatus = (studentId: number, status: AttendanceStatus) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const markAllPresent = () => {
        const updated: Record<number, AttendanceStatus> = {};
        students.forEach(s => {
            updated[s.studentId] = "Present";
        });
        setAttendance(updated);
        toast.success("All students marked as Present");
    };

    const handleSubmit = async () => {
        if (!selectedBatchId) {
            toast.error("Please select a batch");
            return;
        }

        setSubmitting(true);
        const records: AttendanceRecord[] = students.map(s => ({
            studentId: s.studentId,
            status: attendance[s.studentId] || "Absent"
        }));

        const result = await markAttendance(
            parseInt(selectedBatchId),
            new Date(selectedDate),
            records
        );

        setSubmitting(false);

        if (result.success) {
            toast.success(`Attendance marked for ${result.count} students`);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to mark attendance");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Controls */}
            <GlassCard className="p-8" intensity="medium">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                            Select Objective Batch
                        </label>
                        <select
                            className="flex h-12 w-full rounded-xl border border-input bg-white/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 backdrop-blur-sm transition-all shadow-sm"
                            value={selectedBatchId}
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                        >
                            <option value="">Choose a batch...</option>
                            {batches.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.name} {b.schedule && `(${b.schedule})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                            Session Date
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                className="flex h-12 w-full rounded-xl border border-input bg-white/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 backdrop-blur-sm transition-all shadow-sm"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={markAllPresent}
                            variant="glass"
                            disabled={students.length === 0}
                            className="w-full text-[10px] font-black uppercase tracking-widest gap-2"
                        >
                            <Check className="h-4 w-4" />
                            Reset All Present
                        </Button>
                    </div>
                </div>
            </GlassCard>

            {/* Students List */}
            {loading ? (
                <div className="text-center py-20 text-slate-400">
                    <div className="animate-pulse flex flex-col items-center">
                        <Users className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-sm font-black uppercase tracking-widest">Querying Enrollments...</p>
                    </div>
                </div>
            ) : selectedBatchId && students.length === 0 ? (
                <GlassCard className="p-20 text-center" intensity="low">
                    <Users className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tight">Empty Cohort</h3>
                    <p className="text-sm text-slate-400">No students are currently mapped to this academic unit.</p>
                </GlassCard>
            ) : students.length > 0 && (
                <GlassCard className="p-0 overflow-hidden" intensity="high">
                    <div className="p-8 border-b border-white/20 bg-white/40 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                {students.length} Total Enrolled
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">verification of presence</p>
                        </div>

                        <div className="flex gap-6 p-3 bg-white/30 rounded-2xl border border-white/20 backdrop-blur-md">
                            <div className="flex items-center gap-2 px-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                    {Object.values(attendance).filter(s => s === "Present").length} Present
                                </span>
                            </div>
                            <div className="w-px h-4 bg-white/20 self-center" />
                            <div className="flex items-center gap-2 px-3">
                                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                    {Object.values(attendance).filter(s => s === "Absent").length} Absent
                                </span>
                            </div>
                            <div className="w-px h-4 bg-white/20 self-center" />
                            <div className="flex items-center gap-2 px-3">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                    {Object.values(attendance).filter(s => s === "Late").length} Late
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
                        {students.map((s) => (
                            <div key={s.studentId} className="px-8 py-5 flex items-center justify-between group hover:bg-white/40 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{s.studentName}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Academic Grade: {s.studentClass}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setStatus(s.studentId, "Present")}
                                        className={cn(
                                            "p-3 rounded-xl border transition-all duration-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                            attendance[s.studentId] === "Present"
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border-emerald-400 translate-y--0.5"
                                                : "bg-white/50 text-slate-400 border-white/20 hover:border-emerald-300 hover:text-emerald-500"
                                        )}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        {attendance[s.studentId] === "Present" && "Present"}
                                    </button>
                                    <button
                                        onClick={() => setStatus(s.studentId, "Late")}
                                        className={cn(
                                            "p-3 rounded-xl border transition-all duration-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                            attendance[s.studentId] === "Late"
                                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 border-amber-400 translate-y--0.5"
                                                : "bg-white/50 text-slate-400 border-white/20 hover:border-amber-300 hover:text-amber-500"
                                        )}
                                    >
                                        <Clock className="h-4 w-4" />
                                        {attendance[s.studentId] === "Late" && "Late"}
                                    </button>
                                    <button
                                        onClick={() => setStatus(s.studentId, "Absent")}
                                        className={cn(
                                            "p-3 rounded-xl border transition-all duration-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                            attendance[s.studentId] === "Absent"
                                                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 border-red-400 translate-y--0.5"
                                                : "bg-white/50 text-slate-400 border-white/20 hover:border-red-300 hover:text-red-500"
                                        )}
                                    >
                                        <XCircle className="h-4 w-4" />
                                        {attendance[s.studentId] === "Absent" && "Absent"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 border-t border-white/20 bg-white/40">
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            variant="primary"
                            className="w-full text-[12px] font-black uppercase tracking-[0.2em] shadow-xl group"
                        >
                            {submitting ? "Synchronizing..." : "Commit Attendance Records"}
                            <Save className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform" />
                        </Button>
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
