/**
 * Auth Settings Helper
 * Provides runtime access to auth settings for use in auth callbacks
 */

import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { inArray } from "drizzle-orm";

export interface AuthSettings {
    googleEnabled: boolean;
    googleDomains: string[];
    autoVerifyStaff: boolean;
    credentialsEnabled: boolean;
}

const DEFAULT_SETTINGS: AuthSettings = {
    googleEnabled: true,
    googleDomains: [],
    autoVerifyStaff: true,
    credentialsEnabled: true,
};

// Cache settings for 60 seconds to avoid repeated DB calls
let settingsCache: { settings: AuthSettings; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * Get auth settings from database with caching
 */
export async function getAuthSettingsInternal(): Promise<AuthSettings> {
    const now = Date.now();

    // Return cached settings if still valid
    if (settingsCache && (now - settingsCache.timestamp) < CACHE_TTL) {
        return settingsCache.settings;
    }

    try {
        const keys = [
            "auth_google_enabled",
            "auth_google_domains",
            "auth_auto_verify_staff",
            "auth_credentials_enabled"
        ];

        const results = await db
            .select()
            .from(systemSettings)
            .where(inArray(systemSettings.key, keys));

        const settingsMap = new Map<string, string>();
        results.forEach(row => settingsMap.set(row.key, row.value));

        const settings: AuthSettings = {
            googleEnabled: settingsMap.has("auth_google_enabled")
                ? settingsMap.get("auth_google_enabled") === "true"
                : DEFAULT_SETTINGS.googleEnabled,
            googleDomains: settingsMap.has("auth_google_domains")
                ? (settingsMap.get("auth_google_domains") || "").split(",").filter(d => d.trim())
                : DEFAULT_SETTINGS.googleDomains,
            autoVerifyStaff: settingsMap.has("auth_auto_verify_staff")
                ? settingsMap.get("auth_auto_verify_staff") === "true"
                : DEFAULT_SETTINGS.autoVerifyStaff,
            credentialsEnabled: settingsMap.has("auth_credentials_enabled")
                ? settingsMap.get("auth_credentials_enabled") === "true"
                : DEFAULT_SETTINGS.credentialsEnabled,
        };

        // Update cache
        settingsCache = { settings, timestamp: now };

        return settings;
    } catch (error) {
        console.error("[AUTH_SETTINGS] CRITICAL_FETCH_FAILURE // Node: system_settings");
        console.error("[AUTH_SETTINGS] Detailed Error:", error);

        if (!process.env.DATABASE_URL) {
            console.error("[AUTH_SETTINGS] ERROR_CODE: ENV_VAR_MISSING // Target: DATABASE_URL");
        } else {
            console.error("[AUTH_SETTINGS] ERROR_CODE: DB_QUERY_REJECTED // Target: system_settings mapping");
        }

        // Return defaults on error to allow system to at least attempt fallback auth
        return DEFAULT_SETTINGS;
    }
}

/**
 * Check if an email domain is allowed based on settings
 */
export async function isDomainAllowed(email: string): Promise<boolean> {
    const settings = await getAuthSettingsInternal();

    // If no domains are configured, allow all
    if (settings.googleDomains.length === 0) {
        return true;
    }

    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (!emailDomain) {
        return false;
    }

    return settings.googleDomains.some(
        domain => domain.toLowerCase().trim() === emailDomain
    );
}

/**
 * Clear the settings cache (call after settings update)
 */
export function clearAuthSettingsCache() {
    settingsCache = null;
}
