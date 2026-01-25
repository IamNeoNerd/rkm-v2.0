"use client";

import { useState } from "react";
import { GraduationCap, Receipt, KeyRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/modern/Button";
import { QuickPaymentDialog } from "@/components/QuickPaymentDialog";
import { EditStudentDialog } from "./EditStudentDialog";

interface StudentQuickActionsProps {
    studentDbId: number;
    studentName: string;
    studentClass: string;
    familyId: number;
    fatherName: string;
    familyPhone: string;
    balance: number;
}

export function StudentQuickActions({
    studentDbId,
    studentName,
    studentClass,
    familyId,
    fatherName,
    familyPhone,
    balance,
}: StudentQuickActionsProps) {
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [identityOpen, setIdentityOpen] = useState(false);

    const currentDue = balance < 0 ? Math.abs(balance) : 0;

    return (
        <>
            <div className="flex flex-wrap gap-4 mt-6">
                <Button
                    variant="glass"
                    onClick={() => setIdentityOpen(true)}
                    className="border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600"
                >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Manage Identity
                </Button>
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
                familyPhone={familyPhone}
                studentId={studentDbId}
                studentName={studentName}
                currentDue={currentDue}
                onSuccess={() => {
                    window.location.reload();
                }}
            />

            <EditStudentDialog
                open={identityOpen}
                onClose={() => setIdentityOpen(false)}
                studentDbId={studentDbId}
                studentName={studentName}
                studentClass={studentClass}
                onSuccess={() => {
                    window.location.reload();
                }}
            />
        </>
    );
}
