import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// Use environment variable if available, otherwise fallback to the production rkm database URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2FRPjmsCa6kI@ep-patient-bird-ah9hhxtl-pooler.c-3.us-east-1.aws.neon.tech/rkm?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

async function createAdminUser() {
    console.log('Creating admin user in PRODUCTION database...\n');

    try {
        const email = 'admin@rkinstitute.com';
        const password = 'admin123';
        const name = 'Admin User';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = randomUUID();

        // Check if user already exists
        const existingUsers = await sql`SELECT * FROM "user" WHERE email = ${email}`;

        if (existingUsers.length > 0) {
            console.log('ℹ️ Admin user already exists. Updating password and role...');
            await sql`
                UPDATE "user" 
                SET 
                    password = ${hashedPassword},
                    role = 'super-admin',
                    is_verified = true,
                    updated_at = NOW()
                WHERE email = ${email}
            `;
            console.log('✅ Password and role updated successfully.');
        } else {
            // Create admin user
            await sql`
                INSERT INTO "user" (id, name, email, password, role, is_verified, created_at, updated_at)
                VALUES (
                    ${userId},
                    ${name},
                    ${email},
                    ${hashedPassword},
                    'super-admin',
                    true,
                    NOW(),
                    NOW()
                )
            `;
            console.log('✅ Admin user created successfully!');
        }

        console.log('\nLogin credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

        // Verify the user was created/updated
        const [verifyUser] = await sql`
            SELECT id, email, role, is_verified 
            FROM "user" 
            WHERE email = ${email}
        `;

        console.log('✅ Verification:');
        console.log(`   User ID: ${verifyUser.id}`);
        console.log(`   Email: ${verifyUser.email}`);
        console.log(`   Role: ${verifyUser.role}`);
        console.log(`   Verified: ${verifyUser.is_verified}`);

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
