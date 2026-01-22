"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Settings,
    LogOut,
    Receipt,
    UserPlus,
    UserCog,
    FileText,
    History,
    UsersRound,
    Calendar,
    ChevronRight,
    IndianRupee,
    TrendingUp,
    Shield,
    Bell,
    User,
    Menu,
    X
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./Card";
import { Button } from "./Button";
import { type FeatureKey, type PermissionCheck } from "@/lib/permissions";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    feature?: FeatureKey;
    role?: string;
    children?: NavItem[];
}

const navItems: NavItem[] = [
    { title: "Dashboard", href: "/", icon: LayoutDashboard, feature: "dashboard" },
    { title: "Admission", href: "/admission", icon: UserPlus, feature: "admissions" },
    { title: "Students", href: "/students", icon: Users, feature: "students" },
    { title: "Families", href: "/families", icon: UsersRound, feature: "families" },
    { title: "Academics", href: "/academics", icon: GraduationCap, feature: "academics" },
    { title: "Attendance", href: "/attendance", icon: Calendar, feature: "attendance" },
    {
        title: "Finance",
        href: "/fees",
        icon: IndianRupee,
        feature: "fees",
        children: [
            { title: "Collect Fee", href: "/fees", icon: Receipt, feature: "fees" },
            { title: "Transactions", href: "/reports/transactions", icon: History, feature: "reports" },
            { title: "Dues", href: "/reports/dues", icon: FileText, feature: "reports" },
        ]
    },
    { title: "Staff", href: "/staff", icon: UserCog, feature: "staff" },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        feature: "settings",
    },
];

export function FloatingNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isExpanded, setIsExpanded] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const userRole = session?.user?.role || "user";
    const permissions = session?.user?.permissions as Record<FeatureKey, PermissionCheck> | undefined;

    const filteredItems = navItems.filter(item => {
        // Super-admin bypass
        if (userRole === "super-admin") return true;

        // Role-based filtering (explicit)
        if (item.role && item.role !== userRole) return false;

        // Feature-based filtering (Dynamic RBAC)
        if (item.feature) {
            // Special case: Dashboard is available for all authenticated users, 
            // but the destination depends on the role
            if (item.feature === 'dashboard') return true;

            const hasAccess = permissions?.[item.feature]?.canView ?? false;
            if (!hasAccess) return false;
        }

        return true;
    }).map(item => {
        // Adjust Dashboard href based on role
        if (item.feature === 'dashboard' && userRole !== 'admin' && userRole !== 'super-admin') {
            if (userRole === 'student') {
                return { ...item, href: '/student/portal' };
            }
            return { ...item, href: '/staff/dashboard' };
        }
        return item;
    });

    return (
        <>
            {/* Desktop Floating Dock */}
            <div
                className={cn(
                    "fixed left-6 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group hidden lg:block",
                    isExpanded ? "w-64" : "w-20"
                )}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <GlassCard
                    className="h-[85vh] flex flex-col items-center py-8 overflow-hidden border-white/40 shadow-2xl backdrop-blur-3xl"
                    intensity="high"
                >
                    {/* Logo/Icon */}
                    <div className="mb-10 relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl shadow-lg">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    {/* Nav Items - Scrollable Area */}
                    <nav className="flex-1 w-full px-3 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                        {filteredItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 relative group/item mb-1",
                                        isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                            : "text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isActive ? "" : "group-hover/item:scale-110")} />
                                    <span className={cn(
                                        "font-bold text-xs uppercase tracking-widest transition-all duration-500 whitespace-nowrap overflow-hidden",
                                        isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                                    )}>
                                        {item.title}
                                    </span>
                                    {isActive && (
                                        <div className="absolute left-0 w-1 h-6 bg-white rounded-full -translate-x-1" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="mt-auto w-full px-3 pt-6 border-t border-white/10 dark:border-slate-800/50">
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className={cn(
                                "flex items-center gap-4 p-3.5 w-full rounded-2xl text-red-500 hover:bg-red-500/10 transition-all duration-300",
                                !isExpanded && "justify-center"
                            )}
                        >
                            <LogOut className="h-5 w-5 shrink-0" />
                            <span className={cn(
                                "font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500",
                                isExpanded ? "opacity-100" : "opacity-0 hidden"
                            )}>
                                Disconnect
                            </span>
                        </button>
                    </div>
                </GlassCard>
            </div>

            {/* Mobile Bottom Bar with Sheet Menu */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[90%] max-w-sm">
                <GlassCard className="flex items-center justify-around py-4 px-2 border-white/40 shadow-2xl backdrop-blur-2xl rounded-3xl" intensity="medium">
                    {filteredItems.slice(0, 4).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} className={cn("p-2 rounded-xl transition-all", isActive ? "bg-primary text-white shadow-lg" : "text-muted-foreground")}>
                                <item.icon className="h-6 w-6" />
                            </Link>
                        );
                    })}

                    {/* Mobile Menu Sheet Trigger */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <button className="p-2 text-muted-foreground rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                <Menu className="h-6 w-6" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl bg-background/95 backdrop-blur-xl border-t border-white/20">
                            <SheetHeader className="pb-4 border-b border-white/10">
                                <SheetTitle className="text-lg font-black uppercase tracking-widest text-foreground">
                                    Navigation
                                </SheetTitle>
                            </SheetHeader>

                            {/* Mobile Navigation Grid */}
                            <nav className="grid grid-cols-3 gap-4 py-6 overflow-y-auto max-h-[calc(70vh-120px)]">
                                {filteredItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300",
                                                isActive
                                                    ? "bg-primary text-white shadow-lg"
                                                    : "bg-white/30 dark:bg-slate-800/30 text-muted-foreground hover:bg-white/60 dark:hover:bg-slate-800/60"
                                            )}
                                        >
                                            <item.icon className="h-6 w-6" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-center">
                                                {item.title}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Logout Button */}
                            <div className="absolute bottom-6 left-4 right-4">
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        signOut({ callbackUrl: "/login" });
                                    }}
                                    className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="font-black text-xs uppercase tracking-widest">
                                        Sign Out
                                    </span>
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </GlassCard>
            </div>
        </>
    );
}

