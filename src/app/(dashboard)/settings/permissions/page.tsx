import { Shield } from "lucide-react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import PermissionsManagerClient from "@/components/PermissionsManager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function PermissionsPage() {
    const session = await auth();

    // Strict super-admin restriction
    if (session?.user?.role !== "super-admin") {
        redirect("/");
    }

    return (
        <SettingsPageLayout
            title="RBAC Configuration Matrix"
            description="Manage granular feature protocols and role-based access vectors."
            showNavigation={false}
            icon={<Shield className="h-8 w-8 text-indigo-500" />}
        >
            <PermissionsManagerClient />
        </SettingsPageLayout>
    );
}
