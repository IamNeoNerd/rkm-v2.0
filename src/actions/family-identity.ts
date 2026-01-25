"use server";

import { db } from "@/db";
import { families, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

/**
 * Gets the current identity status for a family (whether it's linked to a user account).
 */
export async function getFamilyIdentityStatus(
    familyId: number
): Promise<{
    hasIdentity: boolean;
    phone: string | null;
    hasLinkedUser: boolean;
    userName: string | null;
    displayPassword?: string | null;
    error?: string;
}> {
    try {
        const [family] = await db
            .select({
                phone: families.phone,
                userId: families.userId,
            })
            .from(families)
            .where(eq(families.id, familyId))
            .limit(1);

        if (!family) {
            return { hasIdentity: false, phone: null, hasLinkedUser: false, userName: null, error: "Family not found" };
        }

        let userName: string | null = null;
        if (family.userId) {
            const [user] = await db
                .select({
                    name: users.name,
                    displayPassword: users.displayPassword
                })
                .from(users)
                .where(eq(users.id, family.userId))
                .limit(1);

            return {
                hasIdentity: !!family.phone,
                phone: family.phone,
                hasLinkedUser: true,
                userName: user?.name || null,
                displayPassword: user?.displayPassword,
            };
        }

        return {
            hasIdentity: !!family.phone,
            phone: family.phone,
            hasLinkedUser: !!family.userId,
            userName,
        };
    } catch (error) {
        console.error("Error getting family identity status:", error);
        return { hasIdentity: false, phone: null, hasLinkedUser: false, userName: null, error: "Failed to fetch status" };
    }
}

/**
 * Creates or updates the parent user account linked to a family.
 * The phone number is the identifier for parent login.
 */
export async function updateFamilyIdentity(
    familyId: number,
    data: {
        passkey: string; // Required - creates/updates the linked user's password
    }
): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
        // 1. Get current family data
        const [family] = await db
            .select()
            .from(families)
            .where(eq(families.id, familyId))
            .limit(1);

        if (!family) {
            return { success: false, error: "Family not found" };
        }

        if (!family.phone) {
            return { success: false, error: "Family has no phone number registered" };
        }

        if (!data.passkey || data.passkey.length < 6) {
            return { success: false, error: "Passkey must be at least 6 characters" };
        }

        const hashedPassword = await bcrypt.hash(data.passkey, 10);
        let userId = family.userId;

        if (userId) {
            // Update existing user's password and display password
            await db.update(users)
                .set({
                    password: hashedPassword,
                    displayPassword: data.passkey,
                    updatedAt: new Date()
                })
                .where(eq(users.id, userId));
        } else {
            // Create a new user account for this parent
            const newUserId = crypto.randomUUID();
            await db.insert(users).values({
                id: newUserId,
                name: family.fatherName,
                role: "parent",
                password: hashedPassword,
                displayPassword: data.passkey,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            userId = newUserId;

            // Link the family to the new user
            await db.update(families)
                .set({ userId: userId, updatedAt: new Date() })
                .where(eq(families.id, familyId));
        }

        revalidatePath(`/families/${familyId}`);
        revalidatePath("/families");

        return { success: true, userId };
    } catch (error) {
        console.error("Error updating family identity:", error);
        return { success: false, error: "Failed to update identity" };
    }
}
