import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const CONCURRENT_USERS = 50; // We'll start with 50 and ramp up
const DURATION_SECONDS = 30;

async function simulateUser(userId: number) {
    console.log(`User ${userId} started session...`);
    const start = Date.now();
    let requests = 0;

    // Note: Since we have middleware, we'd normally need a valid session cookie.
    // For this test, we can either:
    // 1. Bypass middleware for a specific test route
    // 2. Use a hardcoded session cookie
    // 3. Just test the DB performance directly via a script (different kind of load test)

    // We'll simulate DB load directly to test Neon connection pooling.
}

// Direct DB Load Test
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function dbLoadTest() {
    console.log(`Starting DB Load Test with ${CONCURRENT_USERS} concurrent workers...`);
    const start = Date.now();
    let totalQueries = 0;

    const workers = Array.from({ length: CONCURRENT_USERS }).map(async (_, idx) => {
        const workerStart = Date.now();
        while (Date.now() - workerStart < DURATION_SECONDS * 1000) {
            try {
                // Simulate a typical dashboard query
                await sql`SELECT * FROM students LIMIT 10`;
                await sql`SELECT * FROM families LIMIT 5`;
                totalQueries += 2;
            } catch (err) {
                console.error(`Worker ${idx} error:`, err);
            }
        }
    });

    await Promise.all(workers);
    const end = Date.now();
    const duration = (end - start) / 1000;

    console.log('\n--- Load Test Results ---');
    console.log(`Duration: ${duration}s`);
    console.log(`Total Queries: ${totalQueries}`);
    console.log(`Queries/sec: ${(totalQueries / duration).toFixed(2)}`);
    console.log(`Concurrency: ${CONCURRENT_USERS}`);
    console.log('-------------------------\n');
}

dbLoadTest();
