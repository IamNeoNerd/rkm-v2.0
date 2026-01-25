import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        // Test database connection
        const allUsers = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            isVerified: users.isVerified,
            hasPassword: users.password
        }).from(users);

        // Test specific user
        const [testUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, 'test@rkinstitute.com'))
            .limit(1);

        let passwordTest = null;
        if (testUser && testUser.password) {
            const isValid = await bcrypt.compare('admin123', testUser.password);
            passwordTest = {
                email: testUser.email,
                passwordExists: !!testUser.password,
                passwordValid: isValid,
                passwordHash: testUser.password?.substring(0, 20) + '...'
            };
        }

        return NextResponse.json({
            success: true,
            databaseUrl: process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@'),
            userCount: allUsers.length,
            users: allUsers.map((u: any) => ({
                email: u.email,
                name: u.name,
                role: u.role,
                isVerified: u.isVerified,
                hasPassword: !!u.hasPassword
            })),
            testUser: passwordTest
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
