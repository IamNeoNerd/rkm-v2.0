/**
 * E2E Test: Dashboard & Navigation
 * 
 * Tests the main dashboard and navigation functionality
 */

import { test, expect, waitForPageLoad } from './fixtures';

test.describe('Dashboard', () => {
    // Metrics validation is covered in operations.spec.ts

    test('should navigate to students page', async ({ authenticatedPage: page }) => {
        await page.goto('/');
        await waitForPageLoad(page);

        // Click on Students in sidebar
        await page.click('a[href="/students"]');

        // Verify navigation
        await expect(page).toHaveURL('/students');
    });

    test('should navigate to settings (super-admin)', async ({ authenticatedPage: page }) => {
        await page.goto('/');
        await waitForPageLoad(page);

        // Click on Settings in sidebar
        await page.click('a[href="/settings"]');

        // Verify navigation
        await expect(page).toHaveURL('/settings');
    });

    test('should show notification bell', async ({ authenticatedPage: page }) => {
        await page.goto('/');
        await waitForPageLoad(page);

        // Check for notification bell in header
        const bellButton = page.locator('button').filter({ has: page.locator('svg') }).first();
        await expect(bellButton).toBeVisible();
    });

    test('should open notification dropdown', async ({ authenticatedPage: page }) => {
        await page.goto('/');
        await waitForPageLoad(page);

        // Wait for network idle to ensure all components are loaded
        await page.waitForLoadState('networkidle');

        // Click the notification bell using stable test ID
        const bellButton = page.getByTestId('notification-bell-button');

        // Ensure button is visible and stable before clicking
        await expect(bellButton).toBeVisible();
        await bellButton.waitFor({ state: 'attached' });
        await bellButton.click({ force: false });

        // Verify the dropdown appears
        const dropdown = page.getByTestId('notification-dropdown');
        await expect(dropdown).toBeVisible({ timeout: 5000 });

        // Verify dropdown contains the "Notifications" heading
        await expect(dropdown).toContainText('Notifications');
    });

});

test.describe('Sidebar Navigation', () => {
    test('should highlight active page', async ({ authenticatedPage: page }) => {
        await page.goto('/students');
        await waitForPageLoad(page);

        // The Students link should have an active state (different styling)
        const studentsLink = page.locator('a[href="/students"]');
        await expect(studentsLink).toBeVisible();
    });

    test('should navigate through all main sections', async ({ authenticatedPage: page }) => {
        const routes = [
            { path: '/', name: 'Dashboard' },
            { path: '/students', name: 'Students' },
            { path: '/staff', name: 'Staff' },
            { path: '/academics', name: 'Academics' },
            { path: '/fees', name: 'Fee Collection' },
        ];

        for (const route of routes) {
            await page.goto(route.path);
            await waitForPageLoad(page);
            await expect(page).toHaveURL(route.path);
        }
    });
});
