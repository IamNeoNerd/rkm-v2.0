/**
 * Accessibility Utilities
 * 
 * Helpers for keyboard navigation, focus management, and screen reader support
 */

/**
 * Focus trap to keep focus within a container (for modals/dialogs)
 */
export function createFocusTrap(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
            }
        }
    }

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    // Return cleanup function
    return () => container.removeEventListener('keydown', handleKeyDown);
}

/**
 * Announce message to screen readers via ARIA live region
 */
export function announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement is read
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Handle escape key for closing modals/dialogs
 */
export function useEscapeKey(callback: () => void): () => void {
    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            callback();
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
}

/**
 * Generate unique IDs for associating labels with inputs
 */
let idCounter = 0;
export function generateId(prefix = 'a11y'): string {
    return `${prefix}-${++idCounter}`;
}

/**
 * Get text content for screen readers when visual content differs
 */
export function getAriaLabel(visibleText: string, hiddenContext?: string): string {
    return hiddenContext ? `${visibleText}, ${hiddenContext}` : visibleText;
}

/**
 * Common ARIA attributes for interactive elements
 */
export const ariaProps = {
    button: (label: string, expanded?: boolean) => ({
        role: 'button' as const,
        'aria-label': label,
        ...(expanded !== undefined && { 'aria-expanded': expanded }),
        tabIndex: 0,
    }),

    menuButton: (label: string, expanded: boolean) => ({
        role: 'button' as const,
        'aria-label': label,
        'aria-haspopup': 'menu' as const,
        'aria-expanded': expanded,
        tabIndex: 0,
    }),

    menu: (label: string) => ({
        role: 'menu' as const,
        'aria-label': label,
    }),

    menuItem: (label: string) => ({
        role: 'menuitem' as const,
        'aria-label': label,
        tabIndex: -1,
    }),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dialog: (_title: string) => ({
        role: 'dialog' as const,
        'aria-modal': true,
        'aria-labelledby': `dialog-title-${generateId()}`,
    }),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    alert: (_message: string) => ({
        role: 'alert' as const,
        'aria-live': 'assertive' as const,
        'aria-atomic': true,
    }),

    link: (label: string, external?: boolean) => ({
        'aria-label': external ? `${label} (opens in new tab)` : label,
        ...(external && {
            target: '_blank',
            rel: 'noopener noreferrer'
        }),
    }),
};

/**
 * CSS class for visually hidden but screen-reader accessible content
 * Add this to your globals.css:
 * .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
 */
export const srOnlyClass = 'sr-only';

/**
 * Key codes for common keyboard interactions
 */
export const Keys = {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
} as const;

/**
 * Check if event should trigger activation (Enter or Space)
 */
export function isActivationKey(e: React.KeyboardEvent | KeyboardEvent): boolean {
    return e.key === Keys.ENTER || e.key === Keys.SPACE;
}

/**
 * Handle keyboard activation for custom interactive elements
 */
export function handleKeyboardActivation(
    e: React.KeyboardEvent,
    callback: () => void
): void {
    if (isActivationKey(e)) {
        e.preventDefault();
        callback();
    }
}
