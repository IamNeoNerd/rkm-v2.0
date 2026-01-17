/**
 * Cleanup Simulation Data Script
 * Removes all placeholder/test data with Sim* prefixes
 * Preserves: academic sessions, fee structures, super-admin user
 */

import "dotenv/config";
import { db } from "../src/db";
import { families, students, staff, batches, enrollments, attendance, transactions } from "../src/db/schema";
import { like, inArray } from "drizzle-orm";

const log = (msg: string) => console.log(`[CLEANUP] ${msg}`);
const success = (msg: string) => console.log(`[✅] ${msg}`);

async function cleanupSimulationData() {
    log("Starting cleanup of simulation/placeholder data...\n");

    try {
        // Step 1: Get IDs for cleanup
        const simBatches = await db
            .select({ id: batches.id })
            .from(batches)
            .where(like(batches.name, "Sim%"));

        const simStudents = await db
            .select({ id: students.id })
            .from(students)
            .where(like(students.name, "Sim%"));

        const simFamilies = await db
            .select({ id: families.id })
            .from(families)
            .where(like(families.fatherName, "Sim%"));

        const batchIds = simBatches.map(b => b.id);
        const studentIds = simStudents.map(s => s.id);
        const familyIds = simFamilies.map(f => f.id);

        // Step 2: Delete attendance for sim batches
        if (batchIds.length > 0) {
            await db.delete(attendance).where(inArray(attendance.batchId, batchIds));
            log(`Cleared attendance for ${batchIds.length} simulation batches`);
        }

        // Step 3: Delete enrollments for sim students
        if (studentIds.length > 0) {
            await db.delete(enrollments).where(inArray(enrollments.studentId, studentIds));
            log(`Cleared enrollments for ${studentIds.length} simulation students`);
        }

        // Step 4: Delete transactions for sim families
        if (familyIds.length > 0) {
            await db.delete(transactions).where(inArray(transactions.familyId, familyIds));
            log(`Cleared transactions for ${familyIds.length} simulation families`);
        }

        // Step 4: Delete simulation students
        const deletedStudents = await db
            .delete(students)
            .where(like(students.name, "Sim%"))
            .returning({ name: students.name });

        if (deletedStudents.length > 0) {
            success(`Deleted ${deletedStudents.length} simulation students`);
        }

        // Step 5: Delete simulation families
        const deletedFamilies = await db
            .delete(families)
            .where(like(families.fatherName, "Sim%"))
            .returning({ name: families.fatherName });

        if (deletedFamilies.length > 0) {
            success(`Deleted ${deletedFamilies.length} simulation families`);
        }

        // Step 6: Delete simulation batches
        const deletedBatches = await db
            .delete(batches)
            .where(like(batches.name, "Sim%"))
            .returning({ name: batches.name });

        if (deletedBatches.length > 0) {
            success(`Deleted ${deletedBatches.length} simulation batches`);
        }

        // Step 7: Delete simulation staff
        const deletedStaff = await db
            .delete(staff)
            .where(like(staff.name, "Sim%"))
            .returning({ name: staff.name });

        if (deletedStaff.length > 0) {
            success(`Deleted ${deletedStaff.length} simulation staff`);
        }

        // Summary
        console.log("\n=== CLEANUP SUMMARY ===");
        console.log(`Families removed: ${deletedFamilies.length}`);
        console.log(`Students removed: ${deletedStudents.length}`);
        console.log(`Batches removed: ${deletedBatches.length}`);
        console.log(`Staff removed: ${deletedStaff.length}`);
        console.log("\n✅ Cleanup complete! Database is ready for realistic data seeding.");

    } catch (error) {
        console.error("❌ Cleanup failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

cleanupSimulationData();
