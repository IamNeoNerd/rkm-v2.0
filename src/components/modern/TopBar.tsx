"use client";

import { Search, Command } from "lucide-react";
import { GlassCard } from "./Card";
import { NotificationBell } from "@/components/NotificationBell";
import { UserNav } from "@/components/layout/UserNav";
import { CommandPalette } from "@/components/CommandPalette";
import { cn } from "@/lib/utils";

export function TopBar() {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[92%] lg:w-[calc(100%-12rem)] max-w-7xl">
            <GlassCard
                className="px-6 py-3 flex items-center justify-between border-white/40 shadow-2xl backdrop-blur-2xl rounded-3xl"
                intensity="medium"
            >
                {/* Left: Branding/Breadcrumb (Simplified for TopBar) */}
                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center lg:hidden">
                        <Command className="h-4 w-4 text-white" />
                    </div>
                </div>

                {/* Center: Command Search Bar */}
                <div className="flex-1 max-w-md mx-8 hidden sm:block">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search pulsar database... (Ctrl + K)"
                            className="w-full bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-800 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold uppercase tracking-widest transition-all outline-none placeholder:opacity-50"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="bg-white/40 dark:bg-slate-800/40 p-1 rounded-2xl border border-white/20 dark:border-slate-800 flex items-center gap-1">
                        <NotificationBell />
                        <div className="w-[1px] h-6 bg-border mx-1" />
                        <UserNav />
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
