import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local if it exists (this is what Next.js uses)
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            if (!process.env[key.trim()]) {
                process.env[key.trim()] = value;
            }
        }
    });
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ No DATABASE_URL found in environment!');
    process.exit(1);
}

console.log('Using DATABASE_URL from environment (masked):', DATABASE_URL.replace(/:[^:]*@/, ':***@'));

const sql = neon(DATABASE_URL);

async function createAdminUser() {
    console.log('\nCreating admin user in LOCAL DEV database...\n');

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
