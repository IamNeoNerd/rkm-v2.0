'use server';

import { db } from "@/db";
import { academicSessions, enrollments, students, feeStructures, families, transactions } from "@/db/schema";
import { eq, sql, and, desc, count } from "drizzle-orm";
import { safeRevalidatePath } from "@/lib/server-utils";
import { requireRole, AuthorizationError, requireAuth } from "@/lib/auth-guard";
import { audit, AuditAction, logger } from "@/lib/logger";

// ============================================
// Session CRUD Operations
// ============================================

export interface CreateSessionData {
    name: string;
    startDate: string;
    endDate: string;
}

export async function createSession(data: CreateSessionData) {
    try {
        await requireRole(['super-admin', 'admin']);

        const { name, startDate, endDate } = data;

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            return { success: false, error: "End date must be after start date" };
        }

        // Check for duplicate name
        const [existing] = await db
            .select({ id: academicSessions.id })
            .from(academicSessions)
            .where(eq(academicSessions.name, name))
            .limit(1);

        if (existing) {
            return { success: false, error: `Session "${name}" already exists` };
        }

        const [newSession] = await db
            .insert(academicSessions)
            .values({
                name,
                startDate,
                endDate,
                isCurrent: false,
            })
            .returning();

        await audit(AuditAction.SESSION_CREATE, { name, startDate, endDate }, 'session', newSession.id);
        logger.info(`Session created: ${name}`);

        safeRevalidatePath('/settings/sessions');
        return { success: true, session: newSession };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        logger.error('Failed to create session', error);
        return { success: false, error: "Failed to create session" };
    }
}

export async function getAllSessions() {
    try {
        await requireAuth();

        const sessions = await db
            .select()
            .from(academicSessions)
            .orderBy(desc(academicSessions.startDate));

        return { success: true, sessions };

    } catch (error) {
        logger.error('Failed to fetch sessions', error);
        return { success: false, sessions: [], error: "Failed to fetch sessions" };
    }
}

export async function getCurrentSession() {
    try {
        const [current] = await db
            .select()
            .from(academicSessions)
            .where(eq(academicSessions.isCurrent, true))
            .limit(1);

        return { success: true, session: current || null };

    } catch (error) {
        logger.error('Failed to fetch current session', error);
        return { success: false, session: null, error: "Failed to fetch current session" };
    }
}

// ============================================
// Session Activation
// ============================================

export async function activateSession(sessionId: number) {
    try {
        await requireRole(['super-admin']);

        // Verify session exists
        const [session] = await db
            .select()
            .from(academicSessions)
            .where(eq(academicSessions.id, sessionId))
            .limit(1);

        if (!session) {
            return { success: false, error: "Session not found" };
        }

        if (session.isCurrent) {
            return { success: false, error: "This session is already active" };
        }

        // Deactivate all sessions and activate the selected one
        await db.transaction(async (tx) => {
            // Deactivate all
            await tx
                .update(academicSessions)
                .set({ isCurrent: false });

            // Activate selected
            await tx
                .update(academicSessions)
                .set({ isCurrent: true })
                .where(eq(academicSessions.id, sessionId));
        });

        await audit(AuditAction.SESSION_ACTIVATE, { sessionName: session.name }, 'session', sessionId);
        logger.info(`Session activated: ${session.name}`);

        safeRevalidatePath('/settings/sessions');
        safeRevalidatePath('/');
        return { success: true };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        logger.error('Failed to activate session', error);
        return { success: false, error: "Failed to activate session" };
    }
}

// ============================================
// Session Transition (Year Rollover)
// ============================================

export interface TransitionOptions {
    promoteStudents: boolean;    // Move students to next class
    resetEnrollments: boolean;   // Deactivate all batch enrollments
    resetFeeOverrides: boolean;  // Clear custom fee overrides
    copyFeeStructures: boolean;  // Copy fee structures to new session
}

export async function getTransitionPreview(newSessionId: number) {
    try {
        await requireRole(['super-admin']);

        // Get current active students count
        const [studentCount] = await db
            .select({ count: count() })
            .from(students)
            .where(eq(students.isActive, true));

        // Get active enrollments count
        const [enrollmentCount] = await db
            .select({ count: count() })
            .from(enrollments)
            .where(eq(enrollments.isActive, true));

        // Get students with fee overrides
        const [overrideCount] = await db
            .select({ count: count() })
            .from(students)
            .where(and(
                eq(students.isActive, true),
                sql`${students.baseFeeOverride} IS NOT NULL`
            ));

        // Get current session fee structures
        const currentSession = await getCurrentSession();
        const feeStructureCount = currentSession.session
            ? (await db
                .select({ count: count() })
                .from(feeStructures)
                .where(eq(feeStructures.sessionId, currentSession.session.id)))[0]?.count || 0
            : 0;

        return {
            success: true,
            preview: {
                activeStudents: studentCount?.count || 0,
                activeEnrollments: enrollmentCount?.count || 0,
                studentsWithOverrides: overrideCount?.count || 0,
                feeStructuresToCopy: feeStructureCount,
            }
        };

    } catch (error) {
        logger.error('Failed to get transition preview', error);
        return { success: false, error: "Failed to generate preview" };
    }
}

