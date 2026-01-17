"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createStaff, StaffRole } from "@/actions/staff";
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

export function AddStaffDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        role: "TEACHER" as StaffRole,
        baseSalary: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createStaff({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || undefined,
            role: formData.role,
            baseSalary: parseInt(formData.baseSalary) || 0
        });

        setLoading(false);

        if (res.success) {
            toast.success("Staff member added successfully");
            setOpen(false);
            setFormData({ name: "", phone: "", email: "", role: "TEACHER", baseSalary: "" });
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
                        Create a profile for a teacher, receptionist, or admin.
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
                        <label className="text-right text-sm font-medium">Role</label>
                        <select
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                        >
                            <option value="TEACHER">Teacher</option>
                            <option value="RECEPTIONIST">Receptionist</option>
                            <option value="ADMIN">Admin</option>
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
