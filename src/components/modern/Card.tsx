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
            low: 'bg-white/10 backdrop-blur-[12px] border-white/5',
            medium: 'bg-white/5 backdrop-blur-[24px] border-white/20',
            high: 'bg-white/[0.025] backdrop-blur-[32px] border-white/20 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05)]',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-2xl border shadow-2xl transition-all duration-300',
                    intensityMap[intensity],
                    gradient && 'bg-gradient-to-br from-white/20 to-white/5',
                    'hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1',
                    'dark:bg-slate-950/40 dark:border-slate-800/60 dark:hover:border-slate-700/80',
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
