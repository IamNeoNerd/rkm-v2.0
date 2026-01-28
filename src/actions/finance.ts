"use server";

import { db } from "@/db";
import { transactions, batches, enrollments, students, families, staff, feeStructures } from "@/db/schema";
import { eq, sql, sum, count, and, gte, lte } from "drizzle-orm";
import { requireAuth, requireRole, AuthorizationError } from "@/lib/auth-guard";
import { logger } from "@/lib/logger";

// ============================================
// Batch-wise Revenue Breakdown
// ============================================

export interface BatchRevenueData {
    batchId: number;
    batchName: string;
    teacherName: string | null;
    fee: number;
    activeEnrollments: number;
    projectedMonthlyRevenue: number;
    totalCollected: number;
}

export async function getBatchWiseRevenue() {
    try {
        await requireAuth();

        // 1. Get all active batches with instructor names
        const allBatches = await db
            .select({
                id: batches.id,
                name: batches.name,
                fee: batches.fee,
                teacherId: batches.teacherId,
                teacherName: staff.name,
            })
            .from(batches)
            .leftJoin(staff, eq(batches.teacherId, staff.id))
            .where(eq(batches.isActive, true));

        // 2. Get all active enrollments with student data
        const allEnrollments = await db
            .select({
                studentId: enrollments.studentId,
                batchId: enrollments.batchId,
                familyId: students.familyId,
                baseFeeOverride: students.baseFeeOverride,
                className: students.class,
            })
            .from(enrollments)
            .innerJoin(students, eq(enrollments.studentId, students.id))
            .where(and(eq(enrollments.isActive, true), eq(students.isActive, true)));

        // 3. Get all active fee structures (for base fee calculations)
        const feeStructuresData = await db
            .select({
                className: feeStructures.className,
                monthlyFee: feeStructures.monthlyFee,
            })
            .from(feeStructures)
            .where(eq(feeStructures.isActive, true));

        const baseFeeMap = new Map(feeStructuresData.map((f: { className: string; monthlyFee: number }) => [f.className, f.monthlyFee]));

        // 4. Get all active fee transactions
        const feeTransactions = await db
            .select({
                amount: transactions.amount,
                studentId: transactions.studentId,
                familyId: transactions.familyId,
            })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'CREDIT'),
                eq(transactions.category, 'FEE'),
                eq(transactions.isVoid, false)
            ));

        // 5. Pre-calculate mapping for distribution
        // studentId -> { totalFees: number, batchFees: Map<batchId, fee> }
        const studentFeeProfile = new Map<number, { total: number; class: number; batches: Map<number, number> }>();
        const familyStudents = new Map<number, number[]>();

        // Initialize profiles
        type EnrollmentRow = typeof allEnrollments[number];
        type BatchRow = typeof allBatches[number];
        allEnrollments.forEach((e: EnrollmentRow) => {
            if (!studentFeeProfile.has(e.studentId)) {
                const classFee = e.baseFeeOverride !== null ? e.baseFeeOverride : (baseFeeMap.get(e.className) || 0);
                studentFeeProfile.set(e.studentId, {
                    total: classFee,
                    class: classFee,
                    batches: new Map<number, number>()
                });
            }
            if (!familyStudents.has(e.familyId)) familyStudents.set(e.familyId, []);
            if (!familyStudents.get(e.familyId)!.includes(e.studentId)) {
                familyStudents.get(e.familyId)!.push(e.studentId);
            }

            const profile = studentFeeProfile.get(e.studentId)!;
            const batch = allBatches.find((b: BatchRow) => b.id === e.batchId);
            if (batch) {
                profile.batches.set(batch.id, batch.fee);
                profile.total += batch.fee;
            }
        });

        // 6. Distribute revenue
        const batchCollections = new Map<number, number>();
        allBatches.forEach((b: BatchRow) => batchCollections.set(b.id, 0));

        type TransactionRow = typeof feeTransactions[number];
        feeTransactions.forEach((txn: TransactionRow) => {
            const amount = Number(txn.amount);

            if (txn.studentId && studentFeeProfile.has(txn.studentId)) {
                // Single student payment
                const profile = studentFeeProfile.get(txn.studentId)!;
                if (profile.total > 0) {
                    profile.batches.forEach((fee: number, bid: number) => {
                        const share = (fee / profile.total) * amount;
                        batchCollections.set(bid, (batchCollections.get(bid) || 0) + share);
                    });
                }
            } else if (txn.familyId && familyStudents.has(txn.familyId)) {
                // Family level payment - distribute across all students in family
                const sIds = familyStudents.get(txn.familyId)!;
                let familyTotalWeight = 0;
                sIds.forEach((sid: number) => {
                    familyTotalWeight += studentFeeProfile.get(sid)?.total || 0;
                });

                if (familyTotalWeight > 0) {
                    sIds.forEach((sid: number) => {
                        const profile = studentFeeProfile.get(sid)!;
                        profile.batches.forEach((fee: number, bid: number) => {
                            const share = (fee / familyTotalWeight) * amount;
                            batchCollections.set(bid, (batchCollections.get(bid) || 0) + share);
                        });
                    });
                }
            }
        });

        // 7. Compile results
        const results: BatchRevenueData[] = allBatches.map((batch: BatchRow) => {
            const activeEnrollments = allEnrollments.filter((e: EnrollmentRow) => e.batchId === batch.id).length;
            const collected = Math.round(batchCollections.get(batch.id) || 0);
            return {
                batchId: batch.id,
                batchName: batch.name,
                teacherName: batch.teacherName,
                fee: batch.fee,
                activeEnrollments,
                projectedMonthlyRevenue: batch.fee * activeEnrollments,
                totalCollected: collected,
            };
        });

        const totalProjectedRevenue = results.reduce((sum: number, b: BatchRevenueData) => sum + b.projectedMonthlyRevenue, 0);
        const totalCollected = results.reduce((sum: number, b: BatchRevenueData) => sum + b.totalCollected, 0);
        const totalEnrollments = results.reduce((sum: number, b: BatchRevenueData) => sum + b.activeEnrollments, 0);

        return {
            success: true,
            batches: results.sort((a, b) => b.projectedMonthlyRevenue - a.projectedMonthlyRevenue),
            summary: {
                totalBatches: results.length,
                totalEnrollments,
                totalProjectedMonthlyRevenue: totalProjectedRevenue,
                totalActualCollected: totalCollected,
                efficiency: totalProjectedRevenue > 0 ? Math.round((totalCollected / totalProjectedRevenue) * 100) : 0
            },
        };

    } catch (error) {
        logger.error("Failed to fetch batch revenue", error);
        return { success: false, error: "Failed to fetch batch revenue data" };
    }
}

