import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

let dbInstance: any = null;

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (!dbInstance) {
            const url = process.env.DATABASE_URL;
            if (!url) {
                console.error('--- CRITICAL: DATABASE_URL is not configured ---');
            }
            const sql = neon(url || "");
            dbInstance = drizzle(sql, { schema });
        }
        return dbInstance[prop];
    }
});
