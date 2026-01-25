import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env') });

import { db } from "../src/db";
import { users, students } from "../src/db/schema";
import { desc, eq } from "drizzle-orm";

async function main() {
    console.log("--- STUDENT AUTH DIAGNOSTIC START ---");
    try {
        console.log("Fetching latest 3 students...");
        const latestStudents = await db.select().from(students).orderBy(desc(students.id)).limit(3);
        console.log(JSON.stringify(latestStudents, null, 2));

        if (latestStudents.length > 0) {
            const sid = latestStudents[0].studentId;
            console.log(`Analyzing Student ID: "${sid}"`);
            console.log(`Length: ${sid?.length}`);
            console.log(`Is 6 digits? : ${/^\d{6}$/.test(sid || "")}`);

            const userId = latestStudents[0].userId;
            console.log(`Linked User ID: ${userId}`);

            if (userId) {
                const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
                console.log("User Record for Student:");
                console.log(JSON.stringify({
                    id: userRecord?.id,
                    email: userRecord?.email,
                    role: userRecord?.role,
                    hasPassword: !!userRecord?.password,
                    passwordStart: userRecord?.password?.substring(0, 10)
                }, null, 2));
            }
        }

    } catch (error) {
        console.error("DIAGNOSTIC_FAILURE:", error);
    } finally {
        process.exit(0);
    }
}

main();