// ============================================
// Staff Salary Expense Report
// ============================================

export interface StaffSalaryData {
    staffId: number;
    name: string;
    role: string;
    baseSalary: number;
    totalPaid: number;
    lastPaymentDate: Date | null;
    paymentCount: number;
}

export async function getStaffSalaryReport(options?: {
    startDate?: string;
    endDate?: string;
}) {
    try {
        await requireRole(['super-admin', 'admin']);

        const { startDate, endDate } = options || {};

        // Get all active staff
        const staffList = await db
            .select({
                id: staff.id,
                name: staff.name,
                role: staff.role,
                baseSalary: staff.baseSalary,
            })
            .from(staff)
            .where(eq(staff.isActive, true));

        // Build conditions for salary payments
        const conditions = [
            eq(transactions.category, 'SALARY'),
            eq(transactions.type, 'DEBIT'),
            eq(transactions.isVoid, false),
        ];

        if (startDate) {
            conditions.push(gte(transactions.createdAt, new Date(startDate)));
        }
        if (endDate) {
            conditions.push(lte(transactions.createdAt, new Date(endDate)));
        }

        // Get salary payments per staff
        const salaryPayments = await db
            .select({
                staffId: transactions.staffId,
                totalPaid: sum(transactions.amount),
                paymentCount: count(),
                lastPayment: sql<string>`MAX(${transactions.createdAt})`.as('last_payment'),
            })
            .from(transactions)
            .where(and(...conditions))
            .groupBy(transactions.staffId);

        type SalaryPaymentRow = typeof salaryPayments[number];
        const paymentMap = new Map(
            salaryPayments.map((p: SalaryPaymentRow) => [p.staffId, {
                totalPaid: Number(p.totalPaid) || 0,
                paymentCount: p.paymentCount,
                lastPayment: p.lastPayment ? new Date(p.lastPayment) : null,
            }])
        );

        type StaffRow = typeof staffList[number];
        type PaymentInfo = { totalPaid: number; paymentCount: number; lastPayment: Date | null };
        const results: StaffSalaryData[] = staffList.map((s: StaffRow) => {
            const payments: PaymentInfo = paymentMap.get(s.id) || { totalPaid: 0, paymentCount: 0, lastPayment: null };
            return {
                staffId: s.id,
                name: s.name,
                role: s.role,
                baseSalary: s.baseSalary,
                totalPaid: payments.totalPaid,
                lastPaymentDate: payments.lastPayment,
                paymentCount: payments.paymentCount,
            };
        });

        // Calculate totals
        const totalBaseSalary = results.reduce((sum, s) => sum + s.baseSalary, 0);
        const totalPaid = results.reduce((sum, s) => sum + s.totalPaid, 0);

        return {
            success: true,
            staff: results.sort((a, b) => b.baseSalary - a.baseSalary),
            summary: {
                totalStaff: results.length,
                totalMonthlyPayroll: totalBaseSalary,
                totalPaidInPeriod: totalPaid,
            },
        };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        logger.error("Failed to fetch salary report", error);
        return { success: false, error: "Failed to fetch salary report" };
    }
}

