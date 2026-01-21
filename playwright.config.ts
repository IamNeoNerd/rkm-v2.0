import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests/e2e',

    /* Run tests in files in parallel */
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only in the source code */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    /* Opt out of parallel tests on CI */
    workers: process.env.CI ? 1 : undefined,

    /* Reporter to use */
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
    ],

    /* Shared settings for all the projects below */
    use: {
        /* Base URL to use in actions like `await page.goto('/')` */
        baseURL: 'http://localhost:3000',

        /* Collect trace when retrying the failed test */
        trace: 'on-first-retry',

        /* Take screenshot on failure */
        screenshot: 'only-on-failure',

        /* Video recording on failure */
        video: 'on-first-retry',
    },

    /* Configure projects for Chrome with responsive viewports */
    projects: [
        // Desktop Chrome
        {
            name: 'Desktop Chrome',
            use: { ...devices['Desktop Chrome'] },
        },
        // Mobile viewports (Chrome-based)
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Chrome Small',
            use: {
                ...devices['iPhone SE'],
                // Override to use Chromium
                browserName: 'chromium',
            },
        },
        // Tablet viewports (Chrome-based)
        {
            name: 'Tablet Chrome',
            use: {
                browserName: 'chromium',
                viewport: { width: 768, height: 1024 },
                deviceScaleFactor: 2,
                isMobile: false,
                hasTouch: true,
            },
        },
        {
            name: 'Tablet Chrome Large',
            use: {
                browserName: 'chromium',
                viewport: { width: 1024, height: 1366 },
                deviceScaleFactor: 2,
                isMobile: false,
                hasTouch: true,
            },
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
