import NextAuth, { type DefaultSession } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens, staff } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthSettingsInternal, isDomainAllowed } from "@/lib/auth-settings-helper";

declare module "next-auth" {
    interface Session {
        user: {
            role: string;
            isVerified: boolean;
        } & DefaultSession["user"]
    }

    interface User {
        role?: string;
        isVerified?: boolean;
    }
}

import { type JWT } from "next-auth/jwt";
declare module "next-auth/jwt" {
    interface JWT {
        role?: string;
        isVerified?: boolean;
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    debug: process.env.NODE_ENV === "development",
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
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Check if credentials login is enabled
                const settings = await getAuthSettingsInternal();
                if (!settings.credentialsEnabled) {
                    throw new Error("Email/password login is currently disabled");
                }

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, credentials.email as string))
                    .limit(1);

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValidPassword) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isVerified: user.isVerified,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
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
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isVerified = user.isVerified;
            } else if (token.email) {
                // Fetch fresh data from DB to ensure session stays in sync with admin changes
                const [dbUser] = await db
                    .select({
                        role: users.role,
                        isVerified: users.isVerified,
                    })
                    .from(users)
                    .where(eq(users.email, token.email))
                    .limit(1);

                if (dbUser) {
                    token.role = dbUser.role;
                    token.isVerified = dbUser.isVerified;
                }
            }

            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.isVerified = token.isVerified as boolean;
            }

            // Optional: Fetch fresh data from DB if needed for critical security
            // But JWT strategy usually relies on token for performance

            return session;
        },
    },
});
