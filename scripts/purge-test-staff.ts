import { db } from "../src/db";
import { staff } from "../src/db/schema";
import { like, or } from "drizzle-orm";

async function purge() {
    console.log("Purging test personnel...");
    try {
        const deleted = await db.delete(staff)
            .where(
                or(
                    like(staff.name, "Test_%"),
                    like(staff.name, "TestStaff_%")
                )
            )
            .returning();
        console.log(`Purged ${deleted.length} nodes successfully.`);
    } catch (err) {
        console.error("Purge failed:", err);
    }
}

purge();
