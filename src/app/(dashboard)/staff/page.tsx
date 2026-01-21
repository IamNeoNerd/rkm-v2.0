import { getAllStaff } from "@/actions/staff";
import StaffClient from "./staff-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
    // Role check: Only admin and super-admin can access staff management
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    if (session.user.role !== "admin" && session.user.role !== "super-admin") {
        redirect("/");
    }

    const isSuperAdmin = session.user.role === "super-admin";
    const { staff } = await getAllStaff();

    // Map staff to the component's expected format
    const formattedStaff = (staff || []).map(s => ({
        ...s,
        createdAt: s.createdAt || null
    }));

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <StaffClient
                initialStaff={formattedStaff}
                isSuperAdmin={isSuperAdmin}
            />
        </div>
    );
}
