/**
 * Seed Everything Script
 * A comprehensive seed script to fill ALL modules with realistic data
 * Truncates existing data (except users) and starts fresh
 */

import "dotenv/config";
import { db } from "../src/db";
import {
    families, students, staff, batches, enrollments,
    transactions, attendance, academicSessions, feeStructures,
    auditLogs
} from "../src/db/schema";
import { eq, sql } from "drizzle-orm";
import { subDays, format } from "date-fns";

const log = (msg: string) => console.log(`[SEED-ALL] ${msg}`);
const success = (msg: string) => console.log(`[✅] ${msg}`);

async function seedEverything() {
    log("Starting comprehensive data seeding...\n");

    try {
        // =====================
        // STEP 0: CLEANUP
        // =====================
        log("Cleaning up existing data (preserving users)...");
        await db.delete(attendance);
        await db.delete(enrollments);
        await db.delete(transactions);
        await db.delete(batches);
        await db.delete(students);
        await db.delete(families);
        await db.delete(staff);
        await db.delete(feeStructures);
        await db.delete(academicSessions);
        await db.delete(auditLogs);
        success("Cleanup complete");

        // =====================
        // STEP 1: ACADEMIC SESSIONS
        // =====================
        log("Creating academic sessions...");
        const [session] = await db.insert(academicSessions).values([
            {
                name: "2024-25",
                startDate: "2024-04-01",
                endDate: "2025-03-31",
                isCurrent: false
            },
            {
                name: "2025-26",
                startDate: "2025-04-01",
                endDate: "2026-03-31",
                isCurrent: true
            }
        ]).returning();
        success("Created 2 academic sessions");

        // =====================
        // STEP 2: FEE STRUCTURES
        // =====================
        log("Creating fee structures...");
        const classes = ["5", "6", "7", "8", "9", "10", "11", "12"];
        const feeData = classes.map(c => ({
            sessionId: session.id,
            className: c,
            monthlyFee: 800 + (parseInt(c) - 5) * 100,
            admissionFee: 1000 + (parseInt(c) - 5) * 200,
            isActive: true
        }));
        await db.insert(feeStructures).values(feeData);
        success(`Created fee structures for ${classes.length} classes`);

        // =====================
        // STEP 3: STAFF members
        // =====================
        log("Creating staff members...");
        const staffMembers = [
            { name: "Dr. Ramesh Chandra", phone: "9001234567", role: "ADMIN" as const, baseSalary: 45000, email: "ramesh@rkinstitute.com" },
            { name: "Anjali Pandey", phone: "9002345678", role: "TEACHER" as const, baseSalary: 25000, email: "anjali@rkinstitute.com" },
            { name: "Sanjay Kumar", phone: "9003456789", role: "TEACHER" as const, baseSalary: 28000, email: "sanjay@rkinstitute.com" },
            { name: "Meera Saxena", phone: "9004567890", role: "TEACHER" as const, baseSalary: 24000, email: "meera@rkinstitute.com" },
            { name: "Pooja Agarwal", phone: "9005678901", role: "RECEPTIONIST" as const, baseSalary: 18000, email: "pooja@rkinstitute.com" },
            { name: "Amitabh Kumar", phone: "9006789012", role: "TEACHER" as const, baseSalary: 30000, email: "amitabh@rkinstitute.com" },
            { name: "Sneha Gupta", phone: "9007890123", role: "TEACHER" as const, baseSalary: 22000, email: "sneha@rkinstitute.com" }
        ];
        const createdStaff = await db.insert(staff).values(staffMembers).returning();
        success(`Created ${createdStaff.length} staff members`);

        // =====================
        // STEP 4: BATCHES
        // =====================
        log("Creating batches...");
        const teacherIds = createdStaff.filter(s => s.role === "TEACHER").map(s => s.id);
        const batchesData = [
            { name: "Math Grade 10-A", fee: 1200, schedule: "Mon, Wed, Fri (4:00 PM - 5:30 PM)", teacherId: teacherIds[0] },
            { name: "Physics Grade 12", fee: 1500, schedule: "Tue, Thu, Sat (5:00 PM - 7:00 PM)", teacherId: teacherIds[1] },
            { name: "Chemistry Grade 11", fee: 1400, schedule: "Mon, Wed, Fri (6:00 PM - 7:30 PM)", teacherId: teacherIds[2] },
            { name: "English Foundation (6-8)", fee: 800, schedule: "Sat, Sun (10:00 AM - 12:00 PM)", teacherId: teacherIds[3] },
            { name: "Biology Grade 10", fee: 1100, schedule: "Tue, Thu (3:30 PM - 5:00 PM)", teacherId: teacherIds[4] },
            { name: "Advanced Math Grade 12", fee: 1800, schedule: "Daily (7:30 AM - 9:00 AM)", teacherId: teacherIds[0] }
        ];
        const createdBatches = await db.insert(batches).values(batchesData).returning();
        success(`Created ${createdBatches.length} batches`);

        // =====================
        // STEP 5: FAMILIES & STUDENTS
        // =====================
        log("Creating families and students...");
        const familyPool = [
            { father: "Rajesh Sharma", phone: "9810010001", kids: ["Aryan Sharma", "Aditi Sharma"] },
            { father: "Mohammad Arif", phone: "9810010002", kids: ["Zoya Arif"] },
            { father: "Vikram Singh", phone: "9810010003", kids: ["Kartik Singh", "Kavya Singh"] },
            { father: "Sunil Gupta", phone: "9810010004", kids: ["Rohan Gupta"] },
            { father: "Amit Verma", phone: "9810010005", kids: ["Ishaan Verma", "Ananya Verma"] },
            { father: "Deepak Yadav", phone: "9810010006", kids: ["Priyan Yadav"] },
            { father: "Sameer Ahmed", phone: "9810010007", kids: ["Sara Ahmed"] },
            { father: "Alok Tiwari", phone: "9810010008", kids: ["Reyans Tiwari", "Vihaan Tiwari"] },
            { father: "Suresh Patel", phone: "9810010009", kids: ["Mehul Patel"] },
            { father: "Pankaj Jain", phone: "9810010010", kids: ["Samay Jain"] },
            { father: "Vijay Mishra", phone: "9810010011", kids: ["Tanvi Mishra"] },
            { father: "Satish Reddy", phone: "9810010012", kids: ["Lokesh Reddy"] }
        ];

        const attendanceData = [];
        const transactionData = [];

        for (const f of familyPool) {
            const [fam] = await db.insert(families).values({
                fatherName: f.father,
                phone: f.phone,
                balance: 0
            }).returning();

            let familyBalance = 0;

            for (const kidName of f.kids) {
                const classLevel = (10 + Math.floor(Math.random() * 3) - 2).toString(); // Random class 8-12
                const [student] = await db.insert(students).values({
                    name: kidName,
                    familyId: fam.id,
                    class: classLevel,
                    isActive: true
                }).returning();

                // Enroll in 1-2 random batches
                const numBatches = 1 + Math.floor(Math.random() * 2);
                const shuffledBatches = [...createdBatches].sort(() => 0.5 - Math.random());
                const selectedBatches = shuffledBatches.slice(0, numBatches);

                for (const b of selectedBatches) {
                    await db.insert(enrollments).values({
                        studentId: student.id,
                        batchId: b.id
                    });

                    // Collect attendance history for the last 30 days
                    for (let i = 0; i < 30; i++) {
                        const status = Math.random() > 0.2
                            ? (Math.random() > 0.9 ? "Late" : "Present")
                            : (Math.random() > 0.5 ? "Absent" : null);

                        if (status) {
                            attendanceData.push({
                                batchId: b.id,
                                studentId: student.id,
                                date: format(subDays(new Date(), i), "yyyy-MM-dd"),
                                status: status
                            });
                        }
                    }
                }

                // Collect admission fee debit
                const adminFee = 1500;
                transactionData.push({
                    type: "DEBIT" as const,
                    category: "FEE" as const,
                    amount: adminFee,
                    familyId: fam.id,
                    description: `Admission fee for ${kidName}`,
                    createdAt: subDays(new Date(), 45)
                });
                familyBalance -= adminFee;

                // Collect monthly fee debits for last 2 months
                for (let m = 0; m < 2; m++) {
                    const monthlyFee = 1200;
                    transactionData.push({
                        type: "DEBIT" as const,
                        category: "FEE" as const,
                        amount: monthlyFee,
                        familyId: fam.id,
                        description: `Monthly fee - ${m === 0 ? "Jan" : "Dec"} 2025`,
                        createdAt: subDays(new Date(), m * 30 + 5)
                    });
                    familyBalance -= monthlyFee;
                }
            }

            // Create some payments to balance it out
            const paymentAmount = Math.abs(familyBalance) * (0.8 + Math.random() * 0.4);
            const roundedPayment = Math.round(paymentAmount / 100) * 100;
            if (roundedPayment > 0) {
                transactionData.push({
                    type: "CREDIT" as const,
                    category: "FEE" as const,
                    amount: roundedPayment,
                    familyId: fam.id,
                    description: "Initial fee payment",
                    paymentMode: Math.random() > 0.5 ? "CASH" : "UPI",
                    receiptNumber: `RKI-${Date.now()}-${fam.id}`,
                    createdAt: subDays(new Date(), 10)
                });
                familyBalance += roundedPayment;
            }

            await db.update(families).set({ balance: Math.round(familyBalance) }).where(eq(families.id, fam.id));
        }

        // Bulk insert attendance and transactions
        log(`Bulk inserting ${attendanceData.length} attendance records...`);
        if (attendanceData.length > 0) {
            await db.insert(attendance).values(attendanceData);
        }

        log(`Bulk inserting ${transactionData.length} transactions...`);
        if (transactionData.length > 0) {
            await db.insert(transactions).values(transactionData);
        }
        success("Created 12 families, 19 students, and attendance history");

        // =====================
        // STEP 6: STAFF SALARIES & EXPENSES
        // =====================
        log("Creating staff salary and expense transactions...");
        for (const s of createdStaff) {
            // Salary for last 2 months
            for (let m = 1; m <= 2; m++) {
                await db.insert(transactions).values({
                    type: "DEBIT",
                    category: "SALARY",
                    amount: s.baseSalary,
                    staffId: s.id,
                    description: `Salary Payout - ${m === 1 ? "Dec 2025" : "Nov 2025"}`,
                    createdAt: subDays(new Date(), m * 30)
                });
            }
        }

        const expenseHeads = ["Electricity Bill", "Rent", "Internet", "Water Bill", "Marketing", "Stationery"];
        for (const head of expenseHeads) {
            await db.insert(transactions).values({
                type: "DEBIT",
                category: "EXPENSE",
                amount: 2000 + Math.floor(Math.random() * 8000),
                expenseHead: head,
                description: `Monthly ${head}`,
                createdAt: subDays(new Date(), 15)
            });
        }
        success("Created salary and expense transactions");

        // =====================
        // STEP 7: AUDIT LOGS
        // =====================
        log("Creating audit logs...");
        // Just add a few recent logs
        await db.insert(auditLogs).values([
            { action: "CREATE", tableName: "students", recordId: "1", createdAt: subDays(new Date(), 1) },
            { action: "UPDATE", tableName: "families", recordId: "2", createdAt: subDays(new Date(), 2) },
            { action: "CREATE", tableName: "batches", recordId: "3", createdAt: subDays(new Date(), 5) }
        ]);
        success("Created audit logs");

        log("\n✅ ALL MODULES POPULATED WITH REALISTIC DATA!");
        console.log("-----------------------------------------");
        console.log(`Sessions: 2`);
        console.log(`Fee Structures: ${classes.length}`);
        console.log(`Staff: ${createdStaff.length}`);
        console.log(`Batches: ${createdBatches.length}`);
        console.log(`Families: 12`);
        console.log(`Students: 19`);
        console.log(`Transactions: Many (Full history)`);
        console.log(`Attendance: ~500 records`);
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

seedEverything();
