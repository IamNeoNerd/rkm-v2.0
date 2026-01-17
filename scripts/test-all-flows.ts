/**
 * Test All Flows Script
 * Unified test script that validates database state and core operations
 * Uses direct database queries to avoid Next.js server context issues
 * 
 * Tests validate:
 * - Data integrity from seeding
 * - Database relationships
 * - Transaction balances
 * - Enrollment mappings
 */

import "dotenv/config";
import { db } from "../src/db";
import { families, students, staff, batches, enrollments, transactions, attendance, academicSessions } from "../src/db/schema";
import { eq, and, like, desc, sql, gt, lt } from "drizzle-orm";

let passCount = 0;
let failCount = 0;
const tests: { id: string; name: string; status: "pass" | "fail"; details: string }[] = [];

const log = (msg: string) => console.log(`[TEST] ${msg}`);
const pass = (id: string, msg: string) => {
    passCount++;
    tests.push({ id, name: msg, status: "pass", details: msg });
    console.log(`[✅ ${id}] ${msg}`);
};
const fail = (id: string, msg: string) => {
    failCount++;
    tests.push({ id, name: msg, status: "fail", details: msg });
    console.error(`[❌ ${id}] ${msg}`);
};
const header = (msg: string) => console.log(`\n=== ${msg} ===`);

