"use client";

import { useState } from "react";
import { FamilyCard } from "@/components/dashboard/FamilyCard";
import { FeeCollectionModal } from "@/components/modals/FeeCollectionModal";
import { Family } from "@/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { processPayment } from "@/actions/billing";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

interface DashboardClientProps {
    initialFamilies: Family[];
}

export function DashboardClient({ initialFamilies }: DashboardClientProps) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleCollectFee = (family: Family) => {
        setSelectedFamily(family);
        setModalOpen(true);
    };

    const handlePaymentSubmit = async (amount: number, mode: "CASH" | "UPI") => {
        if (!selectedFamily) return;

        try {
            const result = await processPayment({
                familyId: selectedFamily.id,
                amount: amount,
                mode: mode,
            });

            if (result && "error" in result) {
                toast.error(`Error: ${result.error}`);
            } else {
                toast.success("Payment Successful!");
                setModalOpen(false);
                router.refresh(); // Refresh server component data
            }
        } catch {
            toast.error("System error during payment.");
        }
    };

    const filteredFamilies = initialFamilies.filter(family =>
        family.father_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.children.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            <Tabs defaultValue="families" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="families">All Families</TabsTrigger>
                    </TabsList>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by father or child..."
                            className="pl-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="families" className="space-y-4">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredFamilies.map((family) => (
                            <FamilyCard
                                key={family.id}
                                family={family}
                                onCollectFee={handleCollectFee}
                            />
                        ))}
                        {filteredFamilies.length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-500">
                                No families found matching your search.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {selectedFamily && (
                <FeeCollectionModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    totalDue={selectedFamily.total_due}
                    studentName={selectedFamily.children.map(c => c.name).join(", ")}
                    onSubmit={handlePaymentSubmit}
                />
            )}
        </>
    );
}
