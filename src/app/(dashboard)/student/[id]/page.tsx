"use client"

import { use } from "react"
import { Calendar, User, BookOpen } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// MOCK DATA
const MOCK_STUDENT = {
    id: "ST-2024-001",
    name: "Rahul Kumar",
    class: "Class X - A",
    rollNo: "12",
    dob: "2008-04-15",
    fatherName: "Rajesh Kumar",
    contact: "+91 98765 43210",
    address: "H.No 123, Sector 4, R.K. Puram, New Delhi",
    status: "ACTIVE",
    fees: {
        totalDue: -5000,
        lastPaymentDate: "2024-01-10",
        lastPaymentAmount: 2000
    },
    attendance: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT' // 90% attendance
    })),
    academics: [
        { exam: "Unit Test 1", subject: "Mathematics", marks: "18/20", grade: "A" },
        { exam: "Unit Test 1", subject: "Science", marks: "19/20", grade: "A+" },
        { exam: "Unit Test 1", subject: "English", marks: "16/20", grade: "B+" },
        { exam: "Half Yearly", subject: "Mathematics", marks: "75/80", grade: "A" },
        { exam: "Half Yearly", subject: "Science", marks: "72/80", grade: "A" },
        { exam: "Half Yearly", subject: "English", marks: "68/80", grade: "A" },
    ]
}

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use(), id is used for future API calls
    use(params);
    // mocked anyway

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{MOCK_STUDENT.name}</h1>
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="font-medium">{MOCK_STUDENT.class}</span>
                                <span>•</span>
                                <span>Roll No: {MOCK_STUDENT.rollNo}</span>
                            </div>
                        </div>
                    </div>
                    <Badge
                        variant={MOCK_STUDENT.status === 'ACTIVE' ? 'success' : 'secondary'}
                        className="w-fit px-4 py-1.5"
                    >
                        {MOCK_STUDENT.status}
                    </Badge>
                </div>

                {/* content */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                        <TabsTrigger value="academic">Academic</TabsTrigger>
                    </TabsList>

                    {/* TAB 1: OVERVIEW */}
                    <TabsContent value="overview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-slate-500">Father&apos;s Name</span>
                                    <p className="font-medium">{MOCK_STUDENT.fatherName}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-slate-500">Contact Number</span>
                                    <p className="font-medium">{MOCK_STUDENT.contact}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-slate-500">Date of Birth</span>
                                    <p className="font-medium">{MOCK_STUDENT.dob}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <span className="text-sm font-medium text-slate-500">Address</span>
                                    <p className="font-medium">{MOCK_STUDENT.address}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Fee Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
                                    <span className="font-medium text-slate-500">Current Balance</span>
                                    <span className={cn(
                                        "text-lg font-bold",
                                        MOCK_STUDENT.fees.totalDue < 0 ? "text-red-500" : "text-green-600"
                                    )}>
                                        {MOCK_STUDENT.fees.totalDue < 0
                                            ? `Due: ₹${Math.abs(MOCK_STUDENT.fees.totalDue)}`
                                            : `Advance: ₹${MOCK_STUDENT.fees.totalDue}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Last Payment: {MOCK_STUDENT.fees.lastPaymentDate}</span>
                                    <span>Amount: ₹{MOCK_STUDENT.fees.lastPaymentAmount}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 2: ATTENDANCE */}
                    <TabsContent value="attendance">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                    Attendance (Last 30 Days)
                                </CardTitle>
                                <CardDescription>
                                    Green indicates present, Red indicates absent.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-2 sm:grid-cols-10 md:grid-cols-10">
                                    {MOCK_STUDENT.attendance.map((day, i) => (
                                        <div
                                            key={i}
                                            className="group relative"
                                        >
                                            <div
                                                className={cn(
                                                    "aspect-square w-full rounded-md transition-all hover:scale-105",
                                                    day.status === 'PRESENT' ? "bg-emerald-500 shadow-emerald-200" : "bg-red-500 shadow-red-200"
                                                )}
                                            />
                                            <div className="absolute -bottom-6 left-1/2 hidden w-max -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white group-hover:block z-10">
                                                {day.date}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex items-center justify-end gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                        <span>Present</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                        <span>Absent</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 3: ACADEMIC */}
                    <TabsContent value="academic">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-indigo-600" />
                                    Academic Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-hidden rounded-lg border border-slate-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Exam Name</th>
                                                <th className="px-4 py-3 font-medium">Subject</th>
                                                <th className="px-4 py-3 font-medium">Marks</th>
                                                <th className="px-4 py-3 font-medium">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {MOCK_STUDENT.academics.map((record, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-medium">{record.exam}</td>
                                                    <td className="px-4 py-3 text-slate-600">{record.subject}</td>
                                                    <td className="px-4 py-3 font-mono text-slate-700">{record.marks}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className={cn(
                                                            "border-0 bg-opacity-10 backdrop-blur-sm",
                                                            record.grade.startsWith('A') ? "text-emerald-700 bg-emerald-100" :
                                                                record.grade.startsWith('B') ? "text-blue-700 bg-blue-100" :
                                                                    "text-amber-700 bg-amber-100"
                                                        )}>
                                                            {record.grade}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
