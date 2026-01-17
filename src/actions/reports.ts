"use server";

import { db } from "@/db";
import { families, students, transactions } from "@/db/schema";
import { eq, sum, and, sql, desc, count } from "drizzle-orm";
import { auth } from "@/auth";

export async function getPendingDues() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    // Fetch all families with their current balance
    const allFamilies = await db.select({
        id: families.id,
        fatherName: families.fatherName,
        phone: families.phone,
        balance: families.balance,
        status: families.status,
    }).from(families);

    const duesReport = allFamilies.map(f => ({
        ...f,
        outstanding: f.balance < 0 ? Math.abs(f.balance) : 0
    })).filter(f => f.outstanding > 0);

    const totalOutstanding = duesReport.reduce((acc, curr) => acc + curr.outstanding, 0);

    return {
        duesReport,
        totalOutstanding,
        familyCount: duesReport.length
    };
}

export async function getMonthlyCollectionSummary() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await db.select({
        total: sum(transactions.amount),
        count: sql<number>`count(*)`
    })
        .from(transactions)
        .where(
            and(
                eq(transactions.type, "CREDIT"),
                sql`${transactions.createdAt} >= ${startOfMonth}`
            )
        );

    return {
        total: Number(result[0]?.total || 0),
        count: Number(result[0]?.count || 0)
    };
}

export async function getDuesAgingReport() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    // Get all families with negative balance (due)
    const familiesWithDue = await db
        .select({
            id: families.id,
            fatherName: families.fatherName,
            phone: families.phone,
            balance: families.balance,
            createdAt: families.createdAt,
        })
        .from(families)
        .where(sql`${families.balance} < 0`)
        .orderBy(families.balance);

    // Get last payment date for each family
    const lastPayments = await db
        .select({
            familyId: transactions.familyId,
            lastPayment: sql<string>`MAX(${transactions.createdAt})`.as('last_payment'),
        })
        .from(transactions)
        .where(eq(transactions.type, 'CREDIT'))
        .groupBy(transactions.familyId);

    const lastPaymentMap = new Map(
        lastPayments.map(p => [p.familyId, p.lastPayment])
    );

    const now = new Date();

    const report = familiesWithDue.map(family => {
        const lastPaymentDate = lastPaymentMap.get(family.id);
        const lastPayment = lastPaymentDate ? new Date(lastPaymentDate) : null;

        let agingBucket: '0-30' | '31-60' | '61-90' | '90+' = '0-30';
        let daysSincePayment = 0;

        if (lastPayment) {
            daysSincePayment = Math.floor((now.getTime() - lastPayment.getTime()) / (24 * 60 * 60 * 1000));
        } else {
            const familyCreated = family.createdAt ? new Date(family.createdAt) : now;
            daysSincePayment = Math.floor((now.getTime() - familyCreated.getTime()) / (24 * 60 * 60 * 1000));
        }

        if (daysSincePayment > 90) agingBucket = '90+';
        else if (daysSincePayment > 60) agingBucket = '61-90';
        else if (daysSincePayment > 30) agingBucket = '31-60';
        else agingBucket = '0-30';

        return {
            ...family,
            dueAmount: Math.abs(family.balance),
            lastPaymentDate: lastPayment,
            daysSincePayment,
            agingBucket,
        };
    });

    // Calculate summary
    const summary = {
        '0-30': { count: 0, total: 0 },
        '31-60': { count: 0, total: 0 },
        '61-90': { count: 0, total: 0 },
        '90+': { count: 0, total: 0 },
    };

    report.forEach(r => {
        summary[r.agingBucket].count++;
        summary[r.agingBucket].total += r.dueAmount;
    });

    return {
        success: true,
        report,
        summary,
        totalDue: report.reduce((sum, r) => sum + r.dueAmount, 0),
        totalFamilies: report.length,
    };
}

export async function getMonthlyRevenueSummary(months = 6) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await db
        .select({
            month: sql<string>`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`.as('month'),
            monthName: sql<string>`TO_CHAR(${transactions.createdAt}, 'Mon YYYY')`.as('month_name'),
            totalRevenue: sum(transactions.amount),
            transactionCount: count(),
        })
        .from(transactions)
        .where(eq(transactions.type, 'CREDIT'))
        .groupBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM'), TO_CHAR(${transactions.createdAt}, 'Mon YYYY')`)
        .orderBy(desc(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`))
        .limit(months);

    const modeBreakdown = await db
        .select({
            mode: transactions.paymentMode,
            total: sum(transactions.amount),
            count: count(),
        })
        .from(transactions)
        .where(eq(transactions.type, 'CREDIT'))
        .groupBy(transactions.paymentMode);

    return {
        success: true,
        monthlyData: result.reverse(),
        modeBreakdown,
    };
}

