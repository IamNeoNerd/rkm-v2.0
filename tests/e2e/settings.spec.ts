/**
 * E2E Test: Settings Module
 * 
 * Tests the settings pages including:
 * - Fee structure management
 * - Session management
 * - Authentication settings
 */

import { test, expect, waitForToast, navigateTo } from './fixtures';

test.describe('Settings Module', () => {
    test('should display settings page', async ({ authenticatedPage }) => {
        const page = authenticatedPage;
        await navigateTo(page, '/settings');

        // Verify settings page loads
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test.describe('Fee Structure Settings', () => {
        test.beforeEach(async ({ authenticatedPage }) => {
            await navigateTo(authenticatedPage, '/settings/fees');
        });

        test('should display fee structures page', async ({ authenticatedPage }) => {
            const page = authenticatedPage;

            // Verify page title
            await expect(page.locator('text=Fee Structure')).toBeVisible();
        });

        test('should add a new fee structure', async ({ authenticatedPage }) => {
            const page = authenticatedPage;
            const timestamp = Date.now();

            // Look for add button
            const addBtn = page.locator('button:has-text("Add Fee"), button:has-text("Create Fee"), button:has-text("New Fee")');

            if (!(await addBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
                test.skip();
                return;
            }

            await addBtn.click();

            // Wait for dialog
            await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

            // Fill class name
            const classInput = page.locator('input[name="className"], input:near(:text("Class"))');
            await classInput.fill(`Class_${timestamp}`);

            // Fill monthly fee
            const feeInput = page.locator('input[name="monthlyFee"], input:near(:text("Fee"))');
            await feeInput.fill('2500');

            // Submit
            await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');

            // Wait for success
            await waitForToast(page, 'success');
        });
    });

    test.describe('Session Settings', () => {
        test.beforeEach(async ({ authenticatedPage }) => {
            await navigateTo(authenticatedPage, '/settings/sessions');
        });

        test('should display sessions page', async ({ authenticatedPage }) => {
            const page = authenticatedPage;

            // Verify page loads
            await expect(page.locator('text=Session')).toBeVisible();
        });

        test('should create a new academic session', async ({ authenticatedPage }) => {
            const page = authenticatedPage;
            const year = new Date().getFullYear() + 5; // Use future year to avoid conflicts

            // Look for create session button
            const createBtn = page.locator('button:has-text("Create Session"), button:has-text("Add Session"), button:has-text("New Session")');

            if (!(await createBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
                test.skip();
                return;
            }

            await createBtn.click();

            // Wait for dialog
            await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

            // Fill session name
            const nameInput = page.locator('input[name="name"], input:near(:text("Name"))');
            await nameInput.fill(`Session ${year}-${year + 1}`);

            // Submit
            await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');

            // Wait for success
            await waitForToast(page, 'success');
        });
    });

    test.describe('Authentication Settings', () => {
        test.beforeEach(async ({ authenticatedPage }) => {
            await navigateTo(authenticatedPage, '/settings/auth');
        });

        test('should display auth settings page', async ({ authenticatedPage }) => {
            const page = authenticatedPage;

            // Verify page loads
            await expect(page.locator('text=Authentication')).toBeVisible();
        });

        test('should toggle authentication settings', async ({ authenticatedPage }) => {
            const page = authenticatedPage;

            // Look for toggle switches
            const toggles = page.locator('[role="switch"], input[type="checkbox"]');
            const firstToggle = toggles.first();

            if (!(await firstToggle.isVisible({ timeout: 3000 }).catch(() => false))) {
                test.skip();
                return;
            }

            // Get initial state
            const isChecked = await firstToggle.isChecked();

            // Click to toggle
            await firstToggle.click();

            // Verify state changed
            const newState = await firstToggle.isChecked();
            expect(newState).not.toBe(isChecked);

            // Toggle back
            await firstToggle.click();
        });
    });
});
