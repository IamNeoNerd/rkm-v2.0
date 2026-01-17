
import "dotenv/config";
import { createStaff, getAllStaff } from "../src/actions/staff";
import { createBatch, enrollStudentInBatch, getAllBatches } from "../src/actions/academics";
import { processAdmission, getAllStudents } from "../src/actions/admission";
import { db } from "../src/db";
import { staff, batches, enrollments } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function verifyStaffAndAcademics() {
    console.log("Starting Verification of Staff & Academics Logic...");
    const TIMESTAMP = Date.now();

    // 1. Create Staff (Teacher)
    const teacherName = `VerifyTeacher_${TIMESTAMP}`;
    console.log(`\n1. Creating Staff: ${teacherName}`);

    // Using default phone for test
    const phone = `9${TIMESTAMP.toString().slice(-9)}`;
    const staffRes = await createStaff({
        name: teacherName,
        phone: phone,
        role: "TEACHER",
        baseSalary: 5000
    });

    if (!staffRes.success || !staffRes.staff) {
        console.error("❌ Failed to create staff:", staffRes.error);
        process.exit(1);
    }
    const teacherId = staffRes.staff.id;
    console.log(`✅ Staff Verified: ID ${teacherId}`);

    // 2. Create Student (for enrollment)
    const studentName = `VerifyStudent_${TIMESTAMP}`;
    console.log(`\n2. Creating Student: ${studentName}`);
    const admRes = await processAdmission({
        fatherName: `Father_${TIMESTAMP}`,
        phone: `8${TIMESTAMP.toString().slice(-9)}`,
        studentName: studentName,
        studentClass: "10",
        monthlyFee: 1000,
        joiningDate: new Date()
    });

    if (!admRes.success || !admRes.studentId) {
        console.error("❌ Failed to admit student:", admRes.error);
        process.exit(1);
    }
    const studentId = admRes.studentId.toString();
    console.log(`✅ Student Created: ID ${studentId}`);

    // 3. Create Batch linked to Teacher
    const batchName = `VerifyBatch_${TIMESTAMP}`;
    console.log(`\n3. Creating Batch: ${batchName} linked to Teacher ${teacherId}`);

    const batchRes = await createBatch({
        name: batchName,
        fee: 800,
        schedule: "Tue/Thu 10-11 AM",
        teacherId: teacherId
    });

    if (!batchRes.batch) {
        console.error("❌ Failed to create batch");
        process.exit(1);
    }
    const batchId = batchRes.batch.id.toString();
    console.log(`✅ Batch Created: ID ${batchId}`);

    // 4. Enroll Student in Batch
    console.log(`\n4. Enrolling Student ${studentId} in Batch ${batchId}`);
    const enrollRes = await enrollStudentInBatch(studentId, batchId);

    if (!enrollRes.success) {
        console.error("❌ Enrollment Failed:", enrollRes.error);
        process.exit(1);
    }
    console.log("✅ Enrollment Successful");

    // 5. Verify Database State
    console.log("\n5. Verifying Database State for Enrollment...");
    const enrollmentCheck = await db.query.enrollments.findFirst({
        where: (enrollments, { and, eq }) => and(
            eq(enrollments.studentId, parseInt(studentId)),
            eq(enrollments.batchId, parseInt(batchId)),
            eq(enrollments.isActive, true)
        )
    });

    if (enrollmentCheck) {
        console.log("✅ Database verification passed: Active enrollment found.");
    } else {
        console.error("❌ Database verification failed: Enrollment record not found.");
        process.exit(1);
    }

    console.log("\n🎉 ALL VERIFICATION CHECKS PASSED");
}

verifyStaffAndAcademics().catch(err => {
    console.error("script error:", err);
    process.exit(1);
});
