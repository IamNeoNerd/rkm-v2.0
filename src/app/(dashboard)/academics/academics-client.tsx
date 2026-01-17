"use client";

import { useState } from "react";
import { GraduationCap, Users, Clock, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBatch, enrollStudentInBatch } from "@/actions/academics";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Teacher = { id: number; name: string; role: string };
type Student = { id: number; name: string; class: string };
type Batch = { id: number; name: string; schedule: string | null; fee: number };

export default function AcademicsClient({
    teachers,
    students,
    batches,
    canManageBatches = false
}: {
    teachers: Teacher[];
    students: Student[];
    batches: Batch[];
    canManageBatches?: boolean;
}) {
    const router = useRouter();

    // Create Batch State
    const [batchName, setBatchName] = useState("");
    const [batchFee, setBatchFee] = useState("");
    const [batchSchedule, setBatchSchedule] = useState("");
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [isCreatingBatch, setIsCreatingBatch] = useState(false);

    // Enroll Student State
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [isEnrolling, setIsEnrolling] = useState(false);

    const handleCreateBatch = async () => {
        if (!batchName || !batchFee || !batchSchedule || !selectedTeacherId) {
            toast.error("Please fill all batch fields and select a teacher");
            return;
        }

        setIsCreatingBatch(true);
        const result = await createBatch({
            name: batchName,
            fee: parseFloat(batchFee),
            schedule: batchSchedule,
            teacherId: parseInt(selectedTeacherId),
        });
        setIsCreatingBatch(false);

        if (result.batch) {
            toast.success(`Batch "${result.batch.name}" created successfully!`);
            setBatchName("");
            setBatchFee("");
            setBatchSchedule("");
            setSelectedTeacherId("");
            router.refresh();
        } else {
            toast.error("Failed to create batch");
        }
    };

    const handleEnrollStudent = async () => {
        if (!selectedStudentId || !selectedBatchId) {
            toast.error("Please select both a student and a batch");
            return;
        }

        setIsEnrolling(true);
        const result = await enrollStudentInBatch(selectedStudentId, selectedBatchId);
        setIsEnrolling(false);

        if (result.success) {
            toast.success("Student enrolled successfully!");
            setSelectedStudentId("");
            setSelectedBatchId("");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to enroll student");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Batch Card */}
            {canManageBatches ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Plus className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Create New Batch</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Batch Name
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g., Physics Advanced"
                                value={batchName}
                                onChange={(e) => setBatchName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teacher
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedTeacherId}
                                onChange={(e) => setSelectedTeacherId(e.target.value)}
                            >
                                <option value="">Select a Teacher</option>
                                {teachers.filter(t => t.role === 'TEACHER').map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <DollarSign className="inline h-4 w-4" /> Monthly Fee
                                </label>
                                <Input
                                    type="number"
                                    placeholder="500"
                                    value={batchFee}
                                    onChange={(e) => setBatchFee(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Clock className="inline h-4 w-4" /> Schedule
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Mon/Wed 4-5pm"
                                    value={batchSchedule}
                                    onChange={(e) => setBatchSchedule(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleCreateBatch}
                            disabled={isCreatingBatch}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isCreatingBatch ? "Creating..." : "Create Batch"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Plus className="h-5 w-5 text-gray-400" />
                        <h2 className="text-xl font-semibold text-gray-500">Create New Batch</h2>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Only administrators can create new batches. Contact your admin for batch management.
                    </p>
                </div>
            )}

            {/* Enroll Student Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Enroll Student</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Student
                        </label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                        >
                            <option value="">Select a Student</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name} (Class {s.class})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Batch
                        </label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedBatchId}
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                        >
                            <option value="">Select a Batch</option>
                            {batches.map(b => (
                                <option key={b.id} value={b.id}>{b.name} ({b.schedule})</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={handleEnrollStudent}
                        disabled={isEnrolling}
                        className="w-full bg-green-600 hover:bg-green-700"
                    >
                        {isEnrolling ? "Enrolling..." : "Enroll Student"}
                    </Button>

                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> The system automatically checks for time conflicts when enrolling students.
                            If a student is already enrolled in another batch with the same schedule, enrollment will be rejected.
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Batches List */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Current Batches</h2>
                </div>

                {batches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No batches found. Create one to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {batches.map((batch) => (
                                    <tr key={batch.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{batch.name}</div>
                                            <div className="text-xs text-gray-500">ID: #{batch.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{batch.schedule || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">₹{batch.fee}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
}
