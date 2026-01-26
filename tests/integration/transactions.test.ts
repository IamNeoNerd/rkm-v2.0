import "dotenv/config";
import { describe, it, expect, vi } from 'vitest';

// Mock auth dependencies to avoid Next.js server issues in node environment
vi.mock('@/auth', () => ({
    auth: vi.fn(() => Promise.resolve({ user: { email: 'test@test.com', role: 'super-admin', isVerified: true } })),
}));

vi.mock('@/lib/auth-guard', () => ({
    requireAuth: vi.fn(() => Promise.resolve({ user: { email: 'test@test.com', role: 'super-admin', isVerified: true } })),
    requireRole: vi.fn(() => Promise.resolve({ user: { email: 'test@test.com', role: 'super-admin', isVerified: true } })),
    AuthorizationError: class AuthorizationError extends Error {
        code = 'AUTHORIZATION_ERROR';
    },
}));

vi.mock('@/lib/server-utils', () => ({
    safeRevalidatePath: vi.fn(),
}));

const { loggerMock } = vi.hoisted(() => ({
    loggerMock: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    }
}));

vi.mock('@/lib/logger', () => ({
    logger: loggerMock,
    audit: vi.fn(() => Promise.resolve()),
    AuditAction: {
        SESSION_CREATE: 'session.create',
        SESSION_ACTIVATE: 'session.activate',
        FEE_STRUCTURE_UPDATE: 'fee_structure.update',
    }
}));
import { db } from '@/db';
import { families, students, transactions, academicSessions, enrollments, feeStructures, batches, staff } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { processAdmission } from '@/actions/admission';
import { processPayment } from '@/actions/billing';
import { transitionToNewSession } from '@/actions/session';

