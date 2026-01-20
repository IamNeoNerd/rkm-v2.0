import { getUsers } from "@/actions/users";
import { UsersTable } from "@/components/UsersTable";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";

export default async function UsersPage() {
    const result = await getUsers();

    return (
        <SettingsPageLayout
            title="User Management"
            description="Manage system administrators and their access levels."
            icon={<ShieldCheck className="h-8 w-8 text-indigo-600" />}
        >
            {!result.success ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700">{result.error || "Failed to load users"}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <UsersTable initialUsers={result.users} />
                </div>
            )}
        </SettingsPageLayout>
    );
}

