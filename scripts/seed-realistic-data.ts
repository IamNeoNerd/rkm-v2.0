/**
 * Seed Realistic Data Script
 * Populates the ERP with production-like data for comprehensive testing
 * 
 * Data Distribution:
 * - 10 Families with realistic Indian names
 * - 15-18 Students across Classes 5-12
 * - 5 Staff (1 Admin, 3 Teachers, 1 Receptionist)
 * - 6 Batches (Math, Science, English for different class groups)
 * - Enrollments and Transactions
 */

import "dotenv/config";
import { db } from "../src/db";
import { families, students, staff, batches, enrollments, transactions, academicSessions } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { calculateJoiningFee } from "../src/lib/billing";

const log = (msg: string) => console.log(`[SEED] ${msg}`);
const success = (msg: string) => console.log(`[✅] ${msg}`);

// =====================
// REALISTIC DATA DEFINITIONS
// =====================

const FAMILIES_DATA = [
    {
        fatherName: "Rajesh Kumar", phone: "9876543210", children: [
            { name: "Aarav Kumar", class: "10", fee: 1200 },
            { name: "Ananya Kumar", class: "8", fee: 1000 }
        ]
    },
    {
        fatherName: "Sunil Sharma", phone: "9812345678", children: [
            { name: "Rohan Sharma", class: "12", fee: 1500 }
        ]
    },
    {
        fatherName: "Amit Verma", phone: "9898989898", children: [
            { name: "Ishaan Verma", class: "9", fee: 1100 },
            { name: "Kavya Verma", class: "6", fee: 900 }
        ]
    },
    {
        fatherName: "Priya Singh", phone: "9765432100", children: [
            { name: "Arjun Singh", class: "11", fee: 1400 }
        ]
    },
    {
        fatherName: "Vikram Yadav", phone: "9654321098", children: [
            { name: "Vihaan Yadav", class: "10", fee: 1200 },
            { name: "Diya Yadav", class: "7", fee: 950 },
            { name: "Aditya Yadav", class: "5", fee: 850 }
        ]
    },
    {
        fatherName: "Anita Gupta", phone: "9543210987", children: [
            { name: "Sanya Gupta", class: "9", fee: 1100 }
        ]
    },
    {
        fatherName: "Mohammad Aslam", phone: "9432109876", children: [
            { name: "Ayaan Aslam", class: "11", fee: 1400 },
            { name: "Zara Aslam", class: "8", fee: 1000 }
        ]
    },
    {
        fatherName: "Deepak Tiwari", phone: "9321098765", children: [
            { name: "Reyansh Tiwari", class: "10", fee: 1200 }
        ]
    },
    {
        fatherName: "Sunita Devi", phone: "9210987654", children: [
            { name: "Aanya Kumari", class: "8", fee: 1000 },
            { name: "Vivaan Kumar", class: "6", fee: 900 }
        ]
    },
    {
        fatherName: "Rakesh Mishra", phone: "9109876543", children: [
            { name: "Advait Mishra", class: "12", fee: 1500 }
        ]
    }
];

const STAFF_DATA = [
    { name: "Dr. Ramesh Chandra", phone: "9001234567", role: "ADMIN" as const, salary: 45000, email: "ramesh@rkinstitute.com" },
    { name: "Anjali Pandey", phone: "9002345678", role: "TEACHER" as const, salary: 25000, email: "anjali@rkinstitute.com" },
    { name: "Sanjay Kumar", phone: "9003456789", role: "TEACHER" as const, salary: 28000, email: "sanjay@rkinstitute.com" },
    { name: "Meera Saxena", phone: "9004567890", role: "TEACHER" as const, salary: 24000, email: "meera@rkinstitute.com" },
    { name: "Pooja Agarwal", phone: "9005678901", role: "RECEPTIONIST" as const, salary: 18000, email: "pooja@rkinstitute.com" }
];

// Batches schema: name, fee, schedule, teacherId
const BATCHES_DATA = [
    { name: "Math Class 8-10 (MWF 4-5pm)", fee: 800, schedule: "Mon-Wed-Fri 4:00-5:00 PM", teacherIndex: 1 },
    { name: "Math Class 11-12 (MWF 5-6pm)", fee: 1200, schedule: "Mon-Wed-Fri 5:00-6:00 PM", teacherIndex: 1 },
    { name: "Science Class 8-10 (TTS 4-5pm)", fee: 900, schedule: "Tue-Thu-Sat 4:00-5:00 PM", teacherIndex: 2 },
    { name: "Science Class 11-12 (TTS 5-6pm)", fee: 1300, schedule: "Tue-Thu-Sat 5:00-6:00 PM", teacherIndex: 2 },
    { name: "English Class 6-10 (Sat 10am-12pm)", fee: 600, schedule: "Sat 10:00 AM-12:00 PM", teacherIndex: 3 },
    { name: "English Class 11-12 (Sat 2-4pm)", fee: 800, schedule: "Sat 2:00-4:00 PM", teacherIndex: 3 }
];

// Map student class to batch assignments
function getBatchesForClass(studentClass: string): number[] {
    const classNum = parseInt(studentClass);
    const batchIndices: number[] = [];

    // Math batch
    if (classNum >= 8 && classNum <= 10) batchIndices.push(0);
    if (classNum >= 11 && classNum <= 12) batchIndices.push(1);

    // Science batch
    if (classNum >= 8 && classNum <= 10) batchIndices.push(2);
    if (classNum >= 11 && classNum <= 12) batchIndices.push(3);

    // English batch
    if (classNum >= 6 && classNum <= 10) batchIndices.push(4);
    if (classNum >= 11 && classNum <= 12) batchIndices.push(5);

    return batchIndices;
}

