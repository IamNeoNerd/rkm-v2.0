import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GlassCard } from "@/components/modern/Card"
import { cn } from "@/lib/utils"

interface ActivityItem {
    id: number;
    name: string; // "Student Name" or "Payment" (if generic)
    type: string; // ADMISSION, PAYMENT
    amount: number;
    createdAt: Date;
}

interface RecentActivityProps {
    data: ActivityItem[]
}

export function RecentActivity({ data }: RecentActivityProps) {
    return (
        <GlassCard className="col-span-1 lg:col-span-3 p-6 flex flex-col h-full" intensity="medium">
            <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Live Feed
                </h3>
                <h2 className="text-xl font-black text-foreground"> Recent Activity </h2>
            </div>

            <div className="space-y-6 flex-1 overflow-auto pr-2 custom-scrollbar">
                {data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                        <p className="text-sm font-bold uppercase tracking-widest">No recent pulses detected.</p>
                    </div>
                )}

                {data.map((item, index) => (
                    <div
                        key={`${item.type}-${item.id}-${index}`}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-white/50 shadow-sm">
                                <AvatarFallback className={cn(
                                    "font-black text-[10px]",
                                    item.type === 'ADMISSION'
                                        ? 'bg-primary/10 text-primary uppercase'
                                        : 'bg-cta/10 text-cta uppercase'
                                )}>
                                    {item.type === 'ADMISSION' ? 'AD' : 'PY'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                                    {item.type === 'ADMISSION' ? `New Admission: ${item.name}` : `Payment Received`}
                                </p>
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            {item.type === 'PAYMENT' ? (
                                <div className="text-sm font-black text-primary">
                                    +₹{item.amount.toLocaleString()}
                                </div>
                            ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border/50">
                <button className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors py-2">
                    View Full Audit Log →
                </button>
            </div>
        </GlassCard>
    )
}
