import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

let dbInstance: NeonHttpDatabase<typeof schema> | null = null;

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
    get(target, prop) {
        if (!dbInstance) {
            const url = process.env.DATABASE_URL;
            if (!url) {
                console.error('--- CRITICAL: DATABASE_URL is not configured ---');
            }
            const sql = neon(url || "");
            dbInstance = drizzle(sql, { schema });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (dbInstance as any)[prop];
    }
});
