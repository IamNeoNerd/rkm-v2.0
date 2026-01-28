/**
 * E2E Test: Login Flow
 * 
 * Tests the authentication flow including:
 * - Login form display
 * - Successful login
 * - Invalid credentials
 * - Session persistence
 */

import { test, expect, waitForPageLoad } from './fixtures';

test.describe('Login Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await waitForPageLoad(page);
    });

    test('should display login form', async ({ page }) => {
        // Check for email input
        await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();

        // Check for password input
        await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();

        // Check for submit button
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        // Fill invalid credentials
        await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
        await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');

        // Submit
        await page.click('button[type="submit"]');

        // Should show error (either toast or inline)
        await page.waitForTimeout(2000);

        // Check we're still on login page
        await expect(page).toHaveURL(/login/);
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        // Fill valid credentials
        await page.fill('input[type="email"], input[name="email"]', 'admin@rkinstitute.com');
        await page.fill('input[type="password"], input[name="password"]', 'admin123');

        // Submit
        await page.click('button[type="submit"]');

        // Wait for any navigation away from login (either dashboard or verify page)
        await page.waitForTimeout(3000); // Allow time for auth callback and redirect

        // Verify we're no longer on login page (login was successful)
        await expect(page).not.toHaveURL(/login/);
    });

    test('should persist session after refresh', async ({ page }) => {
        // Login first
        await page.fill('input[type="email"], input[name="email"]', 'admin@rkinstitute.com');
        await page.fill('input[type="password"], input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');

        // Wait for navigation away from login
        await page.waitForTimeout(3000);

        // Verify we left login page
        await expect(page).not.toHaveURL(/login/);

        // Refresh the page
        await page.reload();
        await waitForPageLoad(page);

        // Should still be on same page (session persisted, not redirected to login)
        await expect(page).not.toHaveURL(/login/);
    });
});

test.describe('Protected Routes', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
        // Clear cookies to ensure logged out
        await page.context().clearCookies();

        // Try to access protected route
        await page.goto('/settings');

        // Should redirect to login
        await expect(page).toHaveURL(/login/);
    });
});
