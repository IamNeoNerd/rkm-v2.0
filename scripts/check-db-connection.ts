
import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

if (typeof window === 'undefined') {
    neonConfig.webSocketConstructor = ws;
}

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL not set");
        process.exit(1);
    }
    try {
        console.log("Attempting to connect to database using Pool (WebSockets)...");
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const start = Date.now();
        const { rows } = await pool.query('SELECT current_database(), current_user, version()');
        const end = Date.now();
        console.log("Database connection successful!");
        console.log("Database:", rows[0].current_database);
        console.log("User:", rows[0].current_user);
        console.log("Version:", rows[0].version);
        console.log(`Latency: ${end - start}ms`);
        await pool.end();
    } catch (e) {
        console.error("Database connection failed:", e);
        process.exit(1);
    }
}

main();
