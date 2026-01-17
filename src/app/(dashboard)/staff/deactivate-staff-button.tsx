"use client";

import { useState } from "react";
import { Trash2, RotateCcw } from "lucide-react";
import { deactivateStaff, reactivateStaff } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeactivateStaffButton({ staffId, name, isActive }: { staffId: number; name: string; isActive: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDeactivate = async () => {
        setLoading(true);
        const res = await deactivateStaff(staffId);
        setLoading(false);

        if (res.success) {
            toast.success(`${name} has been deactivated`);
            router.refresh();
        } else {
            toast.error(res.error || "Failed to deactivate staff");
        }
    };

    const handleReactivate = async () => {
        setLoading(true);
        const res = await reactivateStaff(staffId);
        setLoading(false);

        if (res.success) {
            toast.success(`${name} has been reactivated`);
            router.refresh();
        } else {
            toast.error(res.error || "Failed to reactivate staff");
        }
    };

    if (!isActive) {
        return (
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleReactivate}
                disabled={loading}
            >
                <RotateCcw className="h-4 w-4 text-green-600" />
            </Button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate {name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will deactivate the staff member. They will no longer appear in active lists
                        and cannot be assigned to new batches. This action can be reversed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeactivate}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loading}
                    >
                        {loading ? "Deactivating..." : "Deactivate"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
