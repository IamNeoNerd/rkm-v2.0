
import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env') });

import { db } from "../src/db";
import { users, students } from "../src/db/schema";
import { eq, isNotNull } from "drizzle-orm";

async function main() {
    console.log("--- FIND LINKED STUDENTS ---");
    try {
        const linkedPlayers = await db.select({
            studentName: students.name,
            studentId: students.studentId,
            userId: students.userId,
            userEmail: users.email,
            userRole: users.role,
            hasPassword: isNotNull(users.password)
        })
            .from(students)
            .innerJoin(users, eq(students.userId, users.id))
            .where(isNotNull(students.studentId));

        console.log(`Found ${linkedPlayers.length} linked students:`);
        console.log(JSON.stringify(linkedPlayers, null, 2));

    } catch (error) {
        console.error("DIAGNOSTIC_FAILURE:", error);
    } finally {
        process.exit(0);
    }
}

main();
