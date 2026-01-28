"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { GlassCard } from "@/components/modern/Card";
import { LogIn, Loader2, Phone, User, Shield, GraduationCap, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type LoginTab = "admin" | "parent" | "staff" | "student";

function LoginFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get("callbackUrl") || "/";
    const error = searchParams?.get("error");

    const [activeTab, setActiveTab] = useState<LoginTab>("admin");

    // Admin login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle auth errors
    useEffect(() => {
        if (error) {
            if (error === "CredentialsSignin") {
                toast.error("Invalid email or password");
            } else {
                toast.error("An error occurred during login");
            }
            router.replace("/login", { scroll: false });
        }
    }, [error, router]);

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                identifier: email,
                password: password,
                redirect: false,
                callbackUrl: callbackUrl,
            });

            if (result?.error) {
                toast.error("Invalid email or password");
                setIsLoading(false);
            } else if (result?.ok) {
                toast.success("Login successful!");
                router.push(callbackUrl);
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: "admin" as const, label: "Admin", icon: Shield },
        { id: "student" as const, label: "Student", icon: User },
        { id: "parent" as const, label: "Parent", icon: Phone },
        { id: "staff" as const, label: "Staff", icon: GraduationCap },
    ];

    return (
        <GlassCard className="w-full max-w-md overflow-hidden border-white/30 backdrop-blur-2xl">
            {/* Top Branding Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-cta to-primary opacity-80" />

            <div className="p-8">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4 group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500" />
                        <div className="relative bg-gradient-to-br from-primary to-secondary p-4 rounded-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                            <GraduationCap className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                        RK Institute <span className="text-primary">3.0</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm font-medium">Welcome back, please select your portal</p>
                </div>

                {/* Modern Tabs */}
                <div className="flex bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-1.5 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-slate-700 text-primary shadow-xl scale-100"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/30"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Forms Area */}
                <div className="min-h-[320px]">
                    {/* Admin Login Form */}
                    {activeTab === "admin" && (
                        <form onSubmit={handleAdminSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Admin Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@rkinstitute.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Security Key
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full"
                                size="lg"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <LogIn className="mr-2 h-5 w-5" />
                                )}
                                Unlock Dashboard
                            </Button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-transparent px-3 text-muted-foreground font-bold uppercase tracking-widest">or secure with</span>
                                </div>
                            </div>

                            <Button
                                variant="glass"
                                type="button"
                                disabled={isLoading}
                                className="w-full border-white/50 dark:border-slate-800"
                                onClick={() => signIn("google", { callbackUrl })}
                            >
                                <svg className="mr-2 h-5 w-5" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                </svg>
                                Google Auth
                            </Button>

                            <p className="text-center text-[10px] text-muted-foreground/80 mt-6 font-mono">
                                DEMO: admin@rkinstitute.com / admin123
                            </p>
                        </form>
                    )}

                    {/* Parent Login Form */}
                    {activeTab === "parent" && (
                        <form onSubmit={handleAdminSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                                <p className="text-sm text-primary font-medium flex gap-3 items-start">
                                    <ArrowRight className="h-4 w-4 mt-1 shrink-0" />
                                    Access child growth metrics and fee statements using your credentials.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="parent-phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Registered Mobile
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10 border-r border-border pr-3">
                                        <span className="text-muted-foreground font-bold text-sm tracking-tight">+91</span>
                                    </div>
                                    <Input
                                        id="parent-phone"
                                        type="tel"
                                        value={email} // Reusing email state for identifier
                                        onChange={(e) => setEmail(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                        placeholder="9876543210"
                                        maxLength={10}
                                        className="pl-20 h-14 text-lg tracking-[0.2em] font-bold"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="parent-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Access Key
                                </label>
                                <Input
                                    id="parent-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    className="border-primary/20 focus:border-primary"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || email.length !== 10}
                                className="w-full"
                                variant="cta"
                                size="lg"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Phone className="mr-2 h-5 w-5" />
                                        Launch Portal
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground mt-8 p-4 border border-dashed border-border rounded-xl">
                                Trouble logging in? Reach out to support.
                            </p>
                        </form>
                    )}

                    {/* Student Login Form */}
                    {activeTab === "student" && (
                        <form onSubmit={handleAdminSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                                <p className="text-sm text-indigo-600 font-medium flex gap-3 items-start">
                                    <GraduationCap className="h-4 w-4 mt-1 shrink-0" />
                                    Review your academic progress and batch details using your student ID.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="student-id" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Student ID (6-Digits)
                                </label>
                                <Input
                                    id="student-id"
                                    type="text"
                                    value={email} // Using email state for identifier to reuse handleAdminSubmit
                                    onChange={(e) => setEmail(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000123"
                                    maxLength={6}
                                    required
                                    disabled={isLoading}
                                    className="border-indigo-500/20 focus:border-indigo-500 font-mono tracking-[0.2em] text-lg text-center"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="student-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Access Key
                                </label>
                                <Input
                                    id="student-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    className="border-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || email.length !== 6}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                                size="lg"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <LogIn className="mr-2 h-5 w-5" />
                                )}
                                Enter Portal
                            </Button>

                            <p className="text-center text-[10px] text-muted-foreground/80 mt-6 font-mono">
                                Use your 6-digit identifier and password provided by the office.
                            </p>
                        </form>
                    )}

                    {/* Staff Login Form */}
                    {activeTab === "staff" && (
                        <form onSubmit={handleAdminSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-cta/5 border border-cta/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                                <p className="text-sm text-cta font-medium flex gap-3 items-start">
                                    <Shield className="h-4 w-4 mt-1 shrink-0" />
                                    Access the instructional matrix and batch telemetry using your staff credentials.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="staff-phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Mobile Identifier
                                </label>
                                <Input
                                    id="staff-phone"
                                    type="tel"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="9000000011"
                                    maxLength={10}
                                    required
                                    disabled={isLoading}
                                    className="border-cta/20 focus:border-cta font-mono tracking-wider"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="staff-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Master Key
                                </label>
                                <Input
                                    id="staff-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    className="border-cta/20 focus:border-cta"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-cta hover:bg-cta-foreground shadow-lg shadow-cta/20"
                                size="lg"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Shield className="mr-2 h-5 w-5" />
                                )}
                                Initialize Terminal
                            </Button>

                            <p className="text-center text-[10px] text-muted-foreground/80 mt-6 font-mono">
                                Role-based access logic applies automatically.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Dynamic visual complexity for the landing */}
            <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[25rem] h-[25rem] bg-cta/5 rounded-full blur-[100px] animate-pulse delay-700" />

            <Suspense fallback={<div className="flex items-center gap-3 font-bold text-primary animate-pulse"><Loader2 className="h-6 w-6 animate-spin" /> ENCRYPTING...</div>}>
                <LoginFormContent />
            </Suspense>

            {/* Premium Footer Links */}
            <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
                <p className="text-muted-foreground text-sm font-medium">
                    New to the platform?{" "}
                    <a href="/browse" className="text-primary hover:text-primary/80 hover:underline transition-all underline-offset-4 decoration-2">
                        Explore Courses
                    </a>
                </p>
                <div className="mt-8 flex items-center justify-center gap-6 opacity-30 hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[10px] uppercase tracking-widest font-black text-foreground">RKM 3.0</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-border" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-foreground">ENCRYPTED</span>
                </div>
            </div>
        </div>
    );
}
