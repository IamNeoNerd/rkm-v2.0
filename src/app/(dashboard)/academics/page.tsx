
import { getAllStaff } from "@/actions/staff";
import { getAllStudents } from "@/actions/admission";
import { getAllBatches } from "@/actions/academics";
import AcademicsClient from "./academics-client";
import { GraduationCap } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AcademicsPage() {
    // Auth check
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    // Determine if user can create/edit batches
    const canManageBatches = session.user.role === "admin" || session.user.role === "super-admin";

    // Parallel data fetching
    const [staffRes, studentsRes, batchesRes] = await Promise.all([
        getAllStaff(),
        getAllStudents(),
        getAllBatches()
    ]);

    const teachers = staffRes.success ? (staffRes.staff || []) : [];
    const students = studentsRes.students || [];
    const batches = batchesRes.batches || [];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-indigo-600" />
                    Academics & Batches
                </h1>
                <p className="text-gray-600 mt-1">Manage batches and student enrollments</p>
            </div>

            <AcademicsClient
                teachers={teachers}
                students={students}
                batches={batches}
                canManageBatches={canManageBatches}
            />
        </div>
    );
}
