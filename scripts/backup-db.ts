
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { sql } from 'drizzle-orm';
import * as fs from 'fs';

async function backup() {
    // Import db dynamically to ensure env vars are loaded
    const { db } = await import('../src/db');

    const tables = [
        'user',
        'families',
        'students',
        'transactions',
        'staff',
        'batches',
        'enrollments',
        'attendance',
        'academic_sessions',
        'fee_structures',
        'system_settings'
    ];

    const backupDir = path.join(process.cwd(), 'db-backups', new Date().toISOString().replace(/[:.]/g, '-'));

    if (!fs.existsSync(path.join(process.cwd(), 'db-backups'))) {
        fs.mkdirSync(path.join(process.cwd(), 'db-backups'));
    }
    fs.mkdirSync(backupDir);

    console.log(`Starting backup to ${backupDir}...`);

    for (const table of tables) {
        try {
            const result = await db.execute(sql.raw(`SELECT * FROM "${table}"`));
            fs.writeFileSync(
                path.join(backupDir, `${table}.json`),
                JSON.stringify(result.rows, null, 2)
            );
            console.log(`[✓] Backed up ${table} (${result.rows.length} rows)`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[✗] Failed to backup ${table}:`, errorMessage);
        }
    }

    console.log('Backup complete.');
    process.exit();
}

backup();
