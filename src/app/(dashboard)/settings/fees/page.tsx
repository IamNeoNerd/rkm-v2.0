"use client";

import { useState, useEffect, useCallback } from "react";
import { getFeeStructures, createFeeStructure, updateFeeStructure, deleteFeeStructure } from "@/actions/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, IndianRupee, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";

interface FeeStructure {
    id: number;
    className: string;
    monthlyFee: number;
    admissionFee: number;
    isActive: boolean;
}

export default function FeesSettingsPage() {
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        className: "",
        monthlyFee: "",
        admissionFee: "",
    });

    const loadStructures = useCallback(async () => {
        const result = await getFeeStructures();
        if (result.success && result.feeStructures) {
            setStructures(result.feeStructures);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadStructures();
        };
        init();
    }, [loadStructures]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const data = {
            className: formData.className,
            monthlyFee: parseInt(formData.monthlyFee),
            admissionFee: parseInt(formData.admissionFee) || 0,
        };

        let result;
        if (editingId) {
            result = await updateFeeStructure(editingId, data);
        } else {
            result = await createFeeStructure(data);
        }

        if (result.success) {
            toast.success(editingId ? "Fee structure updated" : "Fee structure created");
            setDialogOpen(false);
            resetForm();
            loadStructures();
        } else {
            toast.error(result.error || "Operation failed");
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this fee structure?")) return;

        const result = await deleteFeeStructure(id);
        if (result.success) {
            toast.success("Fee structure deleted");
            loadStructures();
        } else {
            toast.error(result.error || "Delete failed");
        }
    }

    function resetForm() {
        setFormData({ className: "", monthlyFee: "", admissionFee: "" });
        setEditingId(null);
    }

    function openEdit(structure: FeeStructure) {
        setFormData({
            className: structure.className,
            monthlyFee: structure.monthlyFee.toString(),
            admissionFee: structure.admissionFee.toString(),
        });
        setEditingId(structure.id);
        setDialogOpen(true);
    }

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <SettingsPageLayout
            title="Fee Structure"
            description="Configure class-wise monthly and admission fees"
            icon={IndianRupee}
            maxWidth="lg"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6">
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Fee Structure</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit" : "Add"} Fee Structure</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="className">Class Name</Label>
                                <Input
                                    id="className"
                                    value={formData.className}
                                    onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
                                    placeholder="e.g., Class 10"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="monthlyFee">Monthly Fee (₹)</Label>
                                <Input
                                    id="monthlyFee"
                                    type="number"
                                    value={formData.monthlyFee}
                                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyFee: e.target.value }))}
                                    placeholder="e.g., 3000"
                                    required
                                    min="0"
                                />
                            </div>
                            <div>
                                <Label htmlFor="admissionFee">Admission Fee (₹)</Label>
                                <Input
                                    id="admissionFee"
                                    type="number"
                                    value={formData.admissionFee}
                                    onChange={(e) => setFormData(prev => ({ ...prev, admissionFee: e.target.value }))}
                                    placeholder="e.g., 1000"
                                    min="0"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingId ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {structures.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No fee structures defined</h3>
                    <p className="text-gray-500 mt-1">Add your first fee structure to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monthly Fee</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Admission Fee</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {structures.map((structure) => (
                                    <tr key={structure.id} className="hover:bg-gray-50">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-900">{structure.className}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-gray-900 font-semibold">
                                            ₹{structure.monthlyFee.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-gray-600 hidden sm:table-cell">
                                            ₹{structure.admissionFee.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEdit(structure)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(structure.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </SettingsPageLayout>
    );
}
