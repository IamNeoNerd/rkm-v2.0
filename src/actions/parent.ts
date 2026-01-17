"use server";

import { db } from "@/db";
import { families, students, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Lookup family by phone number (parent portal)
export async function lookupFamilyByPhone(phone: string) {
    if (!phone || phone.length !== 10) {
        return { error: "Please enter a valid 10-digit phone number" };
    }

    try {
        const family = await db
            .select({
                id: families.id,
                fatherName: families.fatherName,
                phone: families.phone,
                balance: families.balance,
            })
            .from(families)
            .where(eq(families.phone, phone))
            .limit(1);

        if (family.length === 0) {
            return { error: "No family found with this phone number" };
        }

        return { family: family[0] };
    } catch (error) {
        console.error("Error looking up family:", error);
        return { error: "Failed to lookup family" };
    }
}

// Get children for a family
export async function getFamilyChildren(familyId: number) {
    try {
        const children = await db
            .select({
                id: students.id,
                name: students.name,
                class: students.class,
                isActive: students.isActive,
            })
            .from(students)
            .where(eq(students.familyId, familyId));

        return { children };
    } catch (error) {
        console.error("Error fetching children:", error);
        return { children: [], error: "Failed to fetch children" };
    }
}

// Get payment history for parent view
export async function getParentPaymentHistory(familyId: number, limit = 10) {
    try {
        const history = await db
            .select({
                id: transactions.id,
                type: transactions.type,
                amount: transactions.amount,
                description: transactions.description,
                createdAt: transactions.createdAt,
                receiptNumber: transactions.receiptNumber,
            })
            .from(transactions)
            .where(eq(transactions.familyId, familyId))
            .orderBy(desc(transactions.createdAt))
            .limit(limit);

        return { transactions: history };
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return { transactions: [], error: "Failed to fetch history" };
    }
}
