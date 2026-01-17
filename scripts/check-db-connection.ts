
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL not set");
        process.exit(1);
    }
    try {
        console.log("Attempting to connect to database...");
        const sql = neon(process.env.DATABASE_URL);
        const result = await sql`SELECT 1 as val`;
        console.log("Database connection successful:", result);
    } catch (e) {
        console.error("Database connection failed:", e);
        process.exit(1);
    }
}

main();
