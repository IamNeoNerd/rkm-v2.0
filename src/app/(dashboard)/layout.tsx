import { ErrorBoundary } from "@/components/ErrorBoundary"
import { SkipLink } from "@/components/SkipLink"
import { FloatingNav } from "@/components/modern/FloatingNav";
import { TopBar } from "@/components/modern/TopBar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
            {/* Skip link for keyboard accessibility */}
            <SkipLink />

            {/* Premium Floating Navigation */}
            <FloatingNav />

            {/* Premium Top Navigation Bar */}
            <TopBar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col transition-all duration-500">
                <main
                    id="main-content"
                    className="flex-1 w-full pt-16 lg:pl-32 pr-4 md:pr-8 min-h-screen"
                    role="main"
                    tabIndex={-1}
                >
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Subtle Decorative Footer */}
                <footer className="py-12 lg:pl-32 pr-4 md:pr-8 opacity-20 hover:opacity-100 transition-opacity duration-700">
                    <div className="max-w-7xl mx-auto flex justify-between items-center border-t border-border pt-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground"> RKM 3.0 // PULSAR PHASE </p>
                        <div className="flex gap-4">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                            <span className="h-1.5 w-1.5 rounded-full bg-cta" />
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

