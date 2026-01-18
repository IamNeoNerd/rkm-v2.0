import { getAllStaff } from "@/actions/staff";
import { AddStaffDialog } from "./add-staff-dialog";
import { EditStaffDialog } from "./edit-staff-dialog";
import { DeactivateStaffButton } from "./deactivate-staff-button";
import { StaffRoleTypesManager } from "./staff-role-types-manager";
import { Users, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Users className="h-8 w-8 text-indigo-600" />
                        Staff Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage teachers, receptionists, admins, and support staff</p>
                </div>
                <AddStaffDialog />
            </div>

            {/* Custom Staff Types Manager */}
            <StaffRoleTypesManager />

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Salary
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {staff && staff.length > 0 ? (
                            staff.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`h-10 w-10 flex-shrink-0 ${employee.isActive ? 'bg-indigo-100' : 'bg-gray-100'} rounded-full flex items-center justify-center ${employee.isActive ? 'text-indigo-700' : 'text-gray-500'} font-bold`}>
                                                {employee.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className={`text-sm font-medium ${employee.isActive ? 'text-gray-900' : 'text-gray-500'}`}>{employee.name}</div>
                                                <div className="text-sm text-gray-500">ID: #{employee.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            {/* Show roleType (custom type) if available */}
                                            {employee.roleType && (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                                    {employee.roleType}
                                                </span>
                                            )}
                                            {/* Show system role */}
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${employee.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    employee.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                                                        employee.role === 'STAFF' ? 'bg-gray-100 text-gray-600' :
                                                            'bg-green-100 text-green-800'}`}>
                                                {employee.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 flex items-center gap-1">
                                            <Phone className="h-3 w-3 text-gray-400" /> {employee.phone}
                                        </div>
                                        {employee.email && (
                                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Mail className="h-3 w-3 text-gray-400" /> {employee.email}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ₹{employee.baseSalary}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {employee.createdAt ? format(new Date(employee.createdAt), "MMM dd, yyyy") : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {employee.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <EditStaffDialog staff={employee} />
                                            {isSuperAdmin && (
                                                <DeactivateStaffButton
                                                    staffId={employee.id}
                                                    name={employee.name}
                                                    isActive={employee.isActive}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No staff members found. Click &quot;Add Staff&quot; to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
