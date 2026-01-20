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
    debug: true,
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
                console.log("[AUTH] Authorize start", { identifier: credentials?.identifier });
                // Check if credentials login is enabled
                const settings = await getAuthSettingsInternal();
                if (!settings.credentialsEnabled) {
                    console.log("[AUTH] Credentials disabled by settings");
                    throw new Error("Email/password login is currently disabled");
                }

                if (!credentials?.identifier || !credentials?.password) {
                    console.log("[AUTH] Missing credentials");
                    throw new Error("Missing credentials");
                }

                const identifier = (credentials.identifier as string).trim();
                const isPhone = /^\d{10}$/.test(identifier);

                let user;

                if (isPhone) {
                    // Phone login - look up by phone
                    [user] = await db
                        .select()
                        .from(users)
                        .where(eq(users.phone, identifier))
                        .limit(1);
                } else {
                    // Email login
                    [user] = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, identifier.toLowerCase()))
                        .limit(1);
                }

                if (!user || !user.password) {
                    console.log("[AUTH] User not found or no password", { email: identifier });
                    throw new Error("Invalid credentials");
                }

                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValidPassword) {
                    console.log("[AUTH] Invalid password for user", { email: identifier });
                    throw new Error("Invalid credentials");
                }

                console.log("[AUTH] Authorize success", { id: user.id, email: user.email, role: user.role });
                return {
                    id: String(user.id),
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
            console.log("[AUTH] SignIn callback", { provider: account?.provider, email: user.email });
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
                console.log("[AUTH] JWT callback (initial login)", { email: user.email, role: user.role });
                token.id = user.id;
                token.role = user.role;
                token.isVerified = user.isVerified;
            }

            if (trigger === "update" && session) {
                console.log("[AUTH] JWT callback (manual update)", { newRole: session.user?.role });
                return { ...token, ...session.user };
            }

            return token;
        },
        async session({ session, token }) {
            console.log("[AUTH] Session callback", { tokenRole: token?.role });
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
