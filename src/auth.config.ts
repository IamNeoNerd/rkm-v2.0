/**
 * Edge-Compatible Auth Configuration
 * 
 * This file contains the base authentication configuration that can be safely
 * used in Edge environments (like middleware). It excludes:
 * - Database adapters
 * - bcrypt/crypto operations
 * - Any Node.js-only modules
 */

import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    debug: false,
    trustHost: true,
    providers: [
        Google({
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
        // Note: Credentials provider is configured here but the actual
        // authorization logic is in auth.ts which uses bcrypt
        Credentials({
            name: "credentials",
            credentials: {
                identifier: { label: "Email or Phone", type: "text" },
                password: { label: "Password", type: "password" },
            },
            // Placeholder - actual authorization is done in auth.ts
            authorize: async () => null,
        }),
    ],
    callbacks: {
        // JWT callback to persist user data in token
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isVerified = user.isVerified;
                token.permissions = user.permissions;
            }
            return token;
        },
        // Session callback to expose user data to client
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.isVerified = token.isVerified as boolean;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                session.user.permissions = token.permissions as any;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;

