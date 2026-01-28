"use server";

import { db } from "@/db";
import { families, students, transactions } from "@/db/schema";
import { eq, sql, and, desc, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";

export async function getAllFamilies(options: {
    page?: number;
    limit?: number;
    search?: string;
} = {}) {
    try {
        await requireAuth();

        const { page = 1, limit = 20, search = "" } = options;
        const offset = (page - 1) * limit;

        let whereClause = and();

        if (search) {
            const searchTerm = `%${search.toLowerCase()}%`;
            // Search in father name, phone, OR student names
            const studentSearchSubquery = db
                .select({ familyId: students.familyId })
                .from(students)
                .where(sql`LOWER(${students.name}) LIKE ${searchTerm}`);

            whereClause = and(
                whereClause,
                sql`(LOWER(${families.fatherName}) LIKE ${searchTerm} OR ${families.phone} LIKE ${searchTerm} OR ${families.id} IN (${studentSearchSubquery}))`
            );
        }

        // Subquery for student count
        const studentCountSubquery = db
            .select({
                familyId: students.familyId,
                count: count().as("count"),
            })
            .from(students)
            .groupBy(students.familyId)
            .as("student_counts");

        const results = await db
            .select({
                id: families.id,
                fatherName: families.fatherName,
                phone: families.phone,
                balance: families.balance,
                createdAt: families.createdAt,
                studentCount: sql<number>`COALESCE(${studentCountSubquery.count}, 0)`,
            })
            .from(families)
            .leftJoin(studentCountSubquery, eq(families.id, studentCountSubquery.familyId))
            .where(whereClause)
            .orderBy(desc(families.createdAt))
            .limit(limit)
            .offset(offset);

        // Fetch students for these families to show in the table
        type ResultRow = typeof results[number];
        const familyIds = results.map((f: ResultRow) => f.id);
        const children = familyIds.length > 0
            ? await db.select({
                id: students.id,
                name: students.name,
                familyId: students.familyId,
                class: students.class
            })
                .from(students)
                .where(sql`${students.familyId} IN (${sql.join(familyIds, sql`, `)})`)
            : [];

        type ChildRow = typeof children[number];
        const familiesWithChildren = results.map((f: ResultRow) => ({
            ...f,
            children: children.filter((c: ChildRow) => c.familyId === f.id)
        }));

        // Get total count for pagination
        const [totalResult] = await db
            .select({ count: count() })
            .from(families)
            .where(whereClause);

        const total = Number(totalResult?.count || 0);

        return {
            families: familiesWithChildren,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error("Error fetching families:", error);
        return { families: [], error: "Failed to fetch families" };
    }
}

export async function getFamilyById(id: number) {
    try {
        await requireAuth();

        const [family] = await db
            .select()
            .from(families)
            .where(eq(families.id, id))
            .limit(1);

        if (!family) {
            return { error: "Family not found" };
        }

        const familyStudents = await db
            .select()
            .from(students)
            .where(eq(students.familyId, id));

        const familyTransactions = await db
            .select()
            .from(transactions)
            .where(eq(transactions.familyId, id))
            .orderBy(desc(transactions.createdAt))
            .limit(50); // Limit to recent transactions for performance

        return {
            success: true,
            family,
            students: familyStudents,
            transactions: familyTransactions,
        };
    } catch (error) {
        // Check if it's an authorization error
        if (error instanceof Error && error.name === 'AuthorizationError') {
            console.error("Authorization error in getFamilyById:", error.message);
            return { error: error.message }; // Return the actual auth error message
        }

        console.error("Error fetching family detail:", error);
        return { error: "Failed to fetch family details" };
    }
}
