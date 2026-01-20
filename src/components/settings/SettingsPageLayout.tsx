"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SettingsPageLayoutProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    icon: React.ReactNode;
    showHeader?: boolean;
    maxWidth?: "md" | "lg" | "xl" | "none";
}

export function SettingsPageLayout({
    children,
    title,
    description,
    icon,
    showHeader = true,
    maxWidth = "xl"
}: SettingsPageLayoutProps) {
    const maxWidthClasses = {
        md: "max-w-md",
        lg: "max-w-4xl",
        xl: "max-w-7xl",
        none: "max-w-full"
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className={cn("mx-auto space-y-6", maxWidthClasses[maxWidth])}>
                {/* Navigation & Breadcrumbs */}
                <div className="flex flex-col gap-4">
                    <Link href="/settings">
                        <Button variant="ghost" size="sm" className="-ml-3 text-slate-600 hover:text-indigo-600">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Settings
                        </Button>
                    </Link>

                    <nav className="flex items-center text-sm text-slate-500 font-medium">
                        <Link href="/settings" className="hover:text-indigo-600 transition-colors">
                            Settings
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />
                        <span className="text-slate-900">{title}</span>
                    </nav>
                </div>

                {showHeader && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                {icon}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
                                {description && (
                                    <p className="text-slate-500 mt-1">{description}</p>
                                )}
                            </div>
                        </div>
                        <Separator />
                    </div>
                )}

                {/* Page Content */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {children}
                </div>
            </div>
        </div>
    );
}
