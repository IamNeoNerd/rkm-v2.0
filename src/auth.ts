import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, staff, students, families } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthSettingsInternal, isDomainAllowed } from "@/lib/auth-settings-helper";
import { getAllPermissionsForRole, type FeatureKey, type PermissionCheck } from "@/lib/permissions";
import { logger } from "@/lib/logger";

declare module "next-auth" {
    interface Session {
        user: {
            role: string;
            isVerified: boolean;
            permissions: Record<FeatureKey, PermissionCheck>;
        } & DefaultSession["user"]
    }

    interface User {
        role?: string;
        isVerified?: boolean;
        permissions?: Record<FeatureKey, PermissionCheck>;
    }
}

import "next-auth/jwt";
declare module "next-auth/jwt" {
    interface JWT {
        role?: string;
        isVerified?: boolean;
        permissions?: Record<FeatureKey, PermissionCheck>;
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    // adapter: DrizzleAdapter(db, {
    //     usersTable: users,
    //     accountsTable: accounts,
    //     sessionsTable: sessions,
    //     verificationTokensTable: verificationTokens,
    // }),
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    debug: false,
    trustHost: true,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "select_account",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                identifier: { label: "Email or Phone", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const identifier = (credentials?.identifier as string || "").trim();
                logger.debug('auth.authorize.start', { identifier });

                try {
                    // Check if credentials login is enabled
                    const settings = await getAuthSettingsInternal();
                    if (!settings.credentialsEnabled) {
                        console.error("[AUTH] FAIL: Credentials status is OFFLINE in system_settings");
                        throw new Error("Email/password login is currently disabled by system protocol");
                    }

                    if (!credentials?.identifier || !credentials?.password) {
                        throw new Error("Missing tactical credentials");
                    }

                    const isPhone = /^\d{10}$/.test(identifier);
                    const isStudentId = /^\d{6}$/.test(identifier);

                    let user;

                    if (isStudentId) {
                        logger.debug('auth.mapping', { type: 'STUDENT_ID', identifier });
                        const [studentResult] = await db
                            .select({
                                id: users.id,
                                email: users.email,
                                name: users.name,
                                password: users.password,
                                role: users.role,
                                isVerified: users.isVerified,
                            })
                            .from(students)
                            .innerJoin(users, eq(students.userId, users.id))
                            .where(eq(students.studentId, identifier))
                            .limit(1);

                        user = studentResult;
                    } else if (isPhone) {
                        logger.debug('auth.mapping', { type: 'PHONE', identifier });
                        [user] = await db
                            .select()
                            .from(users)
                            .where(eq(users.phone, identifier))
                            .limit(1);

                        if (!user) {
                            logger.debug('auth.mapping', { type: 'FAMILY_FALLBACK', identifier });
                            const [parentResult] = await db
                                .select({
                                    id: users.id,
                                    email: users.email,
                                    name: users.name,
                                    password: users.password,
                                    role: users.role,
                                    isVerified: users.isVerified,
                                })
                                .from(families)
                                .innerJoin(users, eq(families.userId, users.id))
                                .where(eq(families.phone, identifier))
                                .limit(1);

                            user = parentResult;
                        }
                    } else {
                        logger.debug('auth.mapping', { type: 'EMAIL', identifier });
                        [user] = await db
                            .select()
                            .from(users)
                            .where(eq(users.email, identifier.toLowerCase()))
                            .limit(1);
                    }

                    if (!user || !user.password) {
                        console.warn(`[AUTH] FAIL: Identity mapping rejected // Node: ${identifier}`);
                        throw new Error("Invalid credentials");
                    }

                    const isValidPassword = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    if (!isValidPassword) {
                        console.warn(`[AUTH] FAIL: Credential verification failed // Node: ${identifier}`);
                        throw new Error("Invalid credentials");
                    }

                    // Check verification for admin roles
                    if ((user.role === 'admin' || user.role === 'super-admin') && !user.isVerified) {
                        console.warn(`[AUTH] FAIL: Security verification pending // Account: ${user.email}`);
                        throw new Error("Account not verified. Please contact super-admin.");
                    }

                    logger.debug('auth.success', { identifier, role: user.role });

                    // Fetch granular permissions
                    const permissions = await getAllPermissionsForRole(user.role);

                    return {
                        id: String(user.id),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        isVerified: user.isVerified,
                        permissions,
                    };
                } catch (error) {
                    console.error("[AUTH] CRITICAL_SYSTEM_ERROR:", error);
                    // Pass the error message to the client
                    if (error instanceof Error) throw error;
                    throw new Error("System synchronization failure");
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            logger.debug('auth.signIn', { provider: account?.provider, email: user.email });
            // Check provider-specific settings
            if (account?.provider === "google") {
                const settings = await getAuthSettingsInternal();

                // Check if Google login is enabled
                if (!settings.googleEnabled) {
                    console.warn(`Google login attempt blocked: Google auth is disabled`);
                    return false; // Block login
                }

                // Check domain restrictions
                if (user.email && settings.googleDomains.length > 0) {
                    const allowed = await isDomainAllowed(user.email);
                    if (!allowed) {
                        console.warn(`Domain rejected for email: ${user.email}`);
                        return false; // Block login from non-allowed domain
                    }
                }

                // Auto-verify staff matching
                if (user.email && settings.autoVerifyStaff) {
                    const [staffRecord] = await db
                        .select()
                        .from(staff)
                        .where(eq(staff.email, user.email))
                        .limit(1);

                    if (staffRecord) {
                        // Update user role and verification status automatically
                        await db.update(users)
                            .set({
                                role: staffRecord.role.toLowerCase() === 'admin' ? 'admin' : 'user',
                                isVerified: true
                            })
                            .where(eq(users.email, user.email));
                    }
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            // Log only on significant events to keep logs clean
            if (user) {
                logger.debug('auth.jwt.login', { email: user.email, role: user.role });
                token.id = user.id;
                token.role = user.role;
                token.isVerified = user.isVerified;
                token.permissions = user.permissions;
            }

            if (trigger === "update" && session) {
                logger.debug('auth.jwt.update', { newRole: session.user?.role });
                return { ...token, ...session.user };
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.isVerified = token.isVerified as boolean;
                session.user.permissions = token.permissions as Record<FeatureKey, PermissionCheck>;
            }

            // Optional: Fetch fresh data from DB if needed for critical security
            // But JWT strategy usually relies on token for performance

            return session;
        },
    },
});
