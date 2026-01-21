"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Search, Users, GraduationCap, Receipt, Settings, FileText,
    UserPlus, History, ArrowRight, Command
} from "lucide-react";

interface SearchItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    category: string;
}

const searchItems: SearchItem[] = [
    { title: "Dashboard", href: "/", icon: <Search className="h-4 w-4" />, category: "Navigation" },
    { title: "New Admission", href: "/admission", icon: <UserPlus className="h-4 w-4" />, category: "Actions" },
    { title: "Students", href: "/students", icon: <Users className="h-4 w-4" />, category: "Navigation" },
    { title: "Staff", href: "/staff", icon: <Users className="h-4 w-4" />, category: "Navigation" },
    { title: "Academics", href: "/academics", icon: <GraduationCap className="h-4 w-4" />, category: "Navigation" },
    { title: "Fee Collection", href: "/fees", icon: <Receipt className="h-4 w-4" />, category: "Actions" },
    { title: "Bulk Fee Collection", href: "/fees/bulk", icon: <Users className="h-4 w-4" />, category: "Actions" },
    { title: "Transactions", href: "/reports/transactions", icon: <History className="h-4 w-4" />, category: "Reports" },
    { title: "Dues Report", href: "/reports/dues", icon: <FileText className="h-4 w-4" />, category: "Reports" },
    { title: "Fee Structure", href: "/settings/fees", icon: <Settings className="h-4 w-4" />, category: "Settings" },
    { title: "Academic Sessions", href: "/settings/sessions", icon: <Settings className="h-4 w-4" />, category: "Settings" },
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
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
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
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
                <Search className="h-4 w-4" />
                <span>Search...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-white rounded border">
                    <Command className="h-3 w-3" />K
                </kbd>
            </button>

            {/* Mobile Trigger */}
            <button
                onClick={() => setOpen(true)}
                className="sm:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            >
                <Search className="h-5 w-5" />
            </button>

            {/* Command Palette Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                    <div className="flex items-center border-b px-3">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <Input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setSelectedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Search for pages, actions..."
                            className="border-0 focus-visible:ring-0 py-3"
                        />
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {Object.entries(groupedItems).length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No results found
                            </div>
                        ) : (
                            Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category}>
                                    <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase bg-gray-50">
                                        {category}
                                    </div>
                                    {items.map((item) => {
                                        const index = flatItems.indexOf(item);
                                        return (
                                            <button
                                                key={item.href}
                                                onClick={() => handleSelect(item.href)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-100 ${index === selectedIndex ? 'bg-indigo-50 text-indigo-600' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={index === selectedIndex ? 'text-indigo-600' : 'text-gray-400'}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="font-medium">{item.title}</span>
                                                </div>
                                                <ArrowRight className={`h-4 w-4 ${index === selectedIndex ? 'text-indigo-600' : 'text-gray-300'
                                                    }`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-400 bg-gray-50 border-t">
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-white rounded border">↑↓</kbd>
                            <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-white rounded border">↵</kbd>
                            <span>Select</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-white rounded border">Esc</kbd>
                            <span>Close</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
