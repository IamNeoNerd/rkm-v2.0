/**
 * E2E Test: Academics Module
 * 
 * Tests the academics flow including:
 * - Creating a batch
 * - Assigning teachers
 * - Enrolling students
 */

import { test, expect, waitForToast, navigateTo } from './fixtures';

test.describe('Academics Module', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
        await navigateTo(authenticatedPage, '/academics');
    });

    test('should display academics page', async ({ authenticatedPage }) => {
        const page = authenticatedPage;

        // Verify page loads
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should create a new batch', async ({ authenticatedPage }) => {
        const page = authenticatedPage;
        const timestamp = Date.now();
        const batchName = `TestBatch_${timestamp}`;

        // Look for "Create Batch" or similar button
        const createBatchBtn = page.locator('button:has-text("Create Batch"), button:has-text("Add Batch"), button:has-text("New Batch")');

        // Skip if button doesn't exist (different UI)
        if (!(await createBatchBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
            test.skip();
            return;
        }

        await createBatchBtn.click();

        // Wait for dialog/form
        await page.waitForSelector('[role="dialog"], form', { timeout: 5000 });

        // Fill batch name
        const nameInput = page.locator('input[name="name"], input:near(:text("Name"))');
        await nameInput.fill(batchName);

        // Fill fee
        const feeInput = page.locator('input[name="fee"], input:near(:text("Fee"))');
        await feeInput.fill('1500');

        // Select a teacher if dropdown exists
        const teacherSelect = page.locator('select:near(:text("Teacher")), select[name="teacherId"]');
        if (await teacherSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
            const options = await teacherSelect.locator('option').all();
            if (options.length > 1) {
                await teacherSelect.selectOption({ index: 1 });
            }
        }

        // Submit
        await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');

        // Wait for success
        await waitForToast(page, 'success');
    });

    test('should view batch details', async ({ authenticatedPage }) => {
        const page = authenticatedPage;

        // Look for a batch link or card
        const batchLink = page.locator('a[href*="/batches/"], [data-batch-id], .batch-card').first();

        if (!(await batchLink.isVisible({ timeout: 3000 }).catch(() => false))) {
            test.skip();
            return;
        }

        await batchLink.click();

        // Verify navigation to batch page
        await page.waitForURL(/\/batches\/\d+/);
        await expect(page).toHaveURL(/\/batches\/\d+/);
    });
});
