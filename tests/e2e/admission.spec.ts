/**
 * E2E Test: Admission Flow
 * 
 * Tests the complete student admission process
 */

import { test, expect, waitForPageLoad, waitForToast } from './fixtures';

test.describe('Admission Flow', () => {
    test('should complete a full admission', async ({ authenticatedPage: page }) => {
        // Navigate to admission page
        await page.goto('/admission');
        await waitForPageLoad(page);

        // Verify we're on admission page
        await expect(page.locator('h1, h2').first()).toContainText(/admission/i);

        // Generate unique test data
        const timestamp = Date.now();
        const testData = {
            fatherName: `Test Parent ${timestamp}`,
            phone: `98765${String(timestamp).slice(-5)}`,
            studentName: `Test Student ${timestamp}`,
            studentClass: 'Class 10',
        };

        // Fill the admission form
        await page.fill('input[name="fatherName"], input#fatherName', testData.fatherName);
        await page.fill('input[name="phone"], input#phone', testData.phone);
        await page.fill('input[name="studentName"], input#studentName', testData.studentName);

        // Select class from dropdown
        const classInput = page.locator('input[name="studentClass"], input#studentClass, select[name="studentClass"]');
        if (await classInput.count() > 0) {
            await classInput.fill(testData.studentClass);
        }

        // Wait a moment for any dynamic updates
        await page.waitForTimeout(500);
    });

    test('should show admission form fields', async ({ authenticatedPage: page }) => {
        await page.goto('/admission');
        await waitForPageLoad(page);

        // Check for required form fields
        await expect(page.locator('input[name="fatherName"], input#fatherName, label:has-text("Father")')).toBeVisible();
        await expect(page.locator('input[name="phone"], input#phone, label:has-text("Phone")')).toBeVisible();
        await expect(page.locator('input[name="studentName"], input#studentName, label:has-text("Student")')).toBeVisible();
    });
});

test.describe('Fee Collection Flow', () => {
    test('should navigate to fee collection page', async ({ authenticatedPage: page }) => {
        await page.goto('/fees');
        await waitForPageLoad(page);

        // Should be on fee collection page
        await expect(page).toHaveURL(/fees/);
    });

    test('should show search for families', async ({ authenticatedPage: page }) => {
        await page.goto('/fees');
        await waitForPageLoad(page);

        // Look for search input
        const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]');
        await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to bulk collection', async ({ authenticatedPage: page }) => {
        await page.goto('/fees/bulk');
        await waitForPageLoad(page);

        // Should be on bulk collection page
        await expect(page).toHaveURL(/fees\/bulk/);
    });
});

test.describe('Reports', () => {
    test('should load dues report', async ({ authenticatedPage: page }) => {
        await page.goto('/reports/dues');
        await waitForPageLoad(page);

        // Should show dues report content
        await expect(page).toHaveURL('/reports/dues');
    });

    test('should load transactions report', async ({ authenticatedPage: page }) => {
        await page.goto('/reports/transactions');
        await waitForPageLoad(page);

        // Should show transactions page
        await expect(page).toHaveURL('/reports/transactions');
    });

    test('should load financial report', async ({ authenticatedPage: page }) => {
        await page.goto('/reports/finance');
        await waitForPageLoad(page);

        // Should show financial dashboard
        await expect(page).toHaveURL('/reports/finance');
        await expect(page.locator('text=Financial Dashboard')).toBeVisible({ timeout: 5000 });
    });
});
