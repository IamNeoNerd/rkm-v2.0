import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { type FeatureKey } from "@/lib/permissions";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const pathname = nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = [
        "/login",
        "/verify",
        "/browse",
        "/api/auth",
        "/parent", // Public parent portal with phone lookup
    ];

    // Check if current path starts with any public route
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith("/api/auth")
    );

    // Allow public routes without authentication
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Redirect to login if not authenticated
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Check verification status for protected routes
    const isVerified = req.auth?.user?.isVerified;
    const role = req.auth?.user?.role;
    const permissions = req.auth?.user?.permissions;

    if (!isVerified && pathname !== "/verify") {
        return NextResponse.redirect(new URL("/verify", nextUrl));
    }

    // Dynamic Role-based route protection (RBAC)
    if (role !== "super-admin") {
        // Feature to Route mapping
        const featureRoutes: { prefix: string; feature: string }[] = [
            { prefix: "/teacher", feature: "attendance" }, // Teachers primarily use attendance
            { prefix: "/cashier", feature: "fees" },    // Cashiers use fees
            { prefix: "/staff", feature: "staff" },
            { prefix: "/students", feature: "students" },
            { prefix: "/families", feature: "families" },
            { prefix: "/fees", feature: "fees" },
            { prefix: "/academics", feature: "academics" },
            { prefix: "/attendance", feature: "attendance" },
            { prefix: "/reports", feature: "reports" },
            { prefix: "/settings", feature: "settings" },
            { prefix: "/admission", feature: "admissions" },
        ];

        // Find match for current path
        const match = featureRoutes.find(fr => pathname.startsWith(fr.prefix));

        if (match) {
            const hasAccess = permissions?.[match.feature as FeatureKey]?.canView;
            if (!hasAccess) {
                console.warn(`[MIDDLEWARE] Access denied for role ${role} to ${pathname} (Feature: ${match.feature})`);
                return NextResponse.redirect(new URL("/", nextUrl));
            }
        }

        // Special restriction for RBAC matrix (Super-admin only)
        if (pathname.startsWith("/settings/permissions")) {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes that don't need auth (already handled above)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.webp$).*)",
    ],
};
