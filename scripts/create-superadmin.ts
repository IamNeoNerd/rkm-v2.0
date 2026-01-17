import "dotenv/config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Ensure a superadmin account exists with email Admin@rkinstitute.com
async function ensureSuperAdmin() {
    const existing = await db.select().from(users).where(eq(users.email, "Admin@rkinstitute.com"));
    if (existing.length === 0) {
        await db.insert(users).values({
            id: crypto.randomUUID(),
            name: "Super Admin",
            email: "Admin@rkinstitute.com",
            role: "super-admin",
            isVerified: true,
            // password can be set to a default or empty if using external auth; here placeholder
            password: "admin123",
        });
        console.log("Superadmin user created.");
    } else {
        console.log("Superadmin user already exists.");
    }
}

ensureSuperAdmin().catch(err => {
    console.error("Error ensuring superadmin:", err);
    process.exit(1);
});
