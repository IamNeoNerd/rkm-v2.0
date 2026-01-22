import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../src/db";
import { staff, staffRoleTypes, users } from "../src/db/schema";

async function debug() {
    console.log("--- STAFF ROLE TYPES ---");
    const roleTypes = await db.select().from(staffRoleTypes);
    console.log(JSON.stringify(roleTypes, null, 2));

    console.log("\n--- USERS ---");
    const allUsers = await db.select().from(users);
    console.log(JSON.stringify(allUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role
    })), null, 2));

    console.log("\n--- STAFF MEMBERS ---");
    const allStaff = await db.select().from(staff);
    console.log(JSON.stringify(allStaff.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        roleType: s.roleType,
        phone: s.phone,
        email: s.email
    })), null, 2));
}

debug();
