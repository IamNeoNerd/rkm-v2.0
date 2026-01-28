"use client";

import { useState, useEffect } from "react";
import { getTeacherBatchDetails, getBatchStudents, getBatchAttendance, markBatchAttendance } from "@/actions/teacher";
import { Calendar, ArrowLeft, Check, X, Clock, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useParams } from "next/navigation";

type Student = {
    id: number;
    name: string;
    class: string;
    isActive: boolean;
};

type AttendanceRecord = {
    studentId: number;
    status: "Present" | "Absent" | "Late";
};

export default function AttendanceMarkingPage() {
    const params = useParams();
    const batchId = parseInt((params?.id as string) || "0");

    const [batchName, setBatchName] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<number, "Present" | "Absent" | "Late">>({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batchId, date]);

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const [batchRes, studentsRes, attendanceRes] = await Promise.all([
                getTeacherBatchDetails(batchId),
                getBatchStudents(batchId),
                getBatchAttendance(batchId, date),
            ]);

            if (!batchRes.success) {
                setError(batchRes.error || "Failed to load batch");
                return;
            }

            setBatchName(batchRes.batch?.name || "");

            if (studentsRes.success && studentsRes.students) {
                setStudents(studentsRes.students);

                // Initialize attendance from existing records or default to Present
                const existingAttendance: Record<number, "Present" | "Absent" | "Late"> = {};

                if (attendanceRes.success && attendanceRes.attendance) {
                    attendanceRes.attendance.forEach((a: { studentId: number; status: string }) => {
                        existingAttendance[a.studentId] = a.status as "Present" | "Absent" | "Late";
                    });
                }

                // Set default for students without existing record
                studentsRes.students.forEach((s: Student) => {
                    if (!existingAttendance[s.id]) {
                        existingAttendance[s.id] = "Present";
                    }
                });

                setAttendance(existingAttendance);
            }
        } catch {
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    }

    function toggleStatus(studentId: number) {
        setAttendance(prev => {
            const current = prev[studentId] || "Present";
            const next = current === "Present" ? "Absent" : current === "Absent" ? "Late" : "Present";
            return { ...prev, [studentId]: next };
        });
    }

    async function handleSave() {
        setSaving(true);

        const records: AttendanceRecord[] = Object.entries(attendance).map(([studentId, status]) => ({
            studentId: parseInt(studentId),
            status,
        }));

        const result = await markBatchAttendance({
            batchId,
            date,
            records,
        });

        if (result.success) {
            toast.success(result.message || "Attendance saved successfully");
        } else {
            toast.error(result.error || "Failed to save attendance");
        }

        setSaving(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <p className="text-red-300">{error}</p>
            </div>
        );
    }

    const presentCount = Object.values(attendance).filter(s => s === "Present").length;
    const absentCount = Object.values(attendance).filter(s => s === "Absent").length;
    const lateCount = Object.values(attendance).filter(s => s === "Late").length;

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link
                href={`/teacher/batches/${batchId}`}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Batch
            </Link>

            {/* Header */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-emerald-400" />
                            Mark Attendance
                        </h1>
                        <p className="text-slate-400 mt-1">{batchName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">{presentCount}</div>
                    <div className="text-slate-400 text-sm">Present</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{absentCount}</div>
                    <div className="text-slate-400 text-sm">Absent</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">{lateCount}</div>
                    <div className="text-slate-400 text-sm">Late</div>
                </div>
            </div>

            {/* Attendance List */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">
                        {students.length} Students
                    </span>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Attendance
                    </button>
                </div>

                <div className="divide-y divide-slate-700">
                    {students.map((student) => {
                        const status = attendance[student.id] || "Present";
                        return (
                            <div
                                key={student.id}
                                className="p-4 flex items-center justify-between hover:bg-slate-700/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-white font-bold">
                                            {student.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{student.name}</p>
                                        <p className="text-slate-400 text-sm">{student.class}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleStatus(student.id)}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${status === "Present"
                                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                        : status === "Absent"
                                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                            : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                        }`}
                                >
                                    {status === "Present" && <Check className="h-4 w-4" />}
                                    {status === "Absent" && <X className="h-4 w-4" />}
                                    {status === "Late" && <Clock className="h-4 w-4" />}
                                    {status}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