async function seedRealisticData() {
    log("Starting realistic data seeding...\n");

    try {
        // Get current academic session
        const currentSession = await db.query.academicSessions.findFirst({
            where: eq(academicSessions.isCurrent, true)
        });

        if (!currentSession) {
            log("⚠️ No current academic session found. Creating default session...");
            await db.insert(academicSessions).values({
                name: "2025-26",
                startDate: "2025-04-01",
                endDate: "2026-03-31",
                isCurrent: true
            });
        }

        // =====================
        // STEP 1: CREATE STAFF
        // =====================
        log("Creating staff members...");
        const createdStaff: { id: number; name: string }[] = [];

        for (const s of STAFF_DATA) {
            const [inserted] = await db.insert(staff).values({
                name: s.name,
                phone: s.phone,
                email: s.email,
                role: s.role,
                baseSalary: s.salary,
                isActive: true
            }).returning({ id: staff.id, name: staff.name });
            createdStaff.push(inserted);
        }
        success(`Created ${createdStaff.length} staff members`);

        // =====================
        // STEP 2: CREATE BATCHES
        // =====================
        log("Creating batches...");
        const createdBatches: { id: number; name: string }[] = [];

        for (const b of BATCHES_DATA) {
            const teacherId = createdStaff[b.teacherIndex].id;
            const [inserted] = await db.insert(batches).values({
                name: b.name,
                fee: b.fee,
                schedule: b.schedule,
                teacherId: teacherId,
                isActive: true
            }).returning({ id: batches.id, name: batches.name });
            createdBatches.push(inserted);
        }
        success(`Created ${createdBatches.length} batches`);

        // =====================
        // STEP 3: CREATE FAMILIES & STUDENTS
        // =====================
        log("Creating families and students...");
        const joiningDate = new Date("2025-04-15"); // Simulate April joining
        let totalStudents = 0;
        let totalEnrollments = 0;
        let totalTransactions = 0;

        for (const familyData of FAMILIES_DATA) {
            // Create family
            const [insertedFamily] = await db.insert(families).values({
                fatherName: familyData.fatherName,
                phone: familyData.phone,
                balance: 0
            }).returning({ id: families.id });

            const familyId = insertedFamily.id;
            let familyBalance = 0;

            // Create students and enrollments
            for (const childData of familyData.children) {
                // Create student
                const [insertedStudent] = await db.insert(students).values({
                    name: childData.name,
                    class: childData.class,
                    familyId: familyId,
                    baseFeeOverride: childData.fee,
                    isActive: true
                }).returning({ id: students.id });

                totalStudents++;

                // Calculate joining fee using suggestedAmount from the returned object
                const feeResult = calculateJoiningFee(joiningDate, childData.fee);
                const joiningFee = feeResult.suggestedAmount;

                // Create admission fee transaction
                await db.insert(transactions).values({
                    type: "DEBIT",
                    category: "FEE",
                    amount: joiningFee,
                    familyId: familyId,
                    description: `Admission fee for ${childData.name} (Class ${childData.class})`
                });
                familyBalance -= joiningFee;
                totalTransactions++;

                // Enroll student in appropriate batches
                const batchIndices = getBatchesForClass(childData.class);
                for (const batchIdx of batchIndices) {
                    const batch = createdBatches[batchIdx];
                    await db.insert(enrollments).values({
                        studentId: insertedStudent.id,
                        batchId: batch.id
                    });
                    totalEnrollments++;
                }
            }

            // Simulate some payments (random 60% paid)
            if (Math.random() > 0.4) {
                const paymentAmount = Math.abs(familyBalance) * (0.5 + Math.random() * 0.5);
                const roundedPayment = Math.round(paymentAmount / 100) * 100;

                if (roundedPayment > 0) {
                    await db.insert(transactions).values({
                        type: "CREDIT",
                        category: "FEE",
                        amount: roundedPayment,
                        familyId: familyId,
                        description: "Fee payment",
                        paymentMode: Math.random() > 0.5 ? "CASH" : "UPI",
                        receiptNumber: `RKI-${Date.now()}-${familyId}`
                    });
                    familyBalance += roundedPayment;
                    totalTransactions++;
                }
            }

            // Update family balance
            await db.update(families)
                .set({ balance: familyBalance })
                .where(eq(families.id, familyId));
        }

        success(`Created ${FAMILIES_DATA.length} families`);
        success(`Created ${totalStudents} students`);
        success(`Created ${totalEnrollments} enrollments`);
        success(`Created ${totalTransactions} transactions`);

        // =====================
        // SUMMARY
        // =====================
        console.log("\n=== SEEDING SUMMARY ===");
        console.log(`Staff: ${createdStaff.length}`);
        console.log(`Batches: ${createdBatches.length}`);
        console.log(`Families: ${FAMILIES_DATA.length}`);
        console.log(`Students: ${totalStudents}`);
        console.log(`Enrollments: ${totalEnrollments}`);
        console.log(`Transactions: ${totalTransactions}`);
        console.log("\n✅ Realistic data seeding complete!");
        console.log("Database is now populated with production-like data for testing.");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

seedRealisticData();
