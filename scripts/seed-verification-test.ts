import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seedTestData() {
    console.log('Preparing test environment...');

    try {
        // 1. Clean up existing test users if they exist
        await sql`DELETE FROM "user" WHERE email IN ('neonerddeveloper@gmail.com', 'sonu5cool12@gmail.com')`;

        // 2. Add a staff record for matching test
        // Let's use 'sonu5cool12@gmail.com' as the staff email for auto-match test
        const [existingStaff] = await sql`SELECT * FROM staff WHERE email = 'sonu5cool12@gmail.com'`;

        if (!existingStaff) {
            await sql`
                INSERT INTO staff (name, phone, email, role, base_salary, is_active, created_at, updated_at)
                VALUES ('Test Staff', '9876543210', 'sonu5cool12@gmail.com', 'ADMIN', 25000, true, NOW(), NOW())
            `;
            console.log('✅ Seeded staff record for auto-matching test.');
        } else {
            console.log('ℹ️ Staff record for auto-matching already exists.');
        }

        console.log('\n--- Test Readiness ---');
        console.log('1. neonerddeveloper@gmail.com -> Should be PENDING (if signed in)');
        console.log('2. sonu5cool12@gmail.com -> Should be AUTO-VERIFIED (matches staff)');
        console.log('----------------------\n');

    } catch (err) {
        console.error('Error seeding test data:', err);
    }
}

seedTestData();
