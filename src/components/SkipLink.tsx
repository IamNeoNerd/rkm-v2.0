/**
 * SkipLink Component
 * 
 * Provides keyboard users a way to skip navigation and jump to main content
 */

interface SkipLinkProps {
    targetId?: string;
    children?: React.ReactNode;
}

export function SkipLink({
    targetId = 'main-content',
    children = 'Skip to main content'
}: SkipLinkProps) {
    return (
        <a
            href={`#${targetId}`}
            className="skip-link"
        >
            {children}
        </a>
    );
}
