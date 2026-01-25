
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from 'dotenv';
import path from 'path';

// Load .env explicitly
config({ path: path.resolve(process.cwd(), '.env') });

async function verify() {
    console.log("--- FINAL CONNECTION DIAGNOSTIC ---");
    const rawUrl = process.env.DATABASE_URL;
    console.log(`Initial ENV DATABASE_URL: ${rawUrl ? rawUrl.replace(/:[^@]+@/, ':****@') : 'UNDEFINED'}`);

    // Re-load with override
    const result = config({ path: path.resolve(process.cwd(), '.env'), override: true });
    if (result.error) {
        console.error("Dotenv Load Error:", result.error);
    }

    const url = process.env.DATABASE_URL;
    console.log(`Post-Dotenv DATABASE_URL: ${url ? url.replace(/:[^@]+@/, ':****@') : 'UNDEFINED'}`);

    if (!url) {
        console.error("FAIL: DATABASE_URL not found in environment.");
        process.exit(1);
    }

    console.log(`Node Environment: ${process.env.NODE_ENV}`);
    console.log(`Target Hostname: ${url.split('@')[1]?.split('/')[0]}`);

    if (url.includes('api.')) {
        console.error("FAIL: The string still contains 'api.'. Please check your .env file again.");
    } else {
        console.log("PASS: Hostname format looks correct (ep-).");
    }

    try {
        console.log("Connecting via HTTPS...");
        const sql = neon(url);
        const db = drizzle(sql);

        // Simple query
        const result = await sql`SELECT 1 as connection_test`;
        console.log("SUCCESS: Database connection established!", result);
    } catch (err) {
        console.error("CRITICAL_CONNECTION_FAILURE:");
        console.error(err);
    } finally {
        console.log("--- DIAGNOSTIC END ---");
        process.exit(0);
    }
}

verify();
