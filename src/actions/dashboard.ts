
"use server";

import { db } from "@/db";
import { families, students, transactions, staff, batches, enrollments, attendance } from "@/db/schema";
import { and, count, desc, eq, gte, sql, sum } from "drizzle-orm";
import { auth } from "@/auth";

export async function getDashboardData() {
    // 1. Fetch all families
    const allFamilies = await db.select().from(families).orderBy(desc(families.createdAt));

    // 2. Fetch all students in one query
    const allStudents = await db.select().from(students);

    // 3. Group students by familyId for efficient lookup
    const studentsByFamilyId = allStudents.reduce((acc: Record<string, any[]>, student: any) => {
        if (!student.familyId) return acc;
        const fid = student.familyId.toString();
        if (!acc[fid]) acc[fid] = [];
        acc[fid].push(student);
        return acc;
    }, {} as Record<string, any[]>);

    // 4. Map families to the required frontend format
    const familiesWithChildren = allFamilies.map((f: any) => {
        const children = studentsByFamilyId[f.id.toString()] || [];
        return {
            id: f.id.toString(),
            father_name: f.fatherName,
            phone: f.phone,
            total_due: f.balance,
            children: children.map((c: any) => ({
                id: c.id.toString(),
                name: c.name,
                class: c.class,
                status: c.isActive ? "ACTIVE" : "ARCHIVED" as "ACTIVE" | "ARCHIVED",
                balance_status: f.balance < 0 ? "DUE" : "CLEAR" as "CLEAR" | "DUE"
            }))
        };
    });

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
        name: families.fatherName,
        studentName: students.name,
        type: sql<string>`'PAYMENT'`,
        amount: transactions.amount,
        createdAt: transactions.createdAt
    })
        .from(transactions)
        .leftJoin(families, eq(transactions.familyId, families.id))
        .leftJoin(students, eq(transactions.studentId, students.id))
        .orderBy(desc(transactions.createdAt))
        .limit(5);

    // Combine and sort
    const combined = [
        ...recentStudents.map((s: any) => ({ ...s, studentName: null })),
        ...recentTransactions.map((t: any) => ({
            ...t,
            name: t.studentName ? `${t.studentName} (${t.name})` : t.name
        }))
    ]
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

    allStudents.forEach((s: any) => {
        if (!s.createdAt) return;
        const d = new Date(s.createdAt);
        const key = `${months[d.getMonth()]}`;
        if (monthCounts[key] !== undefined) {
            monthCounts[key]++;
        }
    });

    return Object.entries(monthCounts).map(([name, total]) => ({ name, total }));
}

export async function getRevenueChartData() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const allPayments = await db.select({
        amount: transactions.amount,
        createdAt: transactions.createdAt
    }).from(transactions)
        .where(
            and(
                eq(transactions.type, "CREDIT"),
                eq(transactions.category, "FEE"),
                sql`${transactions.createdAt} >= ${sixMonthsAgo}`
            )
        );

    const monthRevenue: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${months[d.getMonth()]}`;
        monthRevenue[key] = 0;
    }

    allPayments.forEach((p: any) => {
        if (!p.createdAt) return;
        const d = new Date(p.createdAt);
        const key = `${months[d.getMonth()]}`;
        if (monthRevenue[key] !== undefined) {
            monthRevenue[key] += p.amount;
        }
    });

    return Object.entries(monthRevenue).map(([name, total]) => ({ name, total }));
}

export async function getTeacherLoadData() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await db.select({
        name: staff.name,
        count: count(batches.id)
    })
        .from(staff)
        .innerJoin(batches, eq(staff.id, batches.teacherId))
        .where(eq(staff.role, 'TEACHER'))
        .groupBy(staff.name)
        .orderBy(desc(count(batches.id)));

    return result.map((r: any) => ({ name: r.name, total: Number(r.count) }));
}

export async function getBatchActivityData() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await db.select({
        name: batches.name,
        count: count(enrollments.studentId)
    })
        .from(batches)
        .leftJoin(enrollments, and(eq(batches.id, enrollments.batchId), eq(enrollments.isActive, true)))
        .groupBy(batches.id)
        .orderBy(desc(count(enrollments.studentId)));

    return result.map((r: any) => ({ name: r.name, total: Number(r.count) }));
}

export async function getSettlementModeData() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await db.select({
        name: transactions.paymentMode,
        total: sum(transactions.amount)
    })
        .from(transactions)
        .where(eq(transactions.type, 'CREDIT'))
        .groupBy(transactions.paymentMode);

    return result.map((r: any) => ({
        name: r.name || 'OTHER',
        value: Number(r.total || 0)
    }));
}

export async function getTeacherDashboardMetrics() {
    try {
        const session = await auth();
        if (!session?.user?.email) return { success: false, error: "Unauthorized" };

        const email = session.user.email;

        // 1. Get Staff Info
        const staffInfo = await db
            .select({ id: staff.id })
            .from(staff)
            .where(eq(staff.email, email))
            .limit(1);

        if (staffInfo.length === 0) return { success: false, error: "Staff record not found" };
        const staffId = staffInfo[0].id;

        // 2. Assigned Nodes (Students in their batches)
        const studentsCount = await db
            .select({ count: count() })
            .from(enrollments)
            .innerJoin(batches, eq(enrollments.batchId, batches.id))
            .where(and(
                eq(batches.teacherId, staffId),
                eq(enrollments.isActive, true),
                eq(batches.isActive, true)
            ));

        // 3. Active Sessions (Batches they teach)
        const batchesCount = await db
            .select({ count: count() })
            .from(batches)
            .where(and(
                eq(batches.teacherId, staffId),
                eq(batches.isActive, true)
            ));

        // 4. Performance (Attendance Efficiency - Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendanceData = await db
            .select({
                status: attendance.status
            })
            .from(attendance)
            .innerJoin(batches, eq(attendance.batchId, batches.id))
            .where(and(
                eq(batches.teacherId, staffId),
                gte(attendance.createdAt, thirtyDaysAgo)
            ));

        const totalAttendancePoints = attendanceData.length;
        const presentCount = attendanceData.filter((a: any) => a.status === 'Present').length;
        const performance = totalAttendancePoints > 0
            ? Math.round((presentCount / totalAttendancePoints) * 100)
            : 100; // Default to 100 if no sessions

        return {
            success: true,
            metrics: {
                assignedNodes: Number(studentsCount[0]?.count ?? 0),
                activeSessions: Number(batchesCount[0]?.count ?? 0),
                performance: `${performance}%`,
                role: session.user.role
            }
        };

    } catch (error) {
        return { success: false, error: "Failed to fetch teacher metrics" };
    }
}

export async function getAttendanceLeaderboard() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await db.select({
        name: students.name,
        attendanceRate: sql<number>`
            CASE 
                WHEN COUNT(${attendance.id}) = 0 THEN 0
                ELSE ROUND((COUNT(CASE WHEN ${attendance.status} = 'Present' THEN 1 END) * 100.0) / COUNT(${attendance.id})) 
            END
        `
    })
        .from(students)
        .innerJoin(attendance, eq(students.id, attendance.studentId))
        .groupBy(students.name)
        .orderBy(desc(sql`ROUND((COUNT(CASE WHEN ${attendance.status} = 'Present' THEN 1 END) * 100.0) / COUNT(${attendance.id}))`))
        .limit(10);

    return result.map((r: any) => ({ name: r.name, total: Number(r.attendanceRate) }));
}
