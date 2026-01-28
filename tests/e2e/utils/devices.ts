/**
 * Device and Viewport Utilities for Responsive Testing
 * 
 * Custom device configurations for mobile and tablet testing in Chrome.
 */

import { Page } from '@playwright/test';

/**
 * Common viewport sizes for responsive testing
 */
export const VIEWPORTS = {
    // Mobile viewports
    mobile: {
        small: { width: 320, height: 568 },   // iPhone SE
        medium: { width: 375, height: 667 },  // iPhone 6/7/8
        large: { width: 414, height: 896 },   // iPhone XR/11
        pixel: { width: 393, height: 851 },   // Pixel 5
    },
    // Tablet viewports
    tablet: {
        portrait: { width: 768, height: 1024 },   // iPad
        landscape: { width: 1024, height: 768 },  // iPad Landscape
        large: { width: 1024, height: 1366 },     // iPad Pro
    },
    // Desktop viewports
    desktop: {
        small: { width: 1280, height: 720 },   // HD
        medium: { width: 1440, height: 900 },  // Standard
        large: { width: 1920, height: 1080 },  // Full HD
    },
};

/**
 * Set viewport size for a page
 */
export async function setViewport(
    page: Page,
    viewport: { width: number; height: number }
): Promise<void> {
    await page.setViewportSize(viewport);
}

/**
 * Set mobile viewport with touch emulation
 */
export async function setMobileViewport(page: Page): Promise<void> {
    await page.setViewportSize(VIEWPORTS.mobile.medium);
}

/**
 * Set tablet viewport
 */
export async function setTabletViewport(page: Page): Promise<void> {
    await page.setViewportSize(VIEWPORTS.tablet.portrait);
}

/**
 * Set desktop viewport
 */
export async function setDesktopViewport(page: Page): Promise<void> {
    await page.setViewportSize(VIEWPORTS.desktop.medium);
}

/**
 * Check if element is visible within viewport (no overflow)
 */
export async function isElementWithinViewport(
    page: Page,
    selector: string
): Promise<boolean> {
    const element = page.locator(selector).first();

    if (!(await element.isVisible())) {
        return false;
    }

    const box = await element.boundingBox();
    if (!box) return false;

    const viewport = page.viewportSize();
    if (!viewport) return false;

    return (
        box.x >= 0 &&
        box.y >= 0 &&
        box.x + box.width <= viewport.width &&
        box.y + box.height <= viewport.height
    );
}

/**
 * Check if element has horizontal overflow
 */
export async function hasHorizontalOverflow(
    page: Page,
    selector: string
): Promise<boolean> {
    return await page.locator(selector).evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
    });
}

/**
 * Check if page has horizontal scroll
 */
export async function hasPageHorizontalScroll(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
}

/**
 * Get all elements that overflow their container
 */
export async function findOverflowingElements(page: Page): Promise<string[]> {
    return await page.evaluate(() => {
        const overflowing: string[] = [];
        const elements = document.querySelectorAll('*');

        elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.scrollWidth > htmlEl.clientWidth) {
                const id = el.id ? `#${el.id}` : '';
                const classes = el.className ? `.${el.className.toString().split(' ').join('.')}` : '';
                overflowing.push(`${el.tagName.toLowerCase()}${id}${classes}`);
            }
        });

        return overflowing.slice(0, 20); // Limit to first 20
    });
}

/**
 * Simulate touch tap on element
 */
export async function touchTap(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector).first();
    const box = await element.boundingBox();

    if (box) {
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    }
}

/**
 * Simulate swipe gesture
 */
export async function swipe(
    page: Page,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number = 300
): Promise<void> {
    const steps = 10;
    const stepDuration = duration / steps;
    const deltaX = (endX - startX) / steps;
    const deltaY = (endY - startY) / steps;

    // Start touch
    await page.touchscreen.tap(startX, startY);

    // Move through intermediate positions
    for (let i = 1; i <= steps; i++) {
        const x = startX + deltaX * i;
        const y = startY + deltaY * i;
        await page.mouse.move(x, y);
        await page.waitForTimeout(stepDuration);
    }
}

/**
 * Check if button has minimum touch target size (44x44px)
 */
export async function hasMinTouchTarget(
    page: Page,
    selector: string
): Promise<boolean> {
    const element = page.locator(selector).first();
    const box = await element.boundingBox();

    if (!box) return false;

    // WCAG recommends minimum 44x44 CSS pixels for touch targets
    return box.width >= 44 && box.height >= 44;
}

/**
 * Get all buttons without minimum touch target size
 */
export async function findSmallTouchTargets(page: Page): Promise<string[]> {
    return await page.evaluate(() => {
        const smallTargets: string[] = [];
        const buttons = document.querySelectorAll('button, a, [role="button"]');

        buttons.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                const text = el.textContent?.trim().slice(0, 20) || '';
                smallTargets.push(`${el.tagName.toLowerCase()} "${text}" (${Math.round(rect.width)}x${Math.round(rect.height)})`);
            }
        });

        return smallTargets.slice(0, 20);
    });
}

/**
 * Take screenshot for visual documentation
 */
export async function captureScreenshot(
    page: Page,
    name: string,
    options: { fullPage?: boolean } = {}
): Promise<string> {
    const path = `tests/e2e/screenshots/${name}-${Date.now()}.png`;
    await page.screenshot({
        path,
        fullPage: options.fullPage ?? false,
    });
    return path;
}

/**
 * Run test at multiple viewport sizes
 */
export async function testAtViewports(
    page: Page,
    viewports: Array<{ name: string; width: number; height: number }>,
    testFn: (viewportName: string) => Promise<void>
): Promise<void> {
    for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(300); // Allow layout to settle
        await testFn(viewport.name);
    }
}

/**
 * Common viewports for quick testing
 */
export const COMMON_VIEWPORTS = [
    { name: 'Mobile Small', ...VIEWPORTS.mobile.small },
    { name: 'Mobile Medium', ...VIEWPORTS.mobile.medium },
    { name: 'Tablet', ...VIEWPORTS.tablet.portrait },
    { name: 'Desktop', ...VIEWPORTS.desktop.medium },
];
