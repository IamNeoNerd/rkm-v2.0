import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function addAuthTables() {
    console.log('Adding authentication tables for NextAuth.js...\n');

    try {
        // Create users table
        console.log('1. Creating users table...');
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT NOT NULL UNIQUE,
                email_verified TIMESTAMP,
                image TEXT,
                password TEXT,
                role TEXT NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        console.log('   ✓ Users table created\n');

        // Create accounts table
        console.log('2. Creating accounts table...');
        await sql`
            CREATE TABLE IF NOT EXISTS accounts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                provider TEXT NOT NULL,
                provider_account_id TEXT NOT NULL,
                refresh_token TEXT,
                access_token TEXT,
                expires_at INTEGER,
                token_type TEXT,
                scope TEXT,
                id_token TEXT,
                session_state TEXT
            )
        `;
        console.log('   ✓ Accounts table created\n');

        // Create sessions table
        console.log('3. Creating sessions table...');
        await sql`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                session_token TEXT NOT NULL UNIQUE,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires TIMESTAMP NOT NULL
            )
        `;
        console.log('   ✓ Sessions table created\n');

        // Create verification tokens table
        console.log('4. Creating verification_tokens table...');
        await sql`
            CREATE TABLE IF NOT EXISTS verification_tokens (
                identifier TEXT NOT NULL,
                token TEXT NOT NULL UNIQUE,
                expires TIMESTAMP NOT NULL
            )
        `;
        console.log('   ✓ Verification tokens table created\n');

        // Create indexes for performance
        console.log('5. Creating indexes...');
        await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token)`;
        console.log('   ✓ Indexes created\n');

        console.log('✅ All authentication tables added successfully!\n');

    } catch (error) {
        console.error('❌ Error adding auth tables:', error);
        process.exit(1);
    }
}

addAuthTables();