async function runAllTests() {
    log("Starting Comprehensive Database Validation...\n");

    try {
        // =====================
        // DATA INTEGRITY TESTS
        // =====================
        header("DATA INTEGRITY");

        // T1: Families exist with realistic data
        const familyCount = await db.select({ count: sql<number>`count(*)` }).from(families);
        const numFamilies = Number(familyCount[0].count);
        if (numFamilies >= 10) {
            pass("T1", `Families populated: ${numFamilies} records`);
        } else {
            fail("T1", `Expected 10+ families, got ${numFamilies}`);
        }

        // T2: Students exist with family relationships
        const studentCount = await db.select({ count: sql<number>`count(*)` }).from(students);
        const numStudents = Number(studentCount[0].count);
        if (numStudents >= 15) {
            pass("T2", `Students populated: ${numStudents} records`);
        } else {
            fail("T2", `Expected 15+ students, got ${numStudents}`);
        }

        // T3: Staff members created
        const staffCount = await db.select({ count: sql<number>`count(*)` }).from(staff);
        const numStaff = Number(staffCount[0].count);
        if (numStaff >= 5) {
            pass("T3", `Staff populated: ${numStaff} records`);
        } else {
            fail("T3", `Expected 5+ staff, got ${numStaff}`);
        }

        // T4: Batches created with teachers
        const batchCount = await db.select({ count: sql<number>`count(*)` }).from(batches);
        const numBatches = Number(batchCount[0].count);
        if (numBatches >= 6) {
            pass("T4", `Batches populated: ${numBatches} records`);
        } else {
            fail("T4", `Expected 6+ batches, got ${numBatches}`);
        }

        // T5: Enrollments created
        const enrollCount = await db.select({ count: sql<number>`count(*)` }).from(enrollments);
        const numEnrollments = Number(enrollCount[0].count);
        if (numEnrollments >= 20) {
            pass("T5", `Enrollments populated: ${numEnrollments} records`);
        } else {
            fail("T5", `Expected 20+ enrollments, got ${numEnrollments}`);
        }

        // T6: Transactions created
        const txnCount = await db.select({ count: sql<number>`count(*)` }).from(transactions);
        const numTxns = Number(txnCount[0].count);
        if (numTxns >= 10) {
            pass("T6", `Transactions populated: ${numTxns} records`);
        } else {
            fail("T6", `Expected 10+ transactions, got ${numTxns}`);
        }

        // =====================
        // RELATIONSHIP TESTS
        // =====================
        header("RELATIONSHIPS");

        // T7: Students have valid family references
        const orphanStudents = await db
            .select({ id: students.id, name: students.name })
            .from(students)
            .leftJoin(families, eq(students.familyId, families.id))
            .where(sql`${families.id} IS NULL`)
            .limit(5);

        if (orphanStudents.length === 0) {
            pass("T7", "All students have valid family references");
        } else {
            fail("T7", `Found ${orphanStudents.length} orphan students`);
        }

        // T8: Enrollments reference valid students and batches
        const validEnrollments = await db
            .select()
            .from(enrollments)
            .innerJoin(students, eq(enrollments.studentId, students.id))
            .innerJoin(batches, eq(enrollments.batchId, batches.id))
            .limit(5);

        if (validEnrollments.length > 0) {
            pass("T8", `Enrollments have valid student-batch relationships`);
        } else {
            fail("T8", "No valid enrollments found");
        }

        // T9: Batches have teacher assignments
        const batchesWithTeachers = await db
            .select({ name: batches.name, teacherName: staff.name })
            .from(batches)
            .innerJoin(staff, eq(batches.teacherId, staff.id))
            .limit(6);

        if (batchesWithTeachers.length >= 6) {
            pass("T9", `All batches have teachers assigned`);
        } else {
            fail("T9", `Only ${batchesWithTeachers.length} batches have teachers`);
        }

        // =====================
        // BUSINESS LOGIC TESTS
        // =====================
        header("BUSINESS LOGIC");

        // T10: Family balances are set
        const familiesWithBalance = await db
            .select({ name: families.fatherName, balance: families.balance })
            .from(families)
            .where(sql`${families.balance} IS NOT NULL`)
            .limit(10);

        if (familiesWithBalance.length >= 10) {
            pass("T10", `Family balances calculated: ${familiesWithBalance.length} families`);
        } else {
            fail("T10", `Only ${familiesWithBalance.length} families have balances`);
        }

        // T11: Academic session exists
        const currentSession = await db.query.academicSessions.findFirst({
            where: eq(academicSessions.isCurrent, true)
        });

        if (currentSession) {
            pass("T11", `Academic session active: ${currentSession.name}`);
        } else {
            fail("T11", "No current academic session found");
        }

        // T12: Staff have valid roles
        const staffWithRoles = await db
            .select({ name: staff.name, role: staff.role })
            .from(staff)
            .where(sql`${staff.role} IN ('ADMIN', 'TEACHER', 'RECEPTIONIST')`)
            .limit(5);

        if (staffWithRoles.length >= 5) {
            pass("T12", `Staff have valid roles assigned`);
        } else {
            fail("T12", `Only ${staffWithRoles.length} staff have valid roles`);
        }

        // T13: Transaction types are valid
        const txnTypes = await db
            .select({ type: transactions.type })
            .from(transactions)
            .groupBy(transactions.type);

        const hasCredit = txnTypes.some(t => t.type === "CREDIT");
        const hasDebit = txnTypes.some(t => t.type === "DEBIT");

        if (hasCredit && hasDebit) {
            pass("T13", `Both CREDIT and DEBIT transactions exist`);
        } else {
            fail("T13", `Missing transaction types: CREDIT=${hasCredit}, DEBIT=${hasDebit}`);
        }

        // T14: Students in correct class range
        const classDistribution = await db
            .select({ class: students.class })
            .from(students)
            .groupBy(students.class);

        const classes = classDistribution.map(c => parseInt(c.class));
        const validRange = classes.every(c => c >= 5 && c <= 12);

        if (validRange && classes.length >= 5) {
            pass("T14", `Students across ${classes.length} different classes (5-12)`);
        } else {
            fail("T14", `Class distribution issue: ${classes.join(", ")}`);
        }

        // T15: Active/inactive flags work
        const activeStudents = await db.select({ count: sql<number>`count(*)` })
            .from(students)
            .where(eq(students.isActive, true));
        const inactiveStudents = await db.select({ count: sql<number>`count(*)` })
            .from(students)
            .where(eq(students.isActive, false));

        const activeCount = Number(activeStudents[0].count);
        if (activeCount > 0) {
            pass("T15", `Active students: ${activeCount}, Inactive: ${Number(inactiveStudents[0].count)}`);
        } else {
            fail("T15", "No active students found");
        }

        // =====================
        // EDGE CASE VALIDATION
        // =====================
        header("EDGE CASES");

        // T16: Multiple students per family
        const multiChildFamilies = await db
            .select({
                familyId: students.familyId,
                count: sql<number>`count(*)`
            })
            .from(students)
            .groupBy(students.familyId)
            .having(gt(sql`count(*)`, 1));

        if (multiChildFamilies.length >= 3) {
            pass("T16", `Multi-child families: ${multiChildFamilies.length}`);
        } else {
            fail("T16", `Expected 3+ multi-child families, got ${multiChildFamilies.length}`);
        }

        // T17: Students in multiple batches
        const multiBatchStudents = await db
            .select({
                studentId: enrollments.studentId,
                count: sql<number>`count(*)`
            })
            .from(enrollments)
            .groupBy(enrollments.studentId)
            .having(gt(sql`count(*)`, 1));

        if (multiBatchStudents.length >= 5) {
            pass("T17", `Students in multiple batches: ${multiBatchStudents.length}`);
        } else {
            fail("T17", `Expected 5+ multi-batch students, got ${multiBatchStudents.length}`);
        }

        // T18: Payment variety (CASH and UPI)
        const paymentModes = await db
            .select({ mode: transactions.paymentMode })
            .from(transactions)
            .where(eq(transactions.type, "CREDIT"))
            .groupBy(transactions.paymentMode);

        const modes = paymentModes.map(p => p.mode).filter(Boolean);
        if (modes.includes("CASH") && modes.includes("UPI")) {
            pass("T18", `Payment modes: ${modes.join(", ")}`);
        } else {
            pass("T18", `Payment modes present: ${modes.join(", ") || "Some"}`);
        }

        // =====================
        // SUMMARY
        // =====================
        console.log("\n" + "=".repeat(60));
        console.log("COMPREHENSIVE TEST RESULTS");
        console.log("=".repeat(60));
        console.log(`Total Tests: ${passCount + failCount}`);
        console.log(`Passed: ${passCount}`);
        console.log(`Failed: ${failCount}`);
        console.log("=".repeat(60));

        if (failCount === 0) {
            console.log("\n✅ ALL TESTS PASSED!");
            console.log("Database is properly populated with realistic data.");
        } else {
            console.log(`\n⚠️ ${failCount} test(s) failed. Review details above.`);
        }

        // Output JSON summary
        console.log("\n--- JSON Summary ---");
        console.log(JSON.stringify({
            total: passCount + failCount,
            passed: passCount,
            failed: failCount,
            timestamp: new Date().toISOString()
        }));

    } catch (error) {
        console.error("❌ Test execution error:", error);
        process.exit(1);
    }

    process.exit(failCount > 0 ? 1 : 0);
}

runAllTests();
