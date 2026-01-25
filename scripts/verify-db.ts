
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { sql } from 'drizzle-orm';

async function verify() {
    const { db } = await import('../src/db');

    const tables = ['students', 'transactions', 'families', 'user'];

    for (const table of tables) {
        try {
            const result = await db.execute(sql.raw(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
                ORDER BY column_name
            `));
            console.log(`\nColumns in ${table}:`);
            interface ColumnRow {
                column_name: string;
                data_type: string;
            }
            (result.rows as unknown as ColumnRow[]).forEach((row) => {
                console.log(` - ${row.column_name} (${row.data_type})`);
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Failed to check ${table}:`, errorMessage);
        }
    }
    process.exit();
}

verify();
