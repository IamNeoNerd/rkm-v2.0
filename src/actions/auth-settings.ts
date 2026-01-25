"use server";

import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requireRole, AuthorizationError } from "@/lib/auth-guard";
import { safeRevalidatePath } from "@/lib/server-utils";

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

export async function getAuthSettings(): Promise<{ success: true; settings: AuthSettings } | { success: false; error: string }> {
    try {
        await requireRole(["super-admin"]);

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

        const settingsMap = new Map();
        results.forEach((row: any) => settingsMap.set(row.key, row.value));

        const settings: AuthSettings = {
            googleEnabled: settingsMap.has("auth_google_enabled") ? settingsMap.get("auth_google_enabled") === "true" : DEFAULT_SETTINGS.googleEnabled,
            googleDomains: settingsMap.has("auth_google_domains") ? settingsMap.get("auth_google_domains").split(",").filter((d: string) => d) : DEFAULT_SETTINGS.googleDomains,
            autoVerifyStaff: settingsMap.has("auth_auto_verify_staff") ? settingsMap.get("auth_auto_verify_staff") === "true" : DEFAULT_SETTINGS.autoVerifyStaff,
            credentialsEnabled: settingsMap.has("auth_credentials_enabled") ? settingsMap.get("auth_credentials_enabled") === "true" : DEFAULT_SETTINGS.credentialsEnabled,
        };

        return { success: true, settings };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        console.error("Error fetching auth settings:", error);
        return { success: false, error: "Failed to fetch authentication settings" };
    }
}

export async function updateAuthSettings(settings: AuthSettings): Promise<{ success: boolean; error?: string }> {
    try {
        await requireRole(["super-admin"]);

        const valuesToUpsert = [
            { key: "auth_google_enabled", value: String(settings.googleEnabled), description: "Enable Google OAuth" },
            { key: "auth_google_domains", value: settings.googleDomains.join(","), description: "Allowed domains for Google Login" },
            { key: "auth_auto_verify_staff", value: String(settings.autoVerifyStaff), description: "Auto-verify staff emails" },
            { key: "auth_credentials_enabled", value: String(settings.credentialsEnabled), description: "Enable Email/Password Login" },
        ];

        // Drizzle doesn't support bulk upsert nicely across all drivers, doing one by one or transaction
        await db.transaction(async (tx: any) => {
            for (const item of valuesToUpsert) {
                await tx
                    .insert(systemSettings)
                    .values(item)
                    .onConflictDoUpdate({
                        target: systemSettings.key,
                        set: { value: item.value, updatedAt: new Date() }
                    });
            }
        });

        // Clear the auth settings cache so new settings take effect immediately
        const { clearAuthSettingsCache } = await import("@/lib/auth-settings-helper");
        clearAuthSettingsCache();

        // Audit log the settings change
        const { audit, AuditAction } = await import("@/lib/logger");
        await audit(AuditAction.SETTINGS_UPDATE, {
            settingType: "auth",
            googleEnabled: settings.googleEnabled,
            credentialsEnabled: settings.credentialsEnabled,
            autoVerifyStaff: settings.autoVerifyStaff,
            domainCount: settings.googleDomains.length
        }, "settings", "auth");

        safeRevalidatePath("/settings/auth");
        return { success: true };

    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { success: false, error: error.message };
        }
        console.error("Error updating auth settings:", error);
        return { success: false, error: "Failed to update authentication settings" };
    }
}