describe('Database Transaction Integration', () => {
    // Only run if DATABASE_URL is available and points to a test DB
    const runIntegration = !!process.env.DATABASE_URL;

    if (!runIntegration) {
        it.skip('Skipping integration tests: DATABASE_URL not set', () => { });
        return;
    }

    const TEST_TIMESTAMP = Date.now();
    const TEST_PHONE = `9${TEST_TIMESTAMP.toString().slice(-9)}`;

    it('should maintain atomicity during processAdmission', async () => {
        // Test case: Admission that should succeed
        const res = await processAdmission({
            fatherName: `IntegrationTest_Father_${TEST_TIMESTAMP}`,
            phone: TEST_PHONE,
            studentName: `IntegrationTest_Student_${TEST_TIMESTAMP}`,
            studentClass: "10",
            monthlyFee: 1000,
            joiningDate: new Date()
        });


        expect(res.success).toBe(true);
        if (!res.success) throw new Error("Admission failed");

        // Type guard: check properties exist
        if (!('familyId' in res) || !('studentId' in res)) {
            throw new Error("Expected familyId and studentId in success result");
        }

        expect(res.familyId).toBeDefined();

        // Verify DB records exist
        const [family] = await db.select().from(families).where(eq(families.id, res.familyId)).limit(1);
        expect(family).toBeDefined();

        const [student] = await db.select().from(students).where(eq(students.id, res.studentId)).limit(1);
        expect(student).toBeDefined();
    });

    it('should atomically process payments and update balance', async () => {
        // Find the family we just created
        const familyRecord = await db.query.families.findFirst({
            where: eq(families.fatherName, `IntegrationTest_Father_${TEST_TIMESTAMP}`)
        });

        if (!familyRecord) throw new Error("Test family not found");

        const initialBalance = familyRecord.balance || 0;
        const paymentAmount = 500;

        const res = await processPayment({
            familyId: familyRecord.id.toString(),
            amount: paymentAmount,
            mode: 'CASH'
        });

        expect(res).not.toHaveProperty('error');

        // Verify balance updated and transaction record exists
        const updatedFamily = await db.query.families.findFirst({
            where: eq(families.id, familyRecord.id)
        });
        expect(updatedFamily?.balance).toBe(initialBalance + paymentAmount);

        const [txn] = await db.select().from(transactions).where(eq(transactions.familyId, familyRecord.id)).orderBy(desc(transactions.createdAt)).limit(1);
        expect(txn?.amount).toBe(paymentAmount);
    });

    describe('Session Transition rollover', () => {
        let currentSessionId: number;
        let nextSessionId: number;
        let testStudentId: number;

        it('should perform a full year rollover correctly', async () => {
            // Cleanup previous test sessions to avoid "limit(1)" picking old ones
            await db.update(academicSessions).set({ isCurrent: false });

            // 1. Setup Sessions
            const [cSession] = await db.insert(academicSessions).values({
                name: `CS_${TEST_TIMESTAMP}`,
                startDate: "2025-04-01",
                endDate: "2026-03-31",
                isCurrent: true
            }).returning();
            currentSessionId = cSession.id;

            const [nSession] = await db.insert(academicSessions).values({
                name: `NS_${TEST_TIMESTAMP}`,
                startDate: "2026-04-01",
                endDate: "2027-03-31",
                isCurrent: false
            }).returning();
            nextSessionId = nSession.id;

            // 2. Setup Fee Structure in current session
            await db.insert(feeStructures).values({
                sessionId: currentSessionId,
                className: "Class 5",
                monthlyFee: 2000,
                admissionFee: 500
            });

            // 3. Setup Student with Override
            const [family] = await db.insert(families).values({
                fatherName: `RollFamily_${TEST_TIMESTAMP}`,
                phone: `8${TEST_TIMESTAMP.toString().slice(-9)}`
            }).returning();

            const [student] = await db.insert(students).values({
                familyId: family.id,
                name: `RollStudent_${TEST_TIMESTAMP}`,
                class: "Class 5",
                baseFeeOverride: 1800,
                isActive: true
            }).returning();
            testStudentId = student.id;

            // 4. Setup Batch and Enrollment
            const [tStaff] = await db.insert(staff).values({
                name: `RollTeacher_${TEST_TIMESTAMP}`,
                phone: `7${TEST_TIMESTAMP.toString().slice(-9)}`,
                role: "TEACHER"
            }).returning();

            const [batch] = await db.insert(batches).values({
                name: `RollBatch_${TEST_TIMESTAMP}`,
                teacherId: tStaff.id,
                fee: 500,
                isActive: true
            }).returning();

            await db.insert(enrollments).values({
                studentId: testStudentId,
                batchId: batch.id,
                isActive: true
            });

            // 5. Execute Transition
            const res = await transitionToNewSession(nextSessionId, {
                promoteStudents: true,
                resetEnrollments: true,
                resetFeeOverrides: true,
                copyFeeStructures: true
            });

            if (!res.success) {
                const errorCall = loggerMock.error.mock.calls[0];
                if (errorCall) {
                    console.error("Internal Error Details:", errorCall);
                }
                throw new Error("Transition failed: " + ('error' in res ? res.error : 'Unknown error'));
            }
            expect(res.success).toBe(true);

            // 6. Verify Promotions
            const [updatedStudent] = await db.select().from(students).where(eq(students.id, testStudentId)).limit(1);
            expect(updatedStudent?.class).toBe("Class 6");
            expect(updatedStudent?.baseFeeOverride).toBeNull();

            // 7. Verify Enrollments Reset
            const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.studentId, testStudentId)).limit(1);
            expect(enrollment?.isActive).toBe(false);

            // 8. Verify Fee Structures Copied
            const [newFees] = await db.select().from(feeStructures).where(eq(feeStructures.sessionId, nextSessionId)).limit(1);
            expect(newFees?.className).toBe("Class 5");

            // 9. Verify Session Activation
            const [sessionActive] = await db.select().from(academicSessions).where(eq(academicSessions.id, nextSessionId)).limit(1);
            expect(sessionActive?.isCurrent).toBe(true);

            const [sessionOld] = await db.select().from(academicSessions).where(eq(academicSessions.id, currentSessionId)).limit(1);
            expect(sessionOld?.isCurrent).toBe(false);
        }, 30000);
    });
});
