import { getUsers } from "@/actions/users";
import { UsersTable } from "@/components/UsersTable";
import { ShieldCheck } from "lucide-react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <SettingsPageLayout
            title="User Management"
            description="Manage system administrators and their access levels."
            icon={ShieldCheck}
        >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <UsersTable initialUsers={users} />
            </div>
        </SettingsPageLayout>
    );
}
