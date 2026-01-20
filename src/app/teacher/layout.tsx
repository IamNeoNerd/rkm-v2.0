import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import Link from "next/link";
import {
    Home,
    BookOpen,
    Calendar,
    LogOut,
    GraduationCap
} from "lucide-react";

export default async function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Redirect if not authenticated
    if (!session?.user) {
        redirect("/login");
    }

    if (!session.user.isVerified) {
        redirect("/verify");
    }

    // Only allow teacher role
    if (session.user.role !== "teacher") {
        redirect("/");
    }

    const navItems = [
        { href: "/teacher", icon: Home, label: "Dashboard" },
        { href: "/teacher/batches", icon: BookOpen, label: "My Batches" },
        { href: "/teacher/attendance", icon: Calendar, label: "Attendance" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
            {/* Header */}
            <header className="sticky top-0 z-10 backdrop-blur-md bg-slate-900/70 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">Teacher Portal</h1>
                                <p className="text-xs text-slate-400">Welcome, {session.user.name}</p>
                            </div>
                        </div>
                        <form action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/login" });
                        }}>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="border-b border-slate-700/50 bg-slate-800/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-1 overflow-x-auto py-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors whitespace-nowrap"
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-700 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-400 text-sm">
                    © 2026 RK Institute • Teacher Portal
                </div>
            </footer>
        </div>
    );
}
