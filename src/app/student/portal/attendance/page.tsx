import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { students, attendance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AttendanceCalendar } from "@/components/parent/AttendanceCalendar";
import { GlassCard } from "@/components/modern/Card";
import { Activity, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function AttendancePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role !== "student") {
        redirect("/");
    }

    interface StudentAttendanceData {
        id: number;
        attendance: Array<{
            id: number;
            status: string;
            date: string | Date;
        }>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studentData = (await (db as any).query.students.findFirst({
        where: eq(students.userId, session.user.id as string),
        with: {
            attendance: {
                orderBy: [desc(attendance.date)]
            }
        }
    })) as StudentAttendanceData | undefined;

    if (!studentData) {
        redirect("/student/portal");
    }

    // Adapt attendance records for the calendar
    const attendanceRecords = studentData.attendance.map((a: { date: string | Date; status: string }) => ({
        date: typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0],
        status: a.status
    }));

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link href="/student/portal" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 hover:gap-3 transition-all">
                        <ChevronLeft className="h-3 w-3" /> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">
                        Attendance <span className="text-primary not-italic">Log</span>
                    </h1>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <AttendanceCalendar attendance={attendanceRecords} />
                </div>

                <div className="space-y-6">
                    <GlassCard className="p-6" intensity="high">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <Activity className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Sync Status</h3>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            Your attendance is synchronized in real-time with the central instructional node.
                            If you notice any discrepancies in the temporal log, please notify your batch instructor immediately.
                        </p>

                        <div className="mt-6 pt-6 border-t border-white/20 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overall Reliability</span>
                                <span className="text-sm font-black text-emerald-600">Optimal</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[92%]" />
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 border-dashed" intensity="low">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Protocol Reference</h4>
                        <ul className="space-y-2 text-[10px] font-bold text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PRESENT: Active connection established
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> ABSENT: Connection failed
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> LATE: Delayed synchronization
                            </li>
                        </ul>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
