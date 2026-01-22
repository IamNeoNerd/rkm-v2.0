import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    gradient?: boolean;
    intensity?: 'low' | 'medium' | 'high';
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, children, gradient = false, intensity = 'medium', ...props }, ref) => {
        const intensityMap = {
            low: 'bg-white/40 backdrop-blur-sm',
            medium: 'bg-white/60 backdrop-blur-md',
            high: 'bg-white/80 backdrop-blur-xl',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-2xl border border-white/20 shadow-lg transition-all duration-300',
                    intensityMap[intensity],
                    gradient && 'bg-gradient-to-br from-white/40 to-white/10',
                    'hover:shadow-xl hover:border-white/40 hover:-translate-y-1',
                    'dark:bg-slate-950/80 dark:border-slate-800/60 dark:hover:border-slate-700/80',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

GlassCard.displayName = 'GlassCard';
