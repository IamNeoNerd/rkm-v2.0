/**
 * Rate Limiter for Server Actions
 * 
 * Simple in-memory rate limiter using a sliding window approach.
 * For production with multiple instances, use Redis-based rate limiting.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory storage for rate limit entries
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Cleanup every minute

export interface RateLimitConfig {
    /** Maximum requests allowed in the window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
}

/**
 * Default rate limit configurations for different action types
 */
export const RateLimitConfigs = {
    /** Login attempts - strict to prevent brute force */
    login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min

    /** Password-related actions */
    password: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour

    /** Payment processing */
    payment: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per minute

    /** General write operations */
    write: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 per minute

    /** Read operations (more lenient) */
    read: { maxRequests: 200, windowMs: 60 * 1000 }, // 200 per minute

    /** API endpoints */
    api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
} as const;

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number; // milliseconds until reset
    error?: string;
}

/**
 * Check if a request is rate limited
 * 
 * @param identifier - Unique identifier (userId, IP, email, etc.)
 * @param action - Action category for different limits
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
    identifier: string,
    action: keyof typeof RateLimitConfigs | 'custom',
    config?: RateLimitConfig
): RateLimitResult {
    const limitConfig = config || (action !== 'custom' ? RateLimitConfigs[action] : undefined);

    if (!limitConfig) {
        throw new Error(`No rate limit config for action: ${action}`);
    }

    const key = `${action}:${identifier}`;
    const now = Date.now();

    // Get or create entry
    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
        // Create new window
        entry = {
            count: 1,
            resetTime: now + limitConfig.windowMs,
        };
        rateLimitStore.set(key, entry);

        return {
            success: true,
            remaining: limitConfig.maxRequests - 1,
            resetIn: limitConfig.windowMs,
        };
    }

    // Check if limit exceeded
    if (entry.count >= limitConfig.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
            error: `Rate limit exceeded. Please try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`,
        };
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
        success: true,
        remaining: limitConfig.maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    };
}

/**
 * Rate limit decorator for server actions
 * 
 * Usage:
 * ```ts
 * export async function loginAction(email: string, password: string) {
 *     const rateLimit = await rateLimit(email, 'login');
 *     if (!rateLimit.success) {
 *         return { success: false, error: rateLimit.error };
 *     }
 *     // ... rest of action
 * }
 * ```
 */
export async function rateLimitAction(
    identifier: string,
    action: keyof typeof RateLimitConfigs,
): Promise<RateLimitResult> {
    return checkRateLimit(identifier, action);
}

/**
 * Get the identifier from request context
 * In Next.js server actions, we can use the headers
 */
export function getClientIdentifier(headers: Headers, userId?: string): string {
    // Prefer userId if authenticated
    if (userId) {
        return `user:${userId}`;
    }

    // Fall back to IP address
    const forwarded = headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        "unknown";

    return `ip:${ip}`;
}

/**
 * Reset rate limit for a specific identifier and action
 * Useful for when a user successfully completes an action (e.g., successful login)
 */
export function resetRateLimit(identifier: string, action: string): void {
    const key = `${action}:${identifier}`;
    rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
    identifier: string,
    action: keyof typeof RateLimitConfigs
): { remaining: number; resetIn: number } | null {
    const key = `${action}:${identifier}`;
    const entry = rateLimitStore.get(key);

    if (!entry) {
        return null;
    }

    const now = Date.now();
    if (entry.resetTime < now) {
        return null;
    }

    return {
        remaining: RateLimitConfigs[action].maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    };
}
