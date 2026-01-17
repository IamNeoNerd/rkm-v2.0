
"use server";

import { db } from "@/db";
import { families, students, transactions } from "@/db/schema";
import { and, count, desc, eq, sql, sum } from "drizzle-orm";

export async function getDashboardData() {
    const allFamilies = await db.select().from(families).orderBy(desc(families.createdAt));

    // We need to attach children
    // This is N+1 but fine for now or use relational query
    // Let's use relational query if possible or just map

    const familiesWithChildren = await Promise.all(allFamilies.map(async (f) => {
        const children = await db.select().from(students).where(eq(students.familyId, f.id));
        return {
            id: f.id.toString(), // Convert number to string for frontend types if needed
            father_name: f.fatherName,
            phone: f.phone,
            total_due: f.balance, // Note: Schema convention needed. 
            // In schema: balance. If positive = credit? If negative = due? 
            // Previous mock data: total_due: -5000 means they OWE. 
            // Let's stick to Schema: balance. If balance is negative, it's a Due? 
            // Wait, standard accounting: Credit is usually positive liability for institute (advance). Debit is negative asset (due).
            // Let's assume Balance = what family owns. 
            // If Balance = -1000, they owe 1000.
            // If Balance = 500, they have 500 advance.

            children: children.map(c => ({
                id: c.id.toString(),
                name: c.name,
                class: c.class,
                status: c.isActive ? "ACTIVE" : "ARCHIVED" as "ACTIVE" | "ARCHIVED",
                balance_status: f.balance < 0 ? "DUE" : "CLEAR" as "CLEAR" | "DUE" // Simplified per family
            }))
        };
    }));

    return familiesWithChildren;
}

export async function getDashboardMetrics() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    // 1. Revenue
    const revenueResult = await db.select({
        total: sum(transactions.amount)
    })
        .from(transactions)
        .where(
            and(
                eq(transactions.type, "CREDIT"),
                sql`EXTRACT(MONTH FROM ${transactions.createdAt}) = ${currentMonth + 1} AND EXTRACT(YEAR FROM ${transactions.createdAt}) = ${currentYear}`
            )
        );

    const lastMonthRevenueResult = await db.select({
        total: sum(transactions.amount)
    })
        .from(transactions)
        .where(
            and(
                eq(transactions.type, "CREDIT"),
                sql`EXTRACT(MONTH FROM ${transactions.createdAt}) = ${lastMonth + 1} AND EXTRACT(YEAR FROM ${transactions.createdAt}) = ${lastMonthYear}`
            )
        );

    const currentRevenue = Number(revenueResult[0]?.total ?? 0);
    const lastMonthRevenue = Number(lastMonthRevenueResult[0]?.total ?? 0);

    const revenueTrendValue = lastMonthRevenue > 0
        ? (currentRevenue - lastMonthRevenue) / lastMonthRevenue * 100
        : null;

    const revenueTrendFormatted = revenueTrendValue !== null
        ? `${revenueTrendValue > 0 ? '+' : ''}${revenueTrendValue.toFixed(1)}%`
        : 'New this month';

    // 2. Active Students
    const activeStudentsResult = await db.select({
        count: count()
    })
        .from(students)
        .where(eq(students.isActive, true));

    const newStudentsThisMonth = await db.select({
        count: count()
    })
        .from(students)
        .where(
            and(
                eq(students.isActive, true),
                sql`EXTRACT(MONTH FROM ${students.createdAt}) = ${currentMonth + 1} AND EXTRACT(YEAR FROM ${students.createdAt}) = ${currentYear}`
            )
        );

    const activeCount = activeStudentsResult[0]?.count ?? 0;
    const newCount = newStudentsThisMonth[0]?.count ?? 0;

    // 3. Pending Fees
    const pendingFeesResult = await db.select({
        total: sum(families.balance)
    })
        .from(families)
        .where(sql`${families.balance} < 0`);

    return {
        revenue: currentRevenue,
        revenueTrend: revenueTrendFormatted,
        revenueTrendUp: revenueTrendValue !== null ? revenueTrendValue >= 0 : true,
        activeStudents: activeCount,
        studentsTrend: `+${newCount} new this month`,
        pendingFees: Math.abs(Number(pendingFeesResult[0]?.total ?? 0))
    };
}

export async function getRecentActivity() {
    // Combine recent students and transactions
    const recentStudents = await db.select({
        id: students.id,
        name: students.name,
        type: sql<string>`'ADMISSION'`,
        amount: sql<number>`0`,
        createdAt: students.createdAt
    }).from(students).orderBy(desc(students.createdAt)).limit(5);

    const recentTransactions = await db.select({
        id: transactions.id,
        name: sql<string>`'Payment'`, // Placeholder, ideally would join with family
        type: sql<string>`'PAYMENT'`,
        amount: transactions.amount,
        createdAt: transactions.createdAt
    }).from(transactions).orderBy(desc(transactions.createdAt)).limit(5);

    // Combine and sort
    const combined = [...recentStudents, ...recentTransactions]
        .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
            return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

    return combined;
}

export async function getAdmissionsChartData() {
    // Group by month for last 6 months
    // Use SQL detailed grouping if possible, otherwise fetch and process in JS (easier for MVP)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const allStudents = await db.select({
        createdAt: students.createdAt
    }).from(students)
        .where(sql`${students.createdAt} >= ${sixMonthsAgo}`);

    const monthCounts: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${months[d.getMonth()]}`;
        monthCounts[key] = 0;
    }

    allStudents.forEach(s => {
        if (!s.createdAt) return;
        const d = new Date(s.createdAt);
        const key = `${months[d.getMonth()]}`;
        if (monthCounts[key] !== undefined) {
            monthCounts[key]++;
        }
    });

    return Object.entries(monthCounts).map(([name, total]) => ({ name, total }));
}
