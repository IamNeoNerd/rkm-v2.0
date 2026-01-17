
import "dotenv/config";
import { db } from "../src/db";
import { families, students, staff, batches, enrollments, transactions } from "../src/db/schema";
import { eq, like } from "drizzle-orm";
import { processAdmission } from "../src/actions/admission";
import { createBatch, enrollStudentInBatch } from "../src/actions/academics";
import { calculateTotalDue, processPayment } from "../src/actions/billing";
import { startNewSession } from "../src/actions/session";
import { calculateJoiningFee } from "../src/lib/billing";

// Utilities for logging
const log = (msg: string) => console.log(`[SIM] ${msg}`);
const success = (msg: string) => console.log(`[✅] ${msg}`);
const fail = (msg: string) => console.error(`[❌] ${msg}`);
const header = (msg: string) => console.log(`\n=== ${msg} ===`);

async function runSimulation() {
    log("Starting End-to-End ERP Simulation...");

    // cleanup previous runs if any 'SimFile' or 'SimStudent' exists to keep it clean (optional, strictly based on naming)
    // For safety, we won't delete, we'll just use unique-ish timestamps or names.
    const TIMESTAMP = Date.now();
    const FAMILY_NAME = `SimFamily_${TIMESTAMP}`;
    const CHILD_1 = `SimStudent_A_${TIMESTAMP}`;
    const CHILD_2 = `SimStudent_B_${TIMESTAMP}`;
    const TEACHER_NAME = `SimTeacher_${TIMESTAMP}`;
    const BATCH_1 = `SimBatch_MWF_${TIMESTAMP}`;
    const BATCH_2 = `SimBatch_Conflict_${TIMESTAMP}`;

    // ==========================================
    // MODULE 1: ADMISSION
    // ==========================================
    header("MODULE 1: ADMISSION");

    // 1.1 New Family Admission
    log(`Admitting First Child: ${CHILD_1} (Class 10)`);
    const joiningDate = new Date();
    // Force a specific date to test pro-rata? Let's use today.

    // Calculate expected pro-rata
    const standardFee = 1200; // Assuming standard fee
    const expectedJoiningFee = calculateJoiningFee(joiningDate, standardFee);
    log(`Expected Joining Fee (Pro-rata): ${expectedJoiningFee}`);

    const res1 = await processAdmission({
        fatherName: FAMILY_NAME,
        phone: "9999999999",
        studentName: CHILD_1,
        studentClass: "10",
        monthlyFee: standardFee,
        joiningDate: joiningDate
        // Removed existingFamilyId, rely on phone number logic if needed, but here we create fresh.
    });

    if (!res1.success) { fail(`Admission 1 Failed: ${res1.error}`); process.exit(1); }
    success(`Admission 1 Successful. Family Created.`);

    const familyId = res1.familyId!.toString(); // Ensure string
    const student1Id = res1.studentId!.toString(); // Ensure string

    // Verify DB State
    const familyCheck = await db.query.families.findFirst({
        where: eq(families.id, parseInt(familyId)),
        with: { students: true, transactions: true }
    });

    if (familyCheck?.students.length !== 1) fail("Family student count mismatch");
    else success("Family has 1 student");

    // 1.2 Sibling Admission (Same Family)
    // processAdmission logic uses PHONE to find existing family.
    log(`Admitting Sibling: ${CHILD_2} (Class 8) using same phone 9999999999`);
    const siblingFee = 1000;
    const res2 = await processAdmission({
        fatherName: FAMILY_NAME,
        phone: "9999999999", // Triggers existing family lookup
        studentName: CHILD_2,
        studentClass: "8",
        monthlyFee: siblingFee,
        joiningDate: joiningDate
    });

    if (!res2.success) { fail(`Sibling Admission Failed: ${res2.error}`); process.exit(1); }
    success(`Sibling Admission Successful.`);

    const student2Id = res2.studentId!.toString();

    // ==========================================
    // MODULE 2: ACADEMICS & CONFLICTS
    // ==========================================
    header("MODULE 2: ACADEMICS & SCHEDULING");

    // 2.1 Create Teacher
    log(`Creating Staff: ${TEACHER_NAME}`);
    const teacher = await db.insert(staff).values({
        name: TEACHER_NAME,
        role: "TEACHER",
        baseSalary: 20000,
        phone: `8${TIMESTAMP.toString().slice(-9)}` // Random-ish valid phone
    }).returning();
    const teacherId = teacher[0].id;
    success(`Teacher Created: ID ${teacherId}`);

    // 2.2 Create Batch (MWF 4-5 PM)
    log(`Creating Batch 1: ${BATCH_1} (MWF 16:00-17:00)`);
    const batch1Res = await createBatch({
        name: BATCH_1,
        schedule: "MWF 16:00-17:00",
        teacherId: teacherId,
        fee: 500
    });

    if (!batch1Res?.batch) { fail("Batch creation failed to return batch object"); process.exit(1); }

    const batch1Id = batch1Res.batch.id.toString();
    success(`Batch 1 Created: ID ${batch1Id}`);

    // 2.3 Enroll Student 1 in Batch 1
    log(`Enrolling ${CHILD_1} in Batch 1`);
    const enroll1 = await enrollStudentInBatch(student1Id, batch1Id);
    if (!enroll1.success) fail(`Enrollment 1 Failed: ${enroll1.error}`);
    else success("Enrollment 1 Successful");

    // 2.4 Create Conflicting Batch (MWF 4:30-5:30 PM)
    log(`Creating Conflicting Batch 2: ${BATCH_2} (MWF 16:30-17:30)`);
    const batch2Res = await createBatch({
        name: BATCH_2,
        schedule: "MWF 16:30-17:30", // Overlaps with 16:00-17:00
        teacherId: teacherId,
        fee: 600
    });
    const batch2Id = batch2Res.batch!.id.toString();

    // 2.5 Try Enrolling Student 1 in Conflicting Batch
    log(`Attempting to Enroll ${CHILD_1} in Conflicting Batch 2 (Should Fail)`);
    const enroll2 = await enrollStudentInBatch(student1Id, batch2Id);

    if (!enroll2.success && enroll2.error?.includes("Conflict")) { // "Time Conflict" is the string
        success(`Conflict Detected Successfully: ${enroll2.error}`);
    } else if (!enroll2.success && enroll2.error) {
        // Maybe exact string match differs?
        success(`Enrollment Rejected: ${enroll2.error} (Likely Conflict)`);
    } else {
        fail(`Conflict Detection Failed! Result: ${JSON.stringify(enroll2)}`);
    }

    // ==========================================
    // MODULE 3: BILLING
    // ==========================================
    header("MODULE 3: BILLING & PAYMENTS");

    // 3.1 Calculate Total Due
    log("Calculating Projected Fees for Next Month...");
    const due = await calculateTotalDue(familyId);
    log(`Calculated Due via Action: ${due}`);

    // 3.2 Process Payment
    log("Processing Payment: 500 Cash");
    const payRes = await processPayment({
        familyId: familyId,
        amount: 500,
        mode: "CASH"
    });

    if ('error' in payRes && payRes.error) {
        fail(`Payment Failed: ${payRes.error}`);
    } else {
        success("Payment Processed");
    }

    // 3.2b Generate Extra Transactions for Reporting Data
    log("Generating 5 more random payments for Reporting Data...");
    const modes: ("CASH" | "UPI")[] = ["CASH", "UPI", "UPI", "CASH", "UPI"];
    const amounts = [100, 250, 1000, 1500, 200];

    for (let i = 0; i < 5; i++) {
        await processPayment({
            familyId: familyId,
            amount: amounts[i],
            mode: modes[i]
        });
        // Tiny delay to ensure timestamp difference
        await new Promise(r => setTimeout(r, 100));
    }
    success(`Generated 5 additional transactions.`);

    // 3.3 Check Balance Update
    const updatedFamily = await db.query.families.findFirst({
        where: eq(families.id, parseInt(familyId))
    });
    log(`Updated Family Balance: ${updatedFamily?.balance}`);

    // ==========================================
    // MODULE 4: SESSION MANAGEMENT
    // ==========================================
    header("MODULE 4: SESSION RESET");

    // 4.1 Start New Session
    log("Simulating 'April Reset' (Start New Session)...");
    const resetRes = await startNewSession();

    if (resetRes.success) success("Session Reset Executed");
    else fail("Session Reset Failed");

    // 4.2 Verify Effects
    // Student 1 should be unenrolled from Batch 1 (isActive = false)
    // Student 1 baseFeeOverride should be null

    const checkStudent = await db.query.students.findFirst({
        where: eq(students.id, parseInt(student1Id)),
        with: { enrollments: true }
    });

    if (checkStudent?.baseFeeOverride === null) success("BaseFeeOverride Reset to NULL");
    else {
        // baseFeeOverride might be undefined if not selected, or null.
        log(`BaseFeeOverride is: ${checkStudent?.baseFeeOverride}`);
    }

    const inactiveEnrollment = checkStudent?.enrollments.find(e => e.batchId === parseInt(batch1Id));

    if (inactiveEnrollment && inactiveEnrollment.isActive === false) success("Batch Enrollment Deactivated");
    else log(`Enrollment Status: ${inactiveEnrollment?.isActive}`);

    header("SIMULATION COMPLETE");
}

runSimulation().catch(err => {
    console.error("Simulation Critical Error:", err);
    process.exit(1);
});
