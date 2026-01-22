"use client";

import { useState } from "react";
import { KeyRound, Receipt, MessageSquare } from "lucide-react";
import { Button } from "@/components/modern/Button";
import { toast } from "sonner";
import { EditFamilyDialog } from "./EditFamilyDialog";
import Link from "next/link";

interface FamilyQuickActionsProps {
    familyId: number;
    familyName: string;
    familyPhone: string;
    onSuccess?: () => void;
}

export function FamilyQuickActions({
    familyId,
    familyName,
    familyPhone,
    onSuccess,
}: FamilyQuickActionsProps) {
    const [identityOpen, setIdentityOpen] = useState(false);

    return (
        <>
            <div className="flex flex-wrap gap-4">
                <Button
                    variant="glass"
                    onClick={() => setIdentityOpen(true)}
                    className="border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600"
                >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Manage Identity
                </Button>
                <Button
                    variant="glass"
                    onClick={() => toast.info("Push Notification system coming in Phase 4")}
                    className="border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600"
                >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Reminder
                </Button>
                <Link href={`/fees?family=${familyId}`}>
                    <Button
                        variant="primary"
                        className="shadow-primary/20 shadow-lg"
                    >
                        <Receipt className="h-4 w-4 mr-2" />
                        Collect Payment
                    </Button>
                </Link>
            </div>

            <EditFamilyDialog
                open={identityOpen}
                onClose={() => setIdentityOpen(false)}
                familyId={familyId}
                familyName={familyName}
                familyPhone={familyPhone}
                onSuccess={() => {
                    onSuccess?.();
                    window.location.reload();
                }}
            />
        </>
    );
}