// ============================================
// Expense Report by Category
// ============================================

export interface ExpenseCategory {
    category: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
}

export async function getExpenseReport(options?: {
    startDate?: string;
    endDate?: string;
}) {
    try {
        await requireRole(['super-admin', 'admin']);

        const { startDate, endDate } = options || {};

        // Build conditions
        const conditions = [
            eq(transactions.type, 'DEBIT'),
            eq(transactions.isVoid, false),
        ];

        if (startDate) {
            conditions.push(gte(transactions.createdAt, new Date(startDate)));
        }
        if (endDate) {
            conditions.push(lte(transactions.createdAt, new Date(endDate)));
        }

        // Get expenses by category
        const expenses = await db
            .select({
                category: transactions.category,
                totalAmount: sum(transactions.amount),
                transactionCount: count(),
            })
            .from(transactions)
            .where(and(...conditions))
            .groupBy(transactions.category);

        type ExpenseRow = typeof expenses[number];
        const totalExpenses = expenses.reduce((sum: number, e: ExpenseRow) => sum + (Number(e.totalAmount) || 0), 0);

        const results: ExpenseCategory[] = expenses.map((e: ExpenseRow) => ({
            category: e.category,
            totalAmount: Number(e.totalAmount) || 0,
            transactionCount: e.transactionCount,
            percentage: totalExpenses > 0
                ? Math.round((Number(e.totalAmount) / totalExpenses) * 100)
                : 0,
        }));

        // Get expense head breakdown for EXPENSE category
        const expenseHeads = await db
            .select({
                expenseHead: transactions.expenseHead,
                totalAmount: sum(transactions.amount),
                transactionCount: count(),
            })
            .from(transactions)
            .where(and(
                eq(transactions.category, 'EXPENSE'),
                eq(transactions.isVoid, false),
                ...(startDate ? [gte(transactions.createdAt, new Date(startDate))] : []),
                ...(endDate ? [lte(transactions.createdAt, new Date(endDate))] : [])
            ))
            .groupBy(transactions.expenseHead);

        type ExpenseHeadRow = typeof expenseHeads[number];

        return {
            success: true,
            categories: results.sort((a, b) => b.totalAmount - a.totalAmount),
            expenseHeads: expenseHeads.map((e: ExpenseHeadRow) => ({
                head: e.expenseHead || 'Uncategorized',
                amount: Number(e.totalAmount) || 0,
                count: e.transactionCount,
            })),
            summary: {
                totalExpenses,
                categoryCount: results.length,
            },
        };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        logger.error("Failed to fetch expense report", error);
        return { success: false, error: "Failed to fetch expense report" };
    }
}

// ============================================
// Profit & Loss Dashboard
// ============================================

export interface PLSummary {
    period: string;
    revenue: number;
    salaryExpense: number;
    otherExpenses: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
}

