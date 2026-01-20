import { auth } from "@/auth";

/**
 * Custom error for authorization failures
 */
export class AuthorizationError extends Error {
    code: string;
    constructor(message: string, code: string = "UNAUTHORIZED") {
        super(message);
        this.name = "AuthorizationError";
        this.code = code;
    }
}

/**
 * Valid roles in the system
 */
export type UserRole = "super-admin" | "admin" | "teacher" | "cashier" | "parent" | "user";

/**
 * Get the current session or throw if not authenticated
 */
export async function requireAuth() {
    const session = await auth();

    if (!session?.user) {
        throw new AuthorizationError("You must be logged in to access this resource", "NOT_AUTHENTICATED");
    }

    if (!session.user.isVerified) {
        throw new AuthorizationError("Your account is pending verification", "NOT_VERIFIED");
    }

    return session;
}

/**
 * Require the user to have one of the specified roles
 */
export async function requireRole(allowedRoles: UserRole[]) {
    const session = await requireAuth();

    const userRole = session.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
        throw new AuthorizationError(
            `Access denied. Required role: ${allowedRoles.join(" or ")}`,
            "FORBIDDEN"
        );
    }

    return session;
}

/**
 * Helper to wrap server actions with authorization
 * Returns a standardized error response instead of throwing
 */
export async function withAuth<T>(
    allowedRoles: UserRole[] | null,
    action: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string; code: string }> {
    try {
        if (allowedRoles) {
            await requireRole(allowedRoles);
        } else {
            await requireAuth();
        }

        const result = await action();
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message, code: error.code };
        }
        console.error("Action error:", error);
        return { success: false, error: "An unexpected error occurred", code: "INTERNAL_ERROR" };
    }
}
