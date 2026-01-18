import { Sidebar } from "@/components/layout/Sidebar"
import { MobileNav } from "@/components/layout/MobileNav"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { CommandPalette } from "@/components/CommandPalette"
import { NotificationBell } from "@/components/NotificationBell"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar: Desktop only (Large screens+) */}
            <div className="hidden border-r bg-white lg:block lg:w-72 fixed h-full z-10">
                <Sidebar className="h-full" />
            </div>

            <div className="flex flex-1 flex-col lg:pl-72 w-full">
                {/* Header: Mobile & Tablet */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">
                    <div className="flex items-center gap-2">
                        <MobileNav />
                        <span className="font-semibold text-lg text-indigo-600">RK Institute ERP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <CommandPalette />
                    </div>
                </header>

                {/* Header: Desktop - Just command palette */}
                <header className="hidden lg:flex sticky top-0 z-20 h-14 items-center justify-end border-b bg-white px-6 gap-3">
                    <NotificationBell />
                    <CommandPalette />
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    )
}

