
import "dotenv/config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

async function verifyAdmin() {
    console.log("Forcing verification for admin...");

    // Update both potential cases to be sure
    await db.update(users)
        .set({ isVerified: true, role: 'super-admin' })
        .where(ilike(users.email, "admin@rkinstitute.com"));

    console.log("✅ Admin user verified and role set to super-admin.");
}

verifyAdmin().catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
});
