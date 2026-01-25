
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { sql } from 'drizzle-orm';

async function applyMigrations() {
    const { db } = await import('../src/db');

    const statements = [
        `ALTER TYPE "public"."user_role" ADD VALUE 'student' BEFORE 'user'`,
        `ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL`,
        `ALTER TABLE "families" ADD COLUMN "user_id" text`,
        `ALTER TABLE "students" ADD COLUMN "user_id" text`,
        `ALTER TABLE "students" ADD COLUMN "student_id" text`,
        `ALTER TABLE "transactions" ADD COLUMN "student_id" integer`,
        `ALTER TABLE "families" ADD CONSTRAINT "families_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action`,
        `ALTER TABLE "students" ADD CONSTRAINT "students_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action`,
        `ALTER TABLE "transactions" ADD CONSTRAINT "transactions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action`,
        `ALTER TABLE "students" ADD CONSTRAINT "students_student_id_unique" UNIQUE("student_id")`
    ];

    console.log('Applying database changes...');

    for (const stmt of statements) {
        try {
            console.log(`Executing: ${stmt}...`);
            await db.execute(sql.raw(stmt));
            console.log(`[✓] Success`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Handle cases where some might already exist if we retry
            if (errorMessage.includes('already exists') || errorMessage.includes('already a value')) {
                console.warn(`[!] Skipping: ${errorMessage}`);
            } else {
                console.error(`[✗] Failed: ${errorMessage}`);
                // Optional: stop on critical error?
            }
        }
    }

    console.log('Database changes applied.');
    process.exit();
}

applyMigrations();
