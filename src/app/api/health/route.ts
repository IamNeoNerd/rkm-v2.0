import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    const startTime = Date.now();

    try {
        // Check database connection
        const dbCheck = await db.execute(sql`SELECT 1 as health`);
        const dbHealthy = dbCheck.rows.length > 0;

        const responseTime = Date.now() - startTime;

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '0.1.0',
            checks: {
                database: dbHealthy ? 'connected' : 'disconnected',
                responseTime: `${responseTime}ms`,
            },
            uptime: process.uptime(),
        }, { status: 200 });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: 'error',
                responseTime: `${responseTime}ms`,
            },
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 503 });
    }
}
