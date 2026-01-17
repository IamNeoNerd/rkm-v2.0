import { db } from "@/db";
import { batches, enrollments, students, families } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { GraduationCap, Users, DollarSign, Clock, ArrowLeft, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

    const activeStudents = enrolledStudents.filter(s => s.isActive);
    const inactiveStudents = enrolledStudents.filter(s => !s.isActive);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Link href="/academics">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Academics
                </Button>
            </Link>

            {/* Batch Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="h-8 w-8 text-indigo-600" />
                            {batch.name}
                        </h1>
                        <p className="text-gray-600 mt-1">Batch ID: #{batch.id}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Enrollment Count</div>
                        <div className="text-3xl font-bold text-indigo-600">{activeStudents.length}</div>
                        <div className="text-xs text-gray-500">{inactiveStudents.length} inactive</div>
                    </div>
                </div>

                {/* Batch Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                    <div>
                        <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Monthly Fee
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">₹{batch.fee}</div>
                    </div>
                    <div>
                        <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                            <Clock className="h-4 w-4 mr-1" />
                            Schedule
                        </div>
                        <div className="text-lg font-medium text-gray-900">{batch.schedule}</div>
                    </div>
                    <div>
                        <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                            <Users className="h-4 w-4 mr-1" />
                            Teacher ID
                        </div>
                        <div className="text-lg font-medium text-gray-900">#{batch.teacherId}</div>
                    </div>
                </div>
            </div>

            {/* Active Students */}
            {activeStudents.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="h-6 w-6 text-green-600" />
                        Active Students ({activeStudents.length})
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Class
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Father Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activeStudents.map((student) => (
                                    <tr key={student.studentId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/students/${student.studentId}`}>
                                                <div className="text-sm font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer">
                                                    {student.studentName}
                                                </div>
                                            </Link>
                                            <div className="text-xs text-gray-500">ID: #{student.studentId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {student.studentClass}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {student.fatherName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-700">
                                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                                {student.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link href={`/fees?familyId=${student.familyId}`}>
                                                <Button variant="outline" size="sm">
                                                    Collect Fee
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Students</h3>
                    <p className="text-gray-600">This batch has no active enrollments yet.</p>
                </div>
            )}

            {/* Inactive Students (if any) */}
            {inactiveStudents.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        Inactive Students ({inactiveStudents.length})
                    </h3>
                    <div className="space-y-2">
                        {inactiveStudents.map((student) => (
                            <div key={student.studentId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <span className="font-medium text-gray-700">{student.studentName}</span>
                                    <span className="text-sm text-gray-500 ml-2">({student.studentClass})</span>
                                </div>
                                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">Inactive</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
