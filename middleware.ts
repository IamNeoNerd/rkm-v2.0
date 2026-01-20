import { auth } from "@/auth";
import { NextResponse } from "next/server";

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

    if (!isVerified && pathname !== "/verify") {
        return NextResponse.redirect(new URL("/verify", nextUrl));
    }

    // Role-based route protection
    if (pathname.startsWith("/teacher") && role !== "teacher" && role !== "super-admin") {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    if (pathname.startsWith("/cashier") && role !== "cashier" && role !== "super-admin" && role !== "admin") {
        return NextResponse.redirect(new URL("/", nextUrl));
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
