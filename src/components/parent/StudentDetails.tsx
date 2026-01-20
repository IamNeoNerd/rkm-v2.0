"use client";

import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { GraduationCap, Calendar, Clock, User, AlertCircle } from "lucide-react";
import { AttendanceCalendar } from "./AttendanceCalendar";
import { getStudentAttendance, getStudentBatches } from "@/actions/parent";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
    id: number;
    name: string;
    class: string;
}

interface StudentDetailsProps {
    student: Student | null;
    isOpen: boolean;
    onClose: () => void;
}

export function StudentDetails({ student, isOpen, onClose }: StudentDetailsProps) {
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    useEffect(() => {
        if (student && isOpen) {
            setLoading(true);
            Promise.all([
                getStudentAttendance(student.id),
                getStudentBatches(student.id)
            ]).then(([attRes, batchRes]) => {
                setAttendance(attRes.attendance || []);
                setBatches(batchRes.batches || []);
                setLoading(false);
            }).catch(error => {
                console.error("Error loading student details:", error);
                setLoading(false);
            });
        }
    }, [student, isOpen]);

    if (!student) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-3 rounded-full">
                            <GraduationCap className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-bold">{student.name}</SheetTitle>
                            <SheetDescription>{student.class}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs defaultValue="attendance" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="attendance" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Attendance
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Schedule
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="attendance">
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-[300px] w-full" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <AttendanceCalendar attendance={attendance} />

                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3 text-sm text-blue-800">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <p>
                                        Attendance is updated daily by the teachers. Contact the administration for any discrepancies.
                                    </p>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="schedule">
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {batches.length > 0 ? (
                                    batches.map(batch => (
                                        <div key={batch.id} className="p-4 rounded-xl border-2 border-slate-100 bg-white shadow-sm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-900">{batch.name}</h4>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${batch.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {batch.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            <div className="grid gap-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="h-4 w-4 text-indigo-500" />
                                                    <span>{batch.schedule || "No schedule set"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <User className="h-4 w-4 text-indigo-500" />
                                                    <span>Teacher: {batch.teacherName || "Not assigned"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p>No batches found for this session.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
