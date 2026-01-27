import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from "./schema";

// Configure WebSocket for Node.js environments
if (typeof globalThis.WebSocket === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    neonConfig.webSocketConstructor = require('ws');
}

let dbInstance: NeonDatabase<typeof schema> | null = null;
let poolInstance: Pool | null = null;

export const db = new Proxy({} as NeonDatabase<typeof schema>, {
    get(target, prop) {
        if (!dbInstance) {
            const url = process.env.DATABASE_URL;
            if (!url) {
                console.error('--- CRITICAL: DATABASE_URL is not configured ---');
            }
            // Use Pool for WebSocket connection - supports transactions
            poolInstance = new Pool({ connectionString: url || "" });
            dbInstance = drizzle(poolInstance, { schema });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (dbInstance as any)[prop];
    }
});

// Export pool for cleanup if needed
export const getPool = () => poolInstance;
