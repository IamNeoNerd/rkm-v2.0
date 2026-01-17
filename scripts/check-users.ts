import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function checkUsers() {
    try {
        const users = await sql`SELECT id, name, email, role, is_verified as "isVerified" FROM "user"`;
        console.log('--- Current Users ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('---------------------');
    } catch (err) {
        console.error('Error fetching users:', err);
    }
}

checkUsers();
