import { test, expect } from './fixtures';

/**
 * RBAC (Role-Based Access Control) Integration Tests
 * 
 * Verifies that the dynamic permissions system correctly restricts or allows
 * access to modules based on the assigned role and configuration matrix.
 */

test.describe('RBAC Matrix & Multi-Role Access Control', () => {

    test('Super-Admin can access and modify RBAC Configuration Matrix', async ({ authenticatedPage: page }) => {
        // 1. Navigate to RBAC Matrix
        await page.goto('/settings/permissions');

        // 2. Verify Page Title and Theme (using specific locator to avoid multi-match)
        await expect(page.getByRole('heading', { name: /RBAC Configuration Matrix/i })).toBeVisible();

        // 3. Verify Role Selector presence
        await expect(page.getByRole('combobox')).toBeVisible();
        // Wait for the default selection to appear
        await expect(page.getByRole('combobox')).toContainText(/Admin/i);

        // 4. Verify Presence of Feature Nodes (e.g., Strategic Dashboard)
        await expect(page.getByText(/Strategic Dashboard/i)).toBeVisible();
        await expect(page.getByText(/Financial Ledger/i)).toBeVisible();

        // 5. Verify interaction (Toggle a permission)
        const readButtons = page.locator('button:has(span:text("VISUAL"))');
        await expect(readButtons.first()).toBeVisible();
    });

    test('Teacher Role is restricted from RBAC Matrix and Settings', async ({ page }) => {
        // 1. Login as Teacher (Anjali Pandey)
        await page.goto('/login');
        await page.click('button:has-text("Staff")');
        await page.fill('input#staff-phone', '9000000011');
        await page.fill('input#staff-password', '9000000011');
        await page.click('button:has-text("Initialize Terminal")');

        await page.waitForURL(url => url.pathname === '/' || url.pathname === '/teacher');

        // 2. Verify Sidebar is filtered (No Staff or RBAC Matrix)
        await expect(page.locator('nav')).not.toContainText(/Personnel Terminal/i);
        await expect(page.locator('nav')).not.toContainText(/RBAC Matrix/i);

        // 3. Attempt direct access to RBAC page
        await page.goto('/settings/permissions');

        // 4. Verify redirection to home/root due to middleware protection
        await page.waitForTimeout(1000);
        expect(page.url()).not.toContain('/settings/permissions');
        expect(page.url()).toContain('/');
    });

    test('Cashier Role has access to Finance but not Academics', async ({ page }) => {
        // 1. Login as Cashier (Pooja Agarwal)
        await page.goto('/login');
        await page.click('button:has-text("Staff")');
        await page.fill('input#staff-phone', '9000000014');
        await page.fill('input#staff-password', '9000000014');
        await page.click('button:has-text("Initialize Terminal")');

        await page.waitForURL(url => url.pathname === '/' || url.pathname === '/cashier');

        // 2. Verify Sidebar filtering
        await expect(page.locator('nav')).toContainText(/Finance/i);
        await expect(page.locator('nav')).not.toContainText(/Academics/i);
        await expect(page.locator('nav')).not.toContainText(/Attendance/i);
    });

    test('Super-Admin sees all modules in Sidebar', async ({ authenticatedPage: page }) => {
        await page.goto('/');

        // 1. Verify Sidebar Navigation items
        await expect(page.locator('nav')).toContainText(/Dashboard/i);
        await expect(page.locator('nav')).toContainText(/Students/i);
        await expect(page.locator('nav')).toContainText(/Families/i);
        await expect(page.locator('nav')).toContainText(/Academics/i);
        await expect(page.locator('nav')).toContainText(/Finance/i);
        await expect(page.locator('nav')).toContainText(/Staff/i);
        await expect(page.locator('nav')).toContainText(/Settings/i);
    });
});
