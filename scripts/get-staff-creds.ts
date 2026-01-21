import "dotenv/config";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { or, eq } from "drizzle-orm";

async function getStaffCredentials() {
    try {
        const staffUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                isVerified: users.isVerified,
            })
            .from(users)
            .where(
                or(
                    eq(users.role, "teacher"),
                    eq(users.role, "cashier"),
                    eq(users.role, "admin"),
                    eq(users.role, "super-admin")
                )
            );

        console.log("=== STAFF CREDENTIALS ===");
        console.log(JSON.stringify(staffUsers, null, 2));
        console.log("\nNote: Passwords are hashed in the database.");
        console.log("For testing, check your seed file or create test credentials.");

        process.exit(0);
    } catch (error) {
        console.error("Error fetching staff credentials:", error);
        process.exit(1);
    }
}

getStaffCredentials();
