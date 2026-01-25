"use client";

import { Search, Command } from "lucide-react";
import { GlassCard } from "./Card";
import { NotificationBell } from "@/components/NotificationBell";
import { UserNav } from "@/components/layout/UserNav";
import { CommandPalette } from "@/components/CommandPalette";
import { cn } from "@/lib/utils";

export function TopBar() {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[94%] lg:w-[calc(100%-14rem)] max-w-7xl">
            <GlassCard
                className="px-2.5 sm:px-4 py-2 flex items-center justify-between border-white/20 shadow-lg backdrop-blur-[32px] rounded-[2rem]"
                intensity="high"
            >
                {/* Left: Branding Node (Hidden on ultra-small screens) */}
                <div className="hidden min-[380px]:flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary/90 shadow-lg shadow-primary/20 rounded-xl flex items-center justify-center lg:hidden">
                        <Command className="h-4 w-4 text-white" />
                    </div>
                </div>

                {/* Center: Tactical Search Trigger (Dynamic Scaling) */}
                <div className="flex-1 max-w-sm mx-1.5 sm:mx-4">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('toggle-command-palette'))}
                        className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 focus:outline-none rounded-xl sm:rounded-2xl py-2 px-3 sm:px-4 transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <Search className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" strokeWidth={3} />
                            <span className="hidden min-[340px]:inline text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-primary transition-colors truncate">Search pulsar...</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1 opacity-20 group-hover:opacity-60 transition-opacity">
                            <kbd className="px-1 py-0.5 bg-white/10 rounded border border-white/10 text-[7px] font-black">Ctrl</kbd>
                            <span className="text-[7px] font-black">+</span>
                            <kbd className="px-1 py-0.5 bg-white/10 rounded border border-white/10 text-[7px] font-black">K</kbd>
                        </div>
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="p-0.5 sm:p-1 rounded-2xl flex items-center gap-1">
                        <NotificationBell />
                        <div className="w-[1px] h-4 sm:h-5 bg-white/10 mx-0.5 sm:mx-1" />
                        <UserNav />
                    </div>
                </div>
            </GlassCard>

            {/* Command Palette Node */}
            <CommandPalette />
        </div>
    );
}
