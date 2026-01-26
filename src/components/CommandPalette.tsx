"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    Search, Users, GraduationCap, Receipt, Settings, FileText,
    UserPlus, History, ArrowRight, Command
} from "lucide-react";
import { cn } from "@/lib/utils";

import { GlassCard } from "./modern/Card";

interface SearchItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    category: string;
}

const searchItems: SearchItem[] = [
    { title: "Dashboard", href: "/", icon: <Command className="h-4 w-4" />, category: "Navigation" },
    { title: "New Admission", href: "/admission", icon: <UserPlus className="h-4 w-4" />, category: "Actions" },
    { title: "Students", href: "/students", icon: <Users className="h-4 w-4" />, category: "Navigation" },
    { title: "Staff", href: "/staff", icon: <Users className="h-4 w-4" />, category: "Navigation" },
    { title: "Academics", href: "/academics", icon: <GraduationCap className="h-4 w-4" />, category: "Navigation" },
    { title: "Fee Collection", href: "/fees", icon: <Receipt className="h-4 w-4" />, category: "Actions" },
    { title: "Transactions", href: "/reports/transactions", icon: <History className="h-4 w-4" />, category: "Reports" },
    { title: "Dues Report", href: "/reports/dues", icon: <FileText className="h-4 w-4" />, category: "Reports" },
    { title: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" />, category: "Settings" },
];

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredItems = useMemo(() => searchItems.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    ), [search]);

    const groupedItems = useMemo(() => filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, SearchItem[]>), [filteredItems]);

    const flatItems = useMemo(() => Object.values(groupedItems).flat(), [groupedItems]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        const handleCommandTrigger = () => setOpen(true);

        document.addEventListener("keydown", handleKeyDown);
        window.addEventListener("toggle-command-palette", handleCommandTrigger);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("toggle-command-palette", handleCommandTrigger);
        };
    }, []);

    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % flatItems.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
        } else if (e.key === "Enter" && flatItems[selectedIndex]) {
            e.preventDefault();
            router.push(flatItems[selectedIndex].href);
            setOpen(false);
            setSearch("");
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }, [flatItems, selectedIndex, router]);

    const handleSelect = (href: string) => {
        router.push(href);
        setOpen(false);
        setSearch("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                <GlassCard className="border-white/40 shadow-2xl backdrop-blur-3xl overflow-hidden rounded-[2.5rem]" intensity="high">
                    <div className="flex items-center px-8 py-6 border-b border-white/10 bg-white/5 mx-2 my-2 rounded-3xl">
                        <Search className="h-5 w-5 text-primary mr-4 animate-pulse" strokeWidth={3} />
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setSelectedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="PULSAR COMMAND... (CONNECTING TO NODES)"
                            className="bg-transparent border-none focus:ring-0 w-full text-[10px] font-black uppercase tracking-[0.2em] placeholder:text-slate-500 outline-none"
                        />
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {Object.entries(groupedItems).length === 0 ? (
                            <div className="p-12 text-center opacity-30 text-xs font-black uppercase tracking-widest">
                                No nodes found in database
                            </div>
                        ) : (
                            Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category} className="mb-2">
                                    <div className="px-6 py-3 text-[10px] font-black text-primary/60 uppercase tracking-widest">
                                        {category}
                                    </div>
                                    <div className="px-3">
                                        {items.map((item) => {
                                            const index = flatItems.indexOf(item);
                                            const isActive = index === selectedIndex;
                                            return (
                                                <button
                                                    key={item.href}
                                                    onClick={() => handleSelect(item.href)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-6 py-4 rounded-3xl transition-all duration-300",
                                                        isActive
                                                            ? "bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02] border border-white/20"
                                                            : "text-slate-600 hover:bg-white/40"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className={isActive ? "text-white" : "text-primary"}>
                                                            {item.icon}
                                                        </span>
                                                        <span className="text-xs font-black uppercase tracking-tight">{item.title}</span>
                                                    </div>
                                                    <ArrowRight className={cn("h-4 w-4 transition-transform", isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0")} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 opacity-40">
                                <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-[10px] font-black">↑↓</kbd>
                                <span className="text-[10px] font-black uppercase tracking-widest">Navigate</span>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-40">
                                <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-[10px] font-black">↵</kbd>
                                <span className="text-[10px] font-black uppercase tracking-widest">Select</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-40">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-[10px] font-black">Esc</kbd>
                            <span className="text-[10px] font-black uppercase tracking-widest">Close</span>
                        </div>
                    </div>
                </GlassCard>
            </DialogContent>
        </Dialog>
    );
}
