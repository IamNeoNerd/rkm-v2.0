"use server";

import { db } from "@/db";
import { families, transactions } from "@/db/schema";
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

    type FamilyRow = typeof allFamilies[number];
    const duesReport = allFamilies.map((f: FamilyRow) => ({
        ...f,
        outstanding: f.balance < 0 ? Math.abs(f.balance) : 0
    }));
    type DuesReportRow = typeof duesReport[number];
    const filteredReport = duesReport.filter((f: DuesReportRow) => f.outstanding > 0);

    const totalOutstanding = filteredReport.reduce((acc: number, curr: DuesReportRow) => acc + curr.outstanding, 0);

    return {
        duesReport: filteredReport,
        totalOutstanding,
        familyCount: filteredReport.length
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

    type LastPaymentRow = typeof lastPayments[number];
    const lastPaymentMap = new Map(
        lastPayments.map((p: LastPaymentRow) => [p.familyId, p.lastPayment])
    );

    const now = new Date();

    type FamilyWithDueRow = typeof familiesWithDue[number];
    const report = familiesWithDue.map((family: FamilyWithDueRow) => {
        const lastPaymentDate = lastPaymentMap.get(family.id);
        const lastPayment = lastPaymentDate ? new Date(lastPaymentDate as string) : null;

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
    const summary: Record<string, { count: number, total: number }> = {
        '0-30': { count: 0, total: 0 },
        '31-60': { count: 0, total: 0 },
        '61-90': { count: 0, total: 0 },
        '90+': { count: 0, total: 0 },
    };

    type ReportRow = typeof report[number];
    report.forEach((r: ReportRow) => {
        const bucket = r.agingBucket as string;
        if (summary[bucket]) {
            summary[bucket].count++;
            summary[bucket].total += r.dueAmount;
        }
    });

    type AgingSummary = Record<'0-30' | '31-60' | '61-90' | '90+', { count: number, total: number }>;
    return {
        success: true,
        report,
        summary: summary as AgingSummary,
        totalDue: report.reduce((sum: number, r: ReportRow) => sum + r.dueAmount, 0),
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

