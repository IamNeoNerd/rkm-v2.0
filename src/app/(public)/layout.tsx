import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check if user is authenticated and verified - redirect to dashboard
    const session = await auth();

    if (session?.user?.isVerified) {
        // Verified users go to their appropriate portal
        const role = session.user.role;
        if (role === "super-admin" || role === "admin") {
            redirect("/");
        } else if (role === "teacher") {
            redirect("/teacher");
        } else if (role === "cashier") {
            redirect("/cashier");
        } else if (role === "parent") {
            redirect("/parent");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
            {/* Header */}
            <header className="sticky top-0 z-10 backdrop-blur-md bg-slate-900/70 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">RK</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">RK Institute</h1>
                                <p className="text-xs text-slate-400">Coaching & Tuition</p>
                            </div>
                        </div>
                        <a
                            href="/login"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Login
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-700 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-400 text-sm">
                    © 2026 RK Institute. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
