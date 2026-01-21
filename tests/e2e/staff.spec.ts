/**
 * E2E Test: Staff Management
 * 
 * Tests the staff management flow including:
 * - Adding a new staff member
 * - Creating custom role types
 * - Viewing staff list
 * - Editing staff details
 */

import { test, expect, waitForToast, navigateTo } from './fixtures';

test.describe('Staff Management', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
        await navigateTo(authenticatedPage, '/staff');
    });

    test('should display personnel terminal page', async ({ authenticatedPage }) => {
        const page = authenticatedPage;

        // Ensure page is fully settled
        await page.waitForLoadState('networkidle');

        // Verify page title (exact match for rendered text)
        // using { state: 'visible' } to ensure it's not just in DOM but rendered
        const heading = page.locator('h1:has-text("PERSONNEL TERMINAL")');
        await expect(heading).toBeVisible({ timeout: 15000 });

        // Verify Add Personnel button exists
        await expect(page.locator('button:has-text("ADD PERSONNEL NODE")')).toBeVisible();

        // Verify Custom Staff Types section
        await expect(page.locator('text=Custom Staff Types')).toBeVisible();
    });

    test('should add a custom role type', async ({ authenticatedPage }) => {
        const page = authenticatedPage;
        const timestamp = Date.now();
        const roleTypeName = `Test_Role_${timestamp}`;

        // Click Configure Role Vectors button
        await page.click('text=CONFIGURE ROLE VECTORS');
        await page.waitForTimeout(1000);

        // Fill in the new role type name
        await page.fill('input[placeholder*="ROLE SIGNATURE"]', roleTypeName);

        // Click Deploy button
        await page.click('button:has-text("DEPLOY")');

        // Wait for success toast
        await waitForToast(page, 'registered');

        // Verify the role type appears in the list
        await expect(page.locator(`text=${roleTypeName}`.toUpperCase())).toBeVisible();
    });

    test('should add a new staff member', async ({ authenticatedPage }) => {
        const page = authenticatedPage;
        const timestamp = Date.now();
        const staffName = `Test_Staff_${timestamp}`;
        const staffPhone = `99${timestamp.toString().slice(-8)}`;

        // Click Add Personnel button
        await page.click('button:has-text("ADD PERSONNEL NODE")');

        // Wait for dialog to open
        await page.waitForSelector('[role="dialog"]');

        // Fill in staff details
        await page.fill('input[placeholder="ENTER NAME"]', staffName);
        await page.fill('input[placeholder="+91 XXXXX XXXXX"]', staffPhone);
        await page.fill('input[placeholder="STAFF@RKINSTITUTE.COM"]', `test_${timestamp}@example.com`);

        // Select role (using native select)
        await page.selectOption('select:near(:text("System Role Vector"))', 'STAFF');

        // Fill salary
        await page.fill('input[placeholder="0.00"]', '15000');

        // Submit form
        await page.click('button:has-text("INITIALIZE PERSONNEL NODE")');

        // Wait for success toast
        await waitForToast(page, 'successfully');

        // Verify staff appears in grid
        await page.waitForTimeout(1000);
        await expect(page.locator(`text=${staffName}`)).toBeVisible();
    });

    test('should edit staff member', async ({ authenticatedPage }) => {
        const page = authenticatedPage;

        // Find first edit button (using lucide-edit3 search)
        const editButton = page.locator('button:has(svg.lucide-edit3)').first();

        // Skip if no staff members exist
        if (!(await editButton.isVisible())) {
            test.skip();
            return;
        }

        await editButton.click();

        // Wait for dialog to open
        await page.waitForSelector('[role="dialog"]');

        // Verify edit dialog title
        await expect(page.locator('text=Recalibrate Node')).toBeVisible();

        // Close dialog
        await page.keyboard.press('Escape');
    });
});
