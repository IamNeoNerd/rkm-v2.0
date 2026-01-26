"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { GraduationCap, Clock, AlertCircle, Activity, User } from "lucide-react";
import { AttendanceCalendar } from "./AttendanceCalendar";
import { getStudentAttendance, getStudentBatches } from "@/actions/parent";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/modern/Card";
import { cn } from "@/lib/utils";

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
    const [isPending, startTransition] = useTransition();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [attendance, setAttendance] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [batches, setBatches] = useState<any[]>([]);

    useEffect(() => {
        if (!student || !isOpen) return;

        let isMounted = true;

        startTransition(async () => {
            try {
                const [attRes, batchRes] = await Promise.all([
                    getStudentAttendance(student.id),
                    getStudentBatches(student.id)
                ]);
                if (isMounted) {
                    setAttendance(attRes.attendance || []);
                    setBatches(batchRes.batches || []);
                }
            } catch (error) {
                console.error("Error loading student details:", error);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [student, isOpen]);

    if (!student) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                            <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Entity Profile</p>
                            <SheetTitle className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{student.name}</SheetTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node ID:</span>
                                <span className="text-[10px] font-black text-slate-900 font-mono">#{student.id.toString().padStart(4, '0')}</span>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs defaultValue="attendance" className="w-full mt-8">
                    <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100/50 rounded-2xl mb-8">
                        <TabsTrigger value="attendance" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg text-[10px] font-black uppercase tracking-widest gap-2">
                            <Activity className="h-3.5 w-3.5" />
                            Pulse Sync
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg text-[10px] font-black uppercase tracking-widest gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            Temporal Node
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="attendance">
                        {isPending ? (
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
                        {isPending ? (
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {batches.length > 0 ? (
                                    batches.map(batch => (
                                        <GlassCard key={batch.id} className="p-5 border-white/60 shadow-lg space-y-4 hover:border-indigo-500/20 transition-all duration-300" intensity="medium">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instructional Node</p>
                                                    <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{batch.name}</h4>
                                                </div>
                                                <div className={cn(
                                                    "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                                    batch.isActive
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        : "bg-red-50 text-red-600 border-red-100"
                                                )}>
                                                    {batch.isActive ? "ACTIVE" : "OFFLINE"}
                                                </div>
                                            </div>

                                            <div className="grid gap-3 pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                        <Clock className="h-4 w-4 text-indigo-500" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{batch.schedule || "ST_SCHEDULE_NULL"}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-purple-500" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">INSTRUCTOR: {batch.teacherName || "UNASSIGNED"}</span>
                                                </div>
                                            </div>
                                        </GlassCard>
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
