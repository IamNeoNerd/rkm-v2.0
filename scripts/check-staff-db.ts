import { db } from "../src/db";
import { staffRoleTypes, staff } from "../src/db/schema";

async function check() {
    try {
        const roles = await db.select().from(staffRoleTypes);
        console.log("Current Role Types:", JSON.stringify(roles, null, 2));

        const sampleStaff = await db.select().from(staff).limit(10);
        console.log("Sample Staff Data:", JSON.stringify(sampleStaff.map(s => ({
            id: s.id,
            name: s.name,
            role: s.role,
            roleType: s.roleType,
            authId: s.authUserId
        })), null, 2));
    } catch (err) {
        console.error("Check failed:", err);
    }
}

check();
