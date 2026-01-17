import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AuditLogsClient from "./audit-logs-client";

export default async function AuditLogsPage() {
    // Auth check - super-admin only
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    if (session.user.role !== "super-admin") {
        redirect("/settings");
    }

    return <AuditLogsClient />;
}
