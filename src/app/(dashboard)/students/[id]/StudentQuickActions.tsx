"use client";

import { useState } from "react";
import { GraduationCap, Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/modern/Button";
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
            <div className="flex flex-wrap gap-4 mt-6">
                <Link href="/academics">
                    <Button variant="glass" className="border-primary/20 bg-primary/5 hover:bg-primary/10">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Enroll in Batch
                    </Button>
                </Link>
                <Button
                    variant="primary"
                    onClick={() => setPaymentOpen(true)}
                    className="shadow-primary/20 shadow-lg"
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
                    // Refresh the page to reflect balance changes
                    window.location.reload();
                }}
            />
        </>
    );
}
