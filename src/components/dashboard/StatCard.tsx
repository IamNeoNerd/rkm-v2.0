
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export function StatCard({ title, value, description, icon, trend, trendUp, className }: StatCardProps) {
    return (
        <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {trend && (
                            <span className={cn("font-medium", trendUp ? "text-green-600" : "text-red-600")}>
                                {trend}
                            </span>
                        )}
                        <span className="opacity-75">{description}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
