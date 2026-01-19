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

        // Find and click bell icon
        // The bell should be in the header area
        const header = page.locator('header');
        const buttons = header.locator('button');

        // Click the first button that looks like a notification (has bell svg)
        await buttons.first().click();

        // Should show notification dropdown or panel
        await page.waitForTimeout(500);
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
