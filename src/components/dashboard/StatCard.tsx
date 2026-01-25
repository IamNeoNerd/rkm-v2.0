import { GlassCard } from "@/components/modern/Card"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    className?: string;
    href?: string;
}

export function StatCard({ title, value, description, icon, trend, trendUp, className, href }: StatCardProps) {
    const testId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const CardContent = (
        <GlassCard
            className={cn(
                "p-6 flex flex-col justify-between group transition-all duration-300",
                href && "hover:border-primary/40 hover:shadow-primary/5 cursor-pointer active:scale-[0.98]",
                className
            )}
            data-testid={`stat-card-${testId}`}
            intensity="medium"
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                        {title}
                    </p>
                    <div className="text-3xl font-black tracking-tight text-foreground">
                        {value}
                    </div>
                </div>
                {icon && (
                    <div className="bg-white/50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-white/20 shadow-sm opacity-80 group-hover:opacity-100 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                        {icon}
                    </div>
                )}
            </div>

            {(description || trend) && (
                <div className="mt-4 flex items-center gap-2">
                    {trend && (
                        <div className={cn(
                            "px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1",
                            trendUp
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                        )}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </div>
                    )}
                    <span className="text-[11px] font-medium text-muted-foreground leading-none">
                        {description}
                    </span>
                </div>
            )}
        </GlassCard>
    );

    if (href) {
        return (
            <a href={href} className="block no-underline">
                {CardContent}
            </a>
        );
    }

    return CardContent;
}
