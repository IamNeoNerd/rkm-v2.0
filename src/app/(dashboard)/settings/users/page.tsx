import { getUsers } from "@/actions/users";
import { UsersTable } from "@/components/UsersTable";
import { ShieldCheck } from "lucide-react";

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-indigo-600" />
                        User Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage system administrators and their access levels.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <UsersTable initialUsers={users} />
            </div>
        </div>
    );
}
