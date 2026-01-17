import { GraduationCap } from "lucide-react";

export default function ParentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Simple Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-indigo-900">RK Institute</h1>
                        <p className="text-xs text-indigo-600">Parent Portal</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-sm text-gray-500">
                <p>© 2026 RK Institute. For queries, contact the office.</p>
            </footer>
        </div>
    );
}
