import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const email = "admin@rkinstitute.com";
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existing) {
            await db
                .update(users)
                .set({
                    password: hashedPassword,
                    role: "super-admin",
                    isVerified: true,
                    updatedAt: new Date(),
                })
                .where(eq(users.email, email));

            return NextResponse.json({
                success: true,
                message: `Updated existing admin user: ${email}`,
                user: {
                    id: existing.id,
                    email: email,
                    role: "super-admin",
                    isVerified: true
                }
            });
        } else {
            const [newUser] = await db
                .insert(users)
                .values({
                    email: email,
                    password: hashedPassword,
                    role: "super-admin",
                    isVerified: true,
                    name: "System Admin",
                })
                .returning();

            return NextResponse.json({
                success: true,
                message: `Created new admin user: ${email}`,
                user: {
                    id: newUser.id,
                    email: email,
                    role: "super-admin",
                    isVerified: true
                }
            });
        }
    } catch (error) {
        console.error("Error in fix-admin:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
