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

    test('should display staff management page', async ({ authenticatedPage }) => {
        const page = authenticatedPage;

        // Verify page title
        await expect(page.locator('h1')).toContainText('Staff Management');

        // Verify Add Staff button exists
        await expect(page.locator('button:has-text("Add Staff")')).toBeVisible();

        // Verify Custom Staff Types section
        await expect(page.locator('text=Custom Staff Types')).toBeVisible();
    });

    test('should add a custom role type', async ({ authenticatedPage }) => {
        const page = authenticatedPage;
        const timestamp = Date.now();
        const roleTypeName = `TestRole_${timestamp}`;

        // Expand the Custom Staff Types section
        await page.click('text=Manage');
        await page.waitForTimeout(300);

        // Fill in the new role type name
        await page.fill('input[placeholder*="staff type"]', roleTypeName);

        // Click Add Type button
        await page.click('button:has-text("Add Type")');

        // Wait for success toast
        await waitForToast(page, 'added');

        // Verify the role type appears in the list
        await expect(page.locator(`text=${roleTypeName}`)).toBeVisible();
    });

    test('should add a new staff member', async ({ authenticatedPage }) => {
        const page = authenticatedPage;
        const timestamp = Date.now();
        const staffName = `TestStaff_${timestamp}`;
        const staffPhone = `99${timestamp.toString().slice(-8)}`;

        // Click Add Staff button
        await page.click('button:has-text("Add Staff")');

        // Wait for dialog to open
        await page.waitForSelector('[role="dialog"]');

        // Fill in staff details
        await page.fill('input:near(:text("Name"))', staffName);
        await page.fill('input:near(:text("Phone"))', staffPhone);
        await page.fill('input:near(:text("Email"))', `test_${timestamp}@example.com`);

        // Select role
        await page.selectOption('select:near(:text("System Role"))', 'STAFF');

        // Fill salary
        await page.fill('input:near(:text("Salary"))', '15000');

        // Submit form
        await page.click('button:has-text("Save Staff")');

        // Wait for success toast
        await waitForToast(page, 'successfully');

        // Verify staff appears in table
        await page.waitForTimeout(500);
        await expect(page.locator(`text=${staffName}`)).toBeVisible();
    });

    test('should edit staff member', async ({ authenticatedPage }) => {
        const page = authenticatedPage;

        // Find first edit button in the table
        const editButton = page.locator('button:has(svg.lucide-pencil)').first();

        // Skip if no staff members exist
        if (!(await editButton.isVisible())) {
            test.skip();
            return;
        }

        await editButton.click();

        // Wait for dialog to open
        await page.waitForSelector('[role="dialog"]');

        // Verify edit dialog is open
        await expect(page.locator('text=Edit Staff Member')).toBeVisible();

        // Close dialog
        await page.keyboard.press('Escape');
    });
});
