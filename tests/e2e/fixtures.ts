/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Playwright Test Fixtures
 * 
 * Custom fixtures for login, authentication, and common operations
 */

import { test as base, expect, type Page } from '@playwright/test';

// Test user credentials
export const TEST_USERS = {
    superAdmin: {
        email: 'admin@rkinstitute.com',
        password: 'admin123',
        role: 'super-admin',
    },
    // Add more test users as needed
};

/**
 * Extended test fixtures with authentication helpers
 */
export const test = base.extend<{
    /** Page that is logged in as super-admin */
    authenticatedPage: Page;
}>({
    authenticatedPage: async ({ page }, use) => {
        // Navigate to login
        await page.goto('/login');

        // Fill credentials
        await page.fill('input[type="email"], input[name="email"]', TEST_USERS.superAdmin.email);
        await page.fill('input[type="password"], input[name="password"]', TEST_USERS.superAdmin.password);

        // Submit login form
        await page.click('button[type="submit"]');

        // Wait for auth to process and redirect
        await page.waitForTimeout(3000);

        // Verify we're no longer on login page (login was successful)
        await expect(page).not.toHaveURL(/login/);

        // Use the authenticated page
        await use(page);
    },
});

export { expect };

/**
 * Helper to wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
    await page.waitForLoadState('load');
}

/**
 * Helper to wait for toast notification
 */
export async function waitForToast(page: Page, text?: string) {
    const toastSelector = '[data-sonner-toast]';
    await page.waitForSelector(toastSelector, { timeout: 5000 });

    if (text) {
        await expect(page.locator(toastSelector)).toContainText(text);
    }
}

/**
 * Helper to fill and submit a form
 */
export async function fillForm(
    page: Page,
    fields: Record<string, string | number>
) {
    for (const [name, value] of Object.entries(fields)) {
        const input = page.locator(`input[name="${name}"], select[name="${name}"], textarea[name="${name}"]`);

        if (typeof value === 'number') {
            await input.fill(String(value));
        } else {
            await input.fill(value);
        }
    }
}

/**
 * Helper to navigate and wait for load
 */
export async function navigateTo(page: Page, path: string) {
    await page.goto(path);
    await waitForPageLoad(page);
}
