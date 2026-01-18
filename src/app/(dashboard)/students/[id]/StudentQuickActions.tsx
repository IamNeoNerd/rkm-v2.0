"use client";

import { useState } from "react";
import { GraduationCap, Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuickPaymentDialog } from "@/components/QuickPaymentDialog";

interface StudentQuickActionsProps {
    studentName: string;
    familyId: number;
    fatherName: string;
    balance: number;
}

export function StudentQuickActions({
    studentName,
    familyId,
    fatherName,
    balance,
}: StudentQuickActionsProps) {
    const [paymentOpen, setPaymentOpen] = useState(false);

    const currentDue = balance < 0 ? Math.abs(balance) : 0;

    return (
        <>
            <div className="flex flex-wrap gap-3">
                <Link href="/academics">
                    <Button variant="outline">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Enroll in Batch
                    </Button>
                </Link>
                <Button
                    variant="outline"
                    onClick={() => setPaymentOpen(true)}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                >
                    <Receipt className="h-4 w-4 mr-2" />
                    Collect Fee
                </Button>
            </div>

            <QuickPaymentDialog
                open={paymentOpen}
                onClose={() => setPaymentOpen(false)}
                familyId={familyId}
                familyName={fatherName}
                studentName={studentName}
                currentDue={currentDue}
                onSuccess={() => {
                    // Optionally refresh the page
                    window.location.reload();
                }}
            />
        </>
    );
}
