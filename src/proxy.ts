import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;
    const isVerified = (req.auth?.user as { isVerified?: boolean })?.isVerified;
    const { pathname } = req.nextUrl;

    const isOnLoginPage = pathname.startsWith("/login");
    const isOnRegisterPage = pathname.startsWith("/register");
    const isOnVerifyPage = pathname.startsWith("/verify");
    const isSuperAdminRoute = pathname.startsWith("/settings") || pathname.startsWith("/users");

    // Allow static files and API routes (though matcher should handle this)
    if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
        return NextResponse.next();
    }

    // If not logged in and trying to access protected routes, redirect to login
    if (!isLoggedIn && !isOnLoginPage && !isOnRegisterPage && !isOnVerifyPage) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If logged in and on login/register page, redirect to dashboard
    if (isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
        return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }

    // If logged in but NOT verified, force redirect to /verify (unless already there)
    // We use !== true to handle false and undefined
    if (isLoggedIn && isVerified !== true && !isOnVerifyPage) {
        return NextResponse.redirect(new URL("/verify", req.nextUrl.origin));
    }

    // If logged in AND verified, but trying to access /verify, go to dashboard
    if (isLoggedIn && isVerified === true && isOnVerifyPage) {
        return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }

    // Role-based access control
    if (isLoggedIn && isSuperAdminRoute && userRole !== "super-admin") {
        // Redirect regular admins away from super-admin routes
        return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
