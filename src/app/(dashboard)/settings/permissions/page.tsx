import { Shield } from "lucide-react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import PermissionsManagerClient from "@/components/PermissionsManager";

// Force dynamic rendering to avoid prerendering issues with client components
export const dynamic = "force-dynamic";

export default function PermissionsPage() {
    return (
        <SettingsPageLayout
            title="Role Permissions"
            description="Manage feature access for different user roles."
            icon={<Shield className="h-8 w-8 text-indigo-600" />}
        >
            <PermissionsManagerClient />
        </SettingsPageLayout>
    );
}
