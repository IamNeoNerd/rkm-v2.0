"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
    ChevronDown,
    IndianRupee,
    TrendingUp,
    Shield,
    Bell,
    Key,
    User
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarNavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    role?: string;
    children?: SidebarNavItem[];
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
        title: "Families",
        href: "/families",
        icon: UsersRound,
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
        title: "Billing",
        href: "/fees",
        icon: IndianRupee,
        children: [
            {
                title: "Collect Fee",
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
                title: "Finance Report",
                href: "/reports/finance",
                icon: TrendingUp,
            },
        ]
    },
    {
        title: "Staff",
        href: "/staff",
        icon: UserCog,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        role: "super-admin",
        children: [
            {
                title: "User Management",
                href: "/settings/users",
                icon: UsersRound,
            },
            {
                title: "Fee Structure",
                href: "/settings/fees",
                icon: IndianRupee,
            },
            {
                title: "Academic Sessions",
                href: "/settings/sessions",
                icon: Calendar,
            },
            {
                title: "Authentication",
                href: "/settings/auth",
                icon: Shield,
            },
            {
                title: "Activity Logs",
                href: "/settings/audit-logs",
                icon: History,
            },
            {
                title: "Notifications",
                href: "/settings/notifications",
                icon: Bell,
            },
            {
                title: "My Profile",
                href: "/settings/profile",
                icon: User,
            },
        ]
    },
]

type SidebarProps = React.HTMLAttributes<HTMLDivElement>

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const userRole = session?.user?.role || "user"

    // Track which groups are expanded
    const [expandedGroups, setExpandedGroups] = useState<string[]>([])

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        )
    }

    const filteredItems = sidebarNavItems.filter(item => {
        if (item.role && item.role !== userRole) return false
        return true
    })

    const renderNavItem = (item: SidebarNavItem, isChild = false) => {
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedGroups.includes(item.title)
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        const isChildActive = hasChildren && item.children?.some(
            child => pathname === child.href || (child.href !== '/' && pathname.startsWith(child.href))
        )

        if (hasChildren) {
            return (
                <div key={item.title}>
                    <button
                        onClick={() => toggleGroup(item.title)}
                        className={cn(
                            "w-full flex items-center justify-between h-11 px-4 mb-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200",
                            (isChildActive) && "bg-slate-800 text-white"
                        )}
                    >
                        <div className="flex items-center">
                            <item.icon className={cn("mr-3 h-5 w-5", isChildActive ? "text-indigo-400" : "text-slate-400")} />
                            {item.title}
                        </div>
                        <ChevronDown className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isExpanded ? "rotate-180" : ""
                        )} />
                    </button>

                    {/* Submenu */}
                    <div className={cn(
                        "overflow-hidden transition-all duration-200",
                        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}>
                        <div className="pl-4 space-y-1 py-1">
                            {item.children?.map(child => renderNavItem(child, true))}
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <Button
                key={item.href}
                variant="ghost"
                className={cn(
                    "w-full justify-start h-10 px-4 mb-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200",
                    isChild && "h-9 text-sm",
                    isActive && "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md font-medium"
                )}
                asChild
            >
                <Link href={item.href}>
                    <item.icon className={cn(
                        "mr-3",
                        isChild ? "h-4 w-4" : "h-5 w-5",
                        isActive ? "text-white" : "text-slate-400"
                    )} />
                    {item.title}
                </Link>
            </Button>
        )
    }

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
                    {filteredItems.map((item) => renderNavItem(item))}
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
