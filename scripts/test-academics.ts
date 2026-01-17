
import 'dotenv/config';
import { enrollStudentInBatch, createBatch } from "../src/actions/academics";
import { db } from "../src/db";
import { batches, students, families, enrollments } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function setupTestData() {
    console.log("Setting up test data...");

    // Create family and student
    const [family] = await db.insert(families).values({
        fatherName: "Test Father",
        phone: `999${Date.now()}`, // Unique phone
    }).returning();

    const [student] = await db.insert(students).values({
        familyId: family.id,
        name: "Test Student",
        class: "10"
    }).returning();

    // Create Batches
    // Batch A: Mon 4-5
    const [batchA] = await db.insert(batches).values({
        name: "Math Batch A",
        fee: 500,
        schedule: "Mon 4-5 PM"
    }).returning();

    // Batch B: Mon 4-5 (Conflict with A)
    const [batchB] = await db.insert(batches).values({
        name: "Physics Batch B",
        fee: 600,
        schedule: "Mon 4-5 PM"
    }).returning();

    // Batch C: Tue 4-5 (No Conflict)
    const [batchC] = await db.insert(batches).values({
        name: "Chemistry Batch C",
        fee: 500,
        schedule: "Tue 4-5 PM"
    }).returning();

    return { studentId: student.id, batchA: batchA.id, batchB: batchB.id, batchC: batchC.id };
}

async function runTests() {
    const ids = await setupTestData();
    console.log("Test Data IDs:", ids);

    // Test 1: Enroll in Batch A (Should Success)
    console.log("\n--- Test 1: Enroll Batch A ---");
    const res1 = await enrollStudentInBatch(ids.studentId.toString(), ids.batchA.toString());
    console.log("Result:", res1);
    if (res1.success) console.log("✅ Passed"); else console.error("❌ Failed");

    // Test 2: Enroll in Batch B (Should Fail - Time Conflict)
    console.log("\n--- Test 2: Enroll Batch B (Conflict) ---");
    const res2 = await enrollStudentInBatch(ids.studentId.toString(), ids.batchB.toString());
    console.log("Result:", res2);
    if (res2.error === "Time Conflict") console.log("✅ Passed"); else console.error("❌ Failed", res2);

    // Test 3: Enroll in Batch C (Should Success - Different Time)
    console.log("\n--- Test 3: Enroll Batch C (No Conflict) ---");
    const res3 = await enrollStudentInBatch(ids.studentId.toString(), ids.batchC.toString());
    console.log("Result:", res3);
    if (res3.success) console.log("✅ Passed"); else console.error("❌ Failed");

    // Cleanup
    /*
    await db.delete(enrollments).where(eq(enrollments.studentId, ids.studentId));
    await db.delete(students).where(eq(students.id, ids.studentId));
    await db.delete(families).where(eq(families.id, ids.family.id)); // Need existingFamily logic
    */
    console.log("\nTests Completed.");
}

runTests().catch(console.error);
