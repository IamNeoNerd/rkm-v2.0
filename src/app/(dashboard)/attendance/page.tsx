import { getAllBatches } from "@/actions/academics";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AttendanceClient from "./attendance-client";
import { Calendar } from "lucide-react";

export default async function AttendancePage() {
    // Auth check
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { batches } = await getAllBatches();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-8 w-8 text-indigo-600" />
                    Attendance
                </h1>
                <p className="text-gray-600 mt-1">Mark and manage student attendance for batches</p>
            </div>

            <AttendanceClient batches={batches} />
        </div>
    );
}
