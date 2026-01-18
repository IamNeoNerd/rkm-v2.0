"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle, XCircle, Clock, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    markAttendance,
    getBatchStudentsForAttendance,
    getAttendanceByBatch,
    AttendanceStatus
} from "@/actions/attendance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Batch
                        </label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Date
                        </label>
                        <input
                            type="date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={markAllPresent}
                            variant="outline"
                            disabled={students.length === 0}
                            className="w-full"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Mark All Present
                        </Button>
                    </div>
                </div>
            </div>

            {/* Students List */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading students...</div>
            ) : selectedBatchId && students.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No students enrolled in this batch</p>
                </div>
            ) : students.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">
                            {students.length} Student{students.length !== 1 && 's'}
                        </h3>
                        <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                {Object.values(attendance).filter(s => s === "Present").length} Present
                            </span>
                            <span className="flex items-center gap-1 text-red-600">
                                <XCircle className="h-4 w-4" />
                                {Object.values(attendance).filter(s => s === "Absent").length} Absent
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600">
                                <Clock className="h-4 w-4" />
                                {Object.values(attendance).filter(s => s === "Late").length} Late
                            </span>
                        </div>
                    </div>

                    <div className="divide-y">
                        {students.map((s) => (
                            <div key={s.studentId} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">{s.studentName}</p>
                                    <p className="text-sm text-gray-500">Class {s.studentClass}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={attendance[s.studentId] === "Present" ? "default" : "outline"}
                                        className={attendance[s.studentId] === "Present" ? "bg-green-600 hover:bg-green-700" : ""}
                                        onClick={() => setStatus(s.studentId, "Present")}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={attendance[s.studentId] === "Late" ? "default" : "outline"}
                                        className={attendance[s.studentId] === "Late" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                                        onClick={() => setStatus(s.studentId, "Late")}
                                    >
                                        <Clock className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={attendance[s.studentId] === "Absent" ? "default" : "outline"}
                                        className={attendance[s.studentId] === "Absent" ? "bg-red-600 hover:bg-red-700" : ""}
                                        onClick={() => setStatus(s.studentId, "Absent")}
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t bg-gray-50">
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                            {submitting ? "Saving..." : "Save Attendance"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
