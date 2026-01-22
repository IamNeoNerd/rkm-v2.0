import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { families, students, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ParentDashboard } from "./ParentDashboard";

export default async function ParentPortal() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Only allow parent role
    if (session.user.role !== "parent") {
        redirect("/");
    }

    // Get family data linked to this user
    const family = await db.query.families.findFirst({
        where: eq(families.userId, session.user.id as string),
    });

    if (!family) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-8">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-20 h-20 rounded-[2rem] bg-red-50 flex items-center justify-center mx-auto">
                        <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                        IDENTITY_SYNC_ERROR
                    </h2>
                    <p className="text-sm text-slate-500">
                        Your account is not linked to a family record. Please contact the administration to resolve this.
                    </p>
                </div>
            </div>
        );
    }

    // Get children linked to this family
    const childrenData = await db
        .select({
            id: students.id,
            name: students.name,
            class: students.class,
            isActive: students.isActive,
        })
        .from(students)
        .where(eq(students.familyId, family.id));

    // Get payment history
    const transactionsData = await db
        .select({
            id: transactions.id,
            type: transactions.type,
            amount: transactions.amount,
            description: transactions.description,
            createdAt: transactions.createdAt,
            receiptNumber: transactions.receiptNumber,
            paymentMode: transactions.paymentMode,
        })
        .from(transactions)
        .where(eq(transactions.familyId, family.id))
        .orderBy(desc(transactions.createdAt))
        .limit(20);

    return (
        <ParentDashboard
            family={{
                id: family.id,
                fatherName: family.fatherName,
                phone: family.phone,
                balance: family.balance,
            }}
            students={childrenData}
            transactions={transactionsData.map(t => ({
                ...t,
                createdAt: t.createdAt!,
            }))}
        />
    );
}
