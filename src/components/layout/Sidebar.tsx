"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, GraduationCap, Settings, LogOut, Receipt, UserPlus, UserCog, FileText, History, UsersRound, Calendar } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarNavItem {
    title: string;
    href: string;
    icon: any;
    role?: string;
}

const sidebarNavItems: SidebarNavItem[] = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "New Admission",
        href: "/admission",
        icon: UserPlus,
    },
    {
        title: "Students",
        href: "/students",
        icon: Users,
    },
    {
        title: "Staff",
        href: "/staff",
        icon: UserCog,
    },
    {
        title: "Academics",
        href: "/academics",
        icon: GraduationCap,
    },
    {
        title: "Attendance",
        href: "/attendance",
        icon: Calendar,
    },
    {
        title: "Fee Collection",
        href: "/fees",
        icon: Receipt,
    },
    {
        title: "Bulk Collect",
        href: "/fees/bulk",
        icon: UsersRound,
    },
    {
        title: "Transactions",
        href: "/reports/transactions",
        icon: History,
    },
    {
        title: "Dues Report",
        href: "/reports/dues",
        icon: FileText,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        role: "super-admin"
    },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const userRole = session?.user?.role || "user"

    const filteredItems = sidebarNavItems.filter(item => {
        if (item.role && item.role !== userRole) return false
        return true
    })

    return (
        <div className={cn("flex flex-col h-full bg-slate-900 text-white", className)}>
            <div className="px-6 py-6 border-b border-slate-800">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:opacity-90 transition-opacity">
                    <div className="p-1.5 bg-indigo-500 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span>RK Institute</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Button
                                key={item.href}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start h-11 px-4 mb-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200",
                                    isActive && "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md font-medium"
                                )}
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                                    {item.title}
                                </Link>
                            </Button>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                        {session?.user?.name?.[0]?.toUpperCase() || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {session?.user?.name || "Admin User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {session?.user?.email || "admin@rkinstitute.com"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
