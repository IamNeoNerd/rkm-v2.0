"use server";

import { db } from "@/db";
import { batches, staff, feeStructures, academicSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get public information for unverified users
 * No auth required - this is public data
 */
export async function getPublicBrowseInfo() {
    try {
        // Get current session
        const [currentSession] = await db
            .select()
            .from(academicSessions)
            .where(eq(academicSessions.isCurrent, true))
            .limit(1);

        // Get active batches with teacher info
        const batchList = await db.query.batches.findMany({
            where: eq(batches.isActive, true),
            with: {
                teacher: {
                    columns: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        // Get active teachers
        const teachers = await db
            .select({
                id: staff.id,
                name: staff.name,
                role: staff.role,
            })
            .from(staff)
            .where(and(
                eq(staff.isActive, true),
                eq(staff.role, "TEACHER")
            ));

        // Get fee structures
        const fees = await db
            .select({
                id: feeStructures.id,
                className: feeStructures.className,
                monthlyFee: feeStructures.monthlyFee,
                admissionFee: feeStructures.admissionFee,
            })
            .from(feeStructures)
            .where(eq(feeStructures.isActive, true));

        return {
            success: true,
            data: {
                currentSession: currentSession?.name || "Not Set",
                batches: batchList.map(b => ({
                    id: b.id,
                    name: b.name,
                    schedule: b.schedule,
                    fee: b.fee,
                    teacherName: b.teacher?.name || "TBA",
                })),
                teachers: teachers,
                feeStructures: fees,
            }
        };
    } catch (error) {
        console.error("Error fetching public info:", error);
        return {
            success: false,
            error: "Failed to load information",
            data: null,
        };
    }
}
