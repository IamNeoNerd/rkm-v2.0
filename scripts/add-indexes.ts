/**
 * Database Indexing Script
 * Run with: npx tsx scripts/add-indexes.ts
 * 
 * This script adds performance-critical indexes to the database.
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function addIndexes() {
    console.log('Creating performance indexes...\n');

    const indexes = [
        // Students - frequently queried by familyId and searched by name
        'CREATE INDEX IF NOT EXISTS idx_students_family_id ON students (family_id)',
        'CREATE INDEX IF NOT EXISTS idx_students_name ON students (name)',
        'CREATE INDEX IF NOT EXISTS idx_students_is_active ON students (is_active)',

        // Families - searched by phone and name
        'CREATE INDEX IF NOT EXISTS idx_families_phone ON families (phone)',
        'CREATE INDEX IF NOT EXISTS idx_families_father_name ON families (father_name)',

        // Staff - searched by email and phone
        'CREATE INDEX IF NOT EXISTS idx_staff_email ON staff (email)',
        'CREATE INDEX IF NOT EXISTS idx_staff_phone ON staff (phone)',
        'CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff (is_active)',

        // Transactions - frequently queried by familyId and date
        'CREATE INDEX IF NOT EXISTS idx_transactions_family_id ON transactions (family_id)',
        'CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type)',
        'CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON transactions (receipt_number)',

        // Enrollments - compound index for lookups
        'CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments (student_id)',
        'CREATE INDEX IF NOT EXISTS idx_enrollments_batch_id ON enrollments (batch_id)',
        'CREATE INDEX IF NOT EXISTS idx_enrollments_is_active ON enrollments (is_active)',

        // Batches - teacher lookup
        'CREATE INDEX IF NOT EXISTS idx_batches_teacher_id ON batches (teacher_id)',

        // Users - role and verification status
        'CREATE INDEX IF NOT EXISTS idx_users_role ON "user" (role)',
        'CREATE INDEX IF NOT EXISTS idx_users_is_verified ON "user" (is_verified)',
    ];

    for (const indexSql of indexes) {
        try {
            await sql(indexSql);
            const indexName = indexSql.match(/idx_\w+/)?.[0] || 'unknown';
            console.log(`✓ Created index: ${indexName}`);
        } catch (error) {
            console.log(`⚠ Error:`, (error as Error).message);
        }
    }

    console.log('\n✅ Index creation complete!');
}

addIndexes()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed to create indexes:', error);
        process.exit(1);
    });
