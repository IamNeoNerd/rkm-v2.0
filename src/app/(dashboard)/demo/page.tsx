"use client"

import { useState } from "react"
import { FamilyCard } from "@/components/dashboard/FamilyCard"
import { FeeCollectionModal } from "@/components/modals/FeeCollectionModal"
import { Button } from "@/components/ui/button"
import { Family } from "@/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const MOCK_FAMILY: Family = {
    id: "FAM001",
    father_name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    total_due: -5000,
    children: [
        {
            id: "ST001",
            name: "Rahul Kumar",
            class: "Class X-A",
            status: "ACTIVE",
            balance_status: "DUE"
        },
        {
            id: "ST002",
            name: "Priya Kumar",
            class: "Class VIII-B",
            status: "ACTIVE",
            balance_status: "DUE"
        }
    ]
}

const MOCK_FAMILY_ADVANCE: Family = {
    id: "FAM002",
    father_name: "Amit Singh",
    phone: "+91 99887 76655",
    total_due: 2000,
    children: [
        {
            id: "ST003",
            name: "Rohan Singh",
            class: "Class V-C",
            status: "ACTIVE",
            balance_status: "CLEAR"
        }
    ]
}

export default function DemoPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)

    const handleCollectFee = (family: Family) => {
        setSelectedFamily(family)
        setModalOpen(true)
    }

    const handlePaymentSubmit = (amount: number, mode: "CASH" | "UPI") => {
        alert(`Payment Successful!\nAmount: ₹${amount}\nMode: ${mode}\nFamily: ${selectedFamily?.father_name}`)
        // In a real app, this would trigger an API call
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 space-y-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/student/1">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go to Student Profile
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Component Verification Demo</h1>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-700">Case 1: Fee Due</h2>
                        <FamilyCard family={MOCK_FAMILY} onCollectFee={handleCollectFee} />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-700">Case 2: Advance Payment</h2>
                        <FamilyCard family={MOCK_FAMILY_ADVANCE} onCollectFee={handleCollectFee} />
                    </div>
                </div>

                {selectedFamily && (
                    <FeeCollectionModal
                        open={modalOpen}
                        onOpenChange={setModalOpen}
                        totalDue={selectedFamily.total_due}
                        studentName={selectedFamily.children.map(c => c.name).join(", ")}
                        onSubmit={handlePaymentSubmit}
                    />
                )}
            </div>
        </div>
    )
}
