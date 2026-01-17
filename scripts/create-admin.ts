import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function createAdminUser() {
    console.log('Creating admin user...\n');

    try {
        const email = 'admin@rkinstitute.com';
        const password = 'admin123'; // Change this in production!
        const name = 'Admin User';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = randomUUID();

        // Check if user already exists
        const [existingUser] = await sql`SELECT * FROM "user" WHERE email = ${email}`;

        if (existingUser) {
            console.log('ℹ️ Admin user already exists. Updating role to super-admin...');
            await sql`UPDATE "user" SET role = 'super-admin' WHERE email = ${email}`;
            console.log('✅ Role updated successfully.');
            return;
        }

        // Create admin user
        await sql`
            INSERT INTO "user" (id, name, email, password, role, created_at, updated_at)
            VALUES (
                ${userId},
                ${name},
                ${email},
                ${hashedPassword},
                'super-admin',
                NOW(),
                NOW()
            )
        `;

        console.log('✅ Admin user created successfully!\n');
        console.log('Login credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
