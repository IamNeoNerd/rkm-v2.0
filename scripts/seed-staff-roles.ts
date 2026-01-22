import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../src/db";
import { staffRoleTypes } from "../src/db/schema";
import { eq } from "drizzle-orm";

const roles = [
    { name: "Security", description: "Security Guard / Watchman" },
    { name: "Driver", description: "Vehicle Operator" },
    { name: "Cleaner", description: "Maintenance / Cleaning Staff" },
    { name: "Peon", description: "Office Assistant / Peon" },
    { name: "MTS", description: "Multi Tasking Staff" },
    { name: "Cook", description: "Canteen / Kitchen Staff" },
    { name: "Gardener", description: "Horticulture Maintenance" }
];

async function seed() {
    console.log("Seeding staff role types...");
    for (const role of roles) {
        const existing = await db.query.staffRoleTypes.findFirst({
            where: eq(staffRoleTypes.name, role.name)
        });
        if (!existing) {
            await db.insert(staffRoleTypes).values(role);
            console.log(`Added: ${role.name}`);
        } else {
            console.log(`Skipped (exists): ${role.name}`);
        }
    }
    console.log("Seeding complete.");
}

seed();