export async function getProfitLossSummary(options?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'month' | 'quarter' | 'year';
}) {
    try {
        await requireRole(['super-admin']);

        const { startDate, endDate } = options || {};

        // Build date conditions
        const dateConditions = [];
        if (startDate) {
            dateConditions.push(gte(transactions.createdAt, new Date(startDate)));
        }
        if (endDate) {
            dateConditions.push(lte(transactions.createdAt, new Date(endDate)));
        }

        // Get total revenue (fee collections)
        const [revenueResult] = await db
            .select({
                total: sum(transactions.amount),
            })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'CREDIT'),
                eq(transactions.category, 'FEE'),
                eq(transactions.isVoid, false),
                ...dateConditions
            ));

        const totalRevenue = Number(revenueResult?.total) || 0;

        // Get salary expenses
        const [salaryResult] = await db
            .select({
                total: sum(transactions.amount),
            })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'DEBIT'),
                eq(transactions.category, 'SALARY'),
                eq(transactions.isVoid, false),
                ...dateConditions
            ));

        const totalSalary = Number(salaryResult?.total) || 0;

        // Get other expenses
        const [otherExpResult] = await db
            .select({
                total: sum(transactions.amount),
            })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'DEBIT'),
                eq(transactions.category, 'EXPENSE'),
                eq(transactions.isVoid, false),
                ...dateConditions
            ));

        const totalOtherExpenses = Number(otherExpResult?.total) || 0;

        // Calculate P&L
        const totalExpenses = totalSalary + totalOtherExpenses;
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0
            ? Math.round((netProfit / totalRevenue) * 100)
            : 0;

        // Get monthly breakdown
        const monthlyData = await db
            .select({
                month: sql<string>`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`.as('month'),
                monthName: sql<string>`TO_CHAR(${transactions.createdAt}, 'Mon YYYY')`.as('month_name'),
                type: transactions.type,
                category: transactions.category,
                total: sum(transactions.amount),
            })
            .from(transactions)
            .where(and(
                eq(transactions.isVoid, false),
                ...dateConditions
            ))
            .groupBy(
                sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`,
                sql`TO_CHAR(${transactions.createdAt}, 'Mon YYYY')`,
                transactions.type,
                transactions.category
            )
            .orderBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`);

        // Process monthly data into P&L format
        const monthlyPL = new Map<string, { name: string; revenue: number; salary: number; expenses: number }>();

        for (const row of monthlyData) {
            if (!monthlyPL.has(row.month)) {
                monthlyPL.set(row.month, { name: row.monthName, revenue: 0, salary: 0, expenses: 0 });
            }
            const entry = monthlyPL.get(row.month)!;
            const amount = Number(row.total) || 0;

            if (row.type === 'CREDIT' && row.category === 'FEE') {
                entry.revenue += amount;
            } else if (row.type === 'DEBIT' && row.category === 'SALARY') {
                entry.salary += amount;
            } else if (row.type === 'DEBIT' && row.category === 'EXPENSE') {
                entry.expenses += amount;
            }
        }

        interface MonthlyPLData { name: string; revenue: number; salary: number; expenses: number }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const monthlyBreakdown = Array.from(monthlyPL.entries()).map(([_month, data]: [string, MonthlyPLData]) => ({
            period: data.name,
            revenue: data.revenue,
            salaryExpense: data.salary,
            otherExpenses: data.expenses,
            totalExpenses: data.salary + data.expenses,
            netProfit: data.revenue - data.salary - data.expenses,
            profitMargin: data.revenue > 0
                ? Math.round(((data.revenue - data.salary - data.expenses) / data.revenue) * 100)
                : 0,
        }));

        return {
            success: true,
            summary: {
                totalRevenue,
                totalSalary,
                totalOtherExpenses,
                totalExpenses,
                netProfit,
                profitMargin,
            },
            monthlyBreakdown,
        };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        logger.error("Failed to generate P&L report", error);
        return { success: false, error: "Failed to generate P&L report" };
    }
}

// ============================================
// Quick Financial Stats
// ============================================

export async function getFinancialDashboardStats() {
    try {
        await requireAuth();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // This month's collections
        const [monthlyCollections] = await db
            .select({ total: sum(transactions.amount), count: count() })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'CREDIT'),
                eq(transactions.category, 'FEE'),
                eq(transactions.isVoid, false),
                gte(transactions.createdAt, startOfMonth)
            ));

        // Year-to-date collections
        const [ytdCollections] = await db
            .select({ total: sum(transactions.amount) })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'CREDIT'),
                eq(transactions.category, 'FEE'),
                eq(transactions.isVoid, false),
                gte(transactions.createdAt, startOfYear)
            ));

        // Total outstanding dues
        const [duesResult] = await db
            .select({
                totalDue: sql<number>`SUM(CASE WHEN ${families.balance} < 0 THEN ABS(${families.balance}) ELSE 0 END)`.as('total_due'),
                familiesWithDue: sql<number>`COUNT(CASE WHEN ${families.balance} < 0 THEN 1 END)`.as('families_with_due'),
            })
            .from(families);

        // This month's expenses
        const [monthlyExpenses] = await db
            .select({ total: sum(transactions.amount) })
            .from(transactions)
            .where(and(
                eq(transactions.type, 'DEBIT'),
                eq(transactions.isVoid, false),
                gte(transactions.createdAt, startOfMonth)
            ));

        return {
            success: true,
            stats: {
                monthlyCollections: Number(monthlyCollections?.total) || 0,
                monthlyTransactionCount: monthlyCollections?.count || 0,
                ytdCollections: Number(ytdCollections?.total) || 0,
                totalOutstandingDues: Number(duesResult?.totalDue) || 0,
                familiesWithDue: Number(duesResult?.familiesWithDue) || 0,
                monthlyExpenses: Number(monthlyExpenses?.total) || 0,
            },
        };

    } catch (error) {
        logger.error("Failed to fetch financial stats", error);
        return { success: false, error: "Failed to fetch financial stats" };
    }
}
