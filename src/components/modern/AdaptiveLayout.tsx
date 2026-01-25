"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlassCard } from "./Card";
import { cn } from "@/lib/utils";

interface AdaptiveLayoutProps<T> {
    items: T[];
    renderCard: (item: T, index: number) => React.ReactNode;
    renderTable: (items: T[]) => React.ReactNode;
    emptyMessage?: string;
    className?: string;
    loading?: boolean;
}

export function AdaptiveLayout<T>({
    items,
    renderCard,
    renderTable,
    emptyMessage = "No items found in this vector.",
    className,
    loading = false
}: AdaptiveLayoutProps<T>) {
    const isMobile = useIsMobile();

    if (loading) {
        return (
            <div className={cn("space-y-4 animate-pulse", className)}>
                {[1, 2, 3].map((i) => (
                    <GlassCard key={i} className="h-24 opacity-50" intensity="low">
                        <div className="h-full w-full" />
                    </GlassCard>
                ))}
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <GlassCard className="p-12 text-center" intensity="low">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    {emptyMessage}
                </p>
            </GlassCard>
        );
    }

    return (
        <div className={className}>
            {isMobile ? (
                <div className="grid grid-cols-1 gap-4">
                    {items.map((item, index) => renderCard(item, index))}
                </div>
            ) : (
                renderTable(items)
            )}
        </div>
    );
}
