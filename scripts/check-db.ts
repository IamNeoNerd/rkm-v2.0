
import 'dotenv/config';
import { Client } from 'pg';

async function checkPg() {
    console.log("Checking PG Connection...");
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true
    });
    try {
        await client.connect();
        const res = await client.query('SELECT NOW()');
        console.log("Connected! Time:", res.rows[0]);
        await client.end();
    } catch (e) {
        console.error("PG Connection Error:", e);
    }
}

checkPg();
