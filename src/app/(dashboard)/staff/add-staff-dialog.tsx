"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { createStaff, StaffRole } from "@/actions/staff";
import { getStaffRoleTypes } from "@/actions/staff-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CustomRoleType {
    id: number;
    name: string;
}

export function AddStaffDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [customRoleTypes, setCustomRoleTypes] = useState<CustomRoleType[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        role: "STAFF" as StaffRole, // Default to STAFF for non-teaching staff
        roleType: "", // For custom roles
        baseSalary: "",
    });

    const loadRoleTypes = useCallback(async () => {
        const res = await getStaffRoleTypes();
        if (res.success && res.roleTypes) {
            setCustomRoleTypes(res.roleTypes);
        }
    }, []);

    useEffect(() => {
        if (open) {
            loadRoleTypes();
        }
    }, [open, loadRoleTypes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createStaff({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || undefined,
            role: formData.role,
            roleType: formData.roleType || undefined,
            baseSalary: parseInt(formData.baseSalary) || 0
        });

        setLoading(false);

        if (res.success) {
            toast.success("Staff member added successfully");
            setOpen(false);
            setFormData({ name: "", phone: "", email: "", role: "TEACHER", roleType: "", baseSalary: "" });
        } else {
            toast.error(res.error || "Failed to add staff");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Staff
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Staff</DialogTitle>
                    <DialogDescription>
                        Create a profile for a teacher, receptionist, admin, or support staff.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">Name</label>
                        <Input
                            required
                            className="col-span-3"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">Phone</label>
                        <Input
                            required
                            className="col-span-3"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            className="col-span-3"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">System Role</label>
                        <select
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                        >
                            <option value="STAFF">Staff (No System Access)</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="RECEPTIONIST">Receptionist</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">Staff Type</label>
                        <select
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.roleType}
                            onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                        >
                            <option value="">-- Select Custom Type (Optional) --</option>
                            {customRoleTypes.map((rt) => (
                                <option key={rt.id} value={rt.name}>{rt.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">Salary</label>
                        <Input
                            type="number"
                            required
                            className="col-span-3"
                            value={formData.baseSalary}
                            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Staff"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
