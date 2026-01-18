"use client";

import { useState } from "react";
import { Users, Phone, GraduationCap, Filter, X, IndianRupee } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuickPaymentDialog } from "@/components/QuickPaymentDialog";

type Student = {
    id: number;
    name: string;
    class: string;
    fatherName: string | null;
    phone: string | null;
    isActive: boolean;
    familyId?: number;
    balance?: number | null;
};

interface StudentsTableProps {
    students: Student[];
}

export function StudentsTable({ students }: StudentsTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Payment dialog state
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Get unique classes for filter dropdown
    const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort();

    // Apply filters
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (student.phone?.includes(searchTerm) ?? false);

        const matchesClass = classFilter === "all" || student.class === classFilter;

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && student.isActive) ||
            (statusFilter === "inactive" && !student.isActive);

        return matchesSearch && matchesClass && matchesStatus;
    });

    const hasActiveFilters = searchTerm || classFilter !== "all" || statusFilter !== "all";

    const clearFilters = () => {
        setSearchTerm("");
        setClassFilter("all");
        setStatusFilter("all");
    };

    const handlePayClick = (student: Student) => {
        setSelectedStudent(student);
        setPaymentOpen(true);
    };

    return (
        <>
            {/* Filter Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 space-y-4">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="ml-auto text-red-600 hover:text-red-700"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear All
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <Input
                            placeholder="Name, father, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Class Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Class
                        </label>
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Classes</option>
                            {uniqueClasses.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>

                {/* Filter Results Count */}
                <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredStudents.length}</span> of{" "}
                    <span className="font-semibold">{students.length}</span> students
                </div>
            </div>

            {/* Students Table */}
            {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                    <p className="text-gray-600">Try adjusting your filters</p>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="mt-4"
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Class
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Father Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/students/${student.id}`}>
                                            <div className="text-sm font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer">
                                                {student.name}
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-700">
                                            <GraduationCap className="h-4 w-4 mr-2 text-indigo-600" />
                                            {student.class}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {student.fatherName || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-700">
                                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                            {student.phone || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {student.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                            onClick={() => handlePayClick(student)}
                                        >
                                            <IndianRupee className="h-3 w-3 mr-1" />
                                            Pay
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Quick Payment Dialog */}
            {selectedStudent && (
                <QuickPaymentDialog
                    open={paymentOpen}
                    onClose={() => {
                        setPaymentOpen(false);
                        setSelectedStudent(null);
                    }}
                    familyId={selectedStudent.familyId || 0}
                    familyName={selectedStudent.fatherName || "Family"}
                    studentName={selectedStudent.name}
                    currentDue={selectedStudent.balance ? Math.abs(selectedStudent.balance) : 0}
                />
            )}
        </>
    );
}

