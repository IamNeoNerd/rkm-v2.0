import { db } from "@/db";
import { batches, enrollments, students, families } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { GraduationCap, Users, DollarSign, Clock, ArrowLeft, Phone, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/modern/Button";
import { GlassCard } from "@/components/modern/Card";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch batch details
    const [batch] = await db.select().from(batches).where(eq(batches.id, parseInt(id)));

    if (!batch) {
        notFound();
    }

    // Fetch enrolled students with their family details
    const enrolledStudents = await db
        .select({
            studentId: students.id,
            studentName: students.name,
            studentClass: students.class,
            isActive: enrollments.isActive,
            familyId: families.id,
            fatherName: families.fatherName,
            phone: families.phone,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .innerJoin(families, eq(students.familyId, families.id))
        .where(eq(enrollments.batchId, parseInt(id)));

    type EnrolledStudent = typeof enrolledStudents[number];
    const activeStudents = enrolledStudents.filter((s: EnrolledStudent) => s.isActive);
    const inactiveStudents = enrolledStudents.filter((s: EnrolledStudent) => !s.isActive);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link href="/academics">
                <Button variant="ghost" size="sm" className="group text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Academics
                </Button>
            </Link>

            {/* Batch Header */}
            <GlassCard className="p-10 overflow-hidden relative" intensity="high">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20">
                            <GraduationCap className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Academic Batch Profile</p>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                                {batch.name}
                            </h1>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-white/40 rounded-full border border-white/20">
                                    ID: #{batch.id}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                    <ShieldCheck className="h-3 w-3" />
                                    Operational
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 p-2 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
                        <div className="px-6 py-4 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active</p>
                            <div className="text-3xl font-black text-primary">{activeStudents.length}</div>
                        </div>
                        <div className="w-px h-12 bg-white/20 self-center" />
                        <div className="px-6 py-4 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inactive</p>
                            <div className="text-3xl font-black text-slate-300">{inactiveStudents.length}</div>
                        </div>
                    </div>
                </div>

                {/* Batch Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-10 border-t border-white/20 relative">
                    <div className="group">
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                            <DollarSign className="h-3 w-3 mr-2 text-primary" />
                            Monthly Tuition
                        </div>
                        <div className="text-3xl font-black text-slate-900 group-hover:text-primary transition-colors">
                            ₹{batch.fee.toLocaleString()}
                        </div>
                    </div>

                    <div className="group">
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                            <Clock className="h-3 w-3 mr-2 text-primary" />
                            Session Schedule
                        </div>
                        <div className="text-xl font-bold text-slate-700">
                            {batch.schedule}
                        </div>
                    </div>

                    <div className="group">
                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                            <UserCheck className="h-3 w-3 mr-2 text-primary" />
                            Assigned Facilitator
                        </div>
                        <div className="text-xl font-bold text-slate-700">
                            Instructor ID #{batch.teacherId}
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Active Students List */}
            <GlassCard className="p-0 overflow-hidden" intensity="medium">
                <div className="p-8 border-b border-white/20 bg-white/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Users className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Enrolled Cohort</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Currently Active Members ({activeStudents.length})</p>
                        </div>
                    </div>
                </div>

                {activeStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <th className="px-8 py-5 text-left border-b border-white/20">Identified Student</th>
                                    <th className="px-8 py-5 text-left border-b border-white/20">Academic Grade</th>
                                    <th className="px-8 py-5 text-left border-b border-white/20">Parent/Guardian</th>
                                    <th className="px-8 py-5 text-left border-b border-white/20">Contact Channel</th>
                                    <th className="px-8 py-5 text-right border-b border-white/20">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {activeStudents.map((student: EnrolledStudent) => (
                                    <tr key={student.studentId} className="group hover:bg-white/40 transition-colors duration-200">
                                        <td className="px-8 py-6">
                                            <Link href={`/students/${student.studentId}`}>
                                                <div className="text-sm font-black text-primary hover:brightness-110 transition-all cursor-pointer">
                                                    {student.studentName}
                                                </div>
                                            </Link>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">ID: #{student.studentId}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-slate-700">Class {student.studentClass}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-medium text-slate-700">{student.fatherName}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center text-sm font-medium text-slate-500 gap-2">
                                                <div className="p-1.5 bg-slate-100 rounded-lg">
                                                    <Phone className="h-3 w-3" />
                                                </div>
                                                {student.phone}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link href={`/fees?familyId=${student.familyId}`}>
                                                <Button variant="glass" size="sm" className="gap-2 text-[10px] uppercase font-black tracking-widest">
                                                    Collect Fee
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 text-center opacity-50">
                        <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-bold text-slate-400 uppercase tracking-tight">Zero Active Enrollments</h3>
                        <p className="text-sm text-slate-400">This batch profile currently has no active attendees.</p>
                    </div>
                )}
            </GlassCard>

            {/* Inactive Students */}
            {inactiveStudents.length > 0 && (
                <GlassCard className="p-8 bg-slate-50/50 border-dashed" intensity="low">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="h-5 w-5 text-slate-400" />
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Inactive Records ({inactiveStudents.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inactiveStudents.map((student: EnrolledStudent) => (
                            <div key={student.studentId} className="flex justify-between items-center p-4 bg-white/40 border border-white/20 rounded-2xl group hover:border-slate-200 transition-all">
                                <div>
                                    <div className="text-sm font-bold text-slate-600">{student.studentName}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Class {student.studentClass}</div>
                                </div>
                                <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-widest border border-slate-200/50">ARCHIVED</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