export async function transitionToNewSession(
    newSessionId: number,
    options: TransitionOptions
) {
    try {
        await requireRole(['super-admin']);

        // Verify new session exists
        const [newSession] = await db
            .select()
            .from(academicSessions)
            .where(eq(academicSessions.id, newSessionId))
            .limit(1);

        if (!newSession) {
            return { success: false, error: "Target session not found" };
        }

        const currentSession = await getCurrentSession();
        const transitionReport: Record<string, any> = {
            from: currentSession.session?.name || 'None',
            to: newSession.name,
            changes: {},
        };

        await db.transaction(async (tx) => {
            // 1. Promote students to next class
            if (options.promoteStudents) {
                const classProgression: Record<string, string> = {
                    "Class 1": "Class 2",
                    "Class 2": "Class 3",
                    "Class 3": "Class 4",
                    "Class 4": "Class 5",
                    "Class 5": "Class 6",
                    "Class 6": "Class 7",
                    "Class 7": "Class 8",
                    "Class 8": "Class 9",
                    "Class 9": "Class 10",
                    "Class 10": "Class 11",
                    "Class 11": "Class 12",
                    "Class 12": "Alumni", // Or mark as graduated
                };

                // Get all active students and promote them
                const activeStudents = await tx
                    .select()
                    .from(students)
                    .where(eq(students.isActive, true));

                let promotedCount = 0;
                let graduatedCount = 0;

                for (const student of activeStudents) {
                    const nextClass = classProgression[student.class];
                    if (nextClass) {
                        if (nextClass === "Alumni") {
                            // Mark as graduated (inactive)
                            await tx
                                .update(students)
                                .set({ isActive: false, updatedAt: new Date() })
                                .where(eq(students.id, student.id));
                            graduatedCount++;
                        } else {
                            await tx
                                .update(students)
                                .set({ class: nextClass, updatedAt: new Date() })
                                .where(eq(students.id, student.id));
                            promotedCount++;
                        }
                    }
                }

                transitionReport.changes.studentsPromoted = promotedCount;
                transitionReport.changes.studentsGraduated = graduatedCount;
            }

            // 2. Reset batch enrollments
            if (options.resetEnrollments) {
                const result = await tx
                    .update(enrollments)
                    .set({ isActive: false });
                transitionReport.changes.enrollmentsReset = true;
            }

            // 3. Reset fee overrides
            if (options.resetFeeOverrides) {
                await tx
                    .update(students)
                    .set({ baseFeeOverride: null, updatedAt: new Date() });
                transitionReport.changes.feeOverridesReset = true;
            }

            // 4. Copy fee structures
            if (options.copyFeeStructures && currentSession.session) {
                const currentFees = await tx
                    .select()
                    .from(feeStructures)
                    .where(eq(feeStructures.sessionId, currentSession.session.id));

                for (const fee of currentFees) {
                    await tx.insert(feeStructures).values({
                        sessionId: newSessionId,
                        className: fee.className,
                        monthlyFee: fee.monthlyFee,
                        admissionFee: fee.admissionFee,
                        isActive: true,
                    });
                }
                transitionReport.changes.feeStructuresCopied = currentFees.length;
            }

            // 5. Activate new session
            await tx
                .update(academicSessions)
                .set({ isCurrent: false });
            await tx
                .update(academicSessions)
                .set({ isCurrent: true })
                .where(eq(academicSessions.id, newSessionId));
        });

        await audit(
            AuditAction.SESSION_ACTIVATE,
            { transitionReport, options },
            'session',
            newSessionId
        );
        logger.info(`Session transition completed: ${transitionReport.from} -> ${transitionReport.to}`);

        safeRevalidatePath('/');
        safeRevalidatePath('/settings/sessions');
        safeRevalidatePath('/academics');
        safeRevalidatePath('/students');

        return { success: true, report: transitionReport };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        logger.error('Session transition failed', error);
        return { success: false, error: "Session transition failed" };
    }
}

// ============================================
// Fee Structure Management
// ============================================

export async function getSessionFeeStructures(sessionId?: number) {
    try {
        await requireAuth();

        let query = db.select().from(feeStructures);

        if (sessionId) {
            query = query.where(eq(feeStructures.sessionId, sessionId)) as any;
        }

        const structures = await query.orderBy(feeStructures.className);
        return { success: true, structures };

    } catch (error) {
        logger.error('Failed to fetch fee structures', error);
        return { success: false, structures: [], error: "Failed to fetch fee structures" };
    }
}

export async function updateFeeStructure(
    structureId: number,
    data: { monthlyFee?: number; admissionFee?: number; isActive?: boolean }
) {
    try {
        await requireRole(['super-admin', 'admin']);

        await db
            .update(feeStructures)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(feeStructures.id, structureId));

        safeRevalidatePath('/settings/fees');
        return { success: true };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        logger.error('Failed to update fee structure', error);
        return { success: false, error: "Failed to update fee structure" };
    }
}

export async function createFeeStructure(data: {
    sessionId: number;
    className: string;
    monthlyFee: number;
    admissionFee: number;
}) {
    try {
        await requireRole(['super-admin', 'admin']);

        const [structure] = await db
            .insert(feeStructures)
            .values({
                ...data,
                isActive: true,
            })
            .returning();

        safeRevalidatePath('/settings/fees');
        return { success: true, structure };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        logger.error('Failed to create fee structure', error);
        return { success: false, error: "Failed to create fee structure" };
    }
}

// Legacy function - kept for backward compatibility
export async function startNewSession() {
    try {
        logger.info("Starting New Session Transition (Legacy)...");

        // System Action A: Batch Cleanup (Deactivate all enrollments)
        await db.update(enrollments)
            .set({ isActive: false });

        logger.info("Batch enrollments deactivated.");

        // System Action B: Discount Reset
        await db.update(students)
            .set({ baseFeeOverride: null });

        logger.info("Fee overrides reset.");

        safeRevalidatePath("/");
        return { success: true, message: "New Session Started. Batches and Overrides reset." };

    } catch (error) {
        logger.error("Session Reset Error:", error);
        return { success: false, error: "Failed to reset session" };
    }
}
