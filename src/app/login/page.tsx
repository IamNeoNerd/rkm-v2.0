"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Loader2, Phone, User, Shield, GraduationCap, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { lookupFamilyByPhone } from "@/actions/parent";

type LoginTab = "admin" | "parent" | "staff";

function LoginFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [activeTab, setActiveTab] = useState<LoginTab>("admin");

    // Admin login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Parent login state
    const [phone, setPhone] = useState("");

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid credentials");
            } else {
                toast.success("Logged in successfully");
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleParentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setIsLoading(true);
        const result = await lookupFamilyByPhone(phone);
        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
            return;
        }

        if (result.family) {
            sessionStorage.setItem("parentFamilyId", result.family.id.toString());
            sessionStorage.setItem("parentFamilyName", result.family.fatherName);
            toast.success(`Welcome, ${result.family.fatherName}!`);
            router.push("/parent/dashboard");
        }
    };

    const tabs = [
        { id: "admin" as const, label: "Admin", icon: Shield },
        { id: "parent" as const, label: "Parent", icon: User },
        { id: "staff" as const, label: "Staff", icon: GraduationCap },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-full mb-4">
                    <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">RK Institute</h1>
                <p className="text-gray-500 mt-1">Sign in to continue</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Admin Login Form */}
            {activeTab === "admin" && (
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email Address
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

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password
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
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <LogIn className="mr-2 h-4 w-4" />
                        )}
                        Sign In
                    </Button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">or</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        disabled={isLoading}
                        className="w-full"
                        onClick={() => signIn("google", { callbackUrl })}
                    >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                        </svg>
                        Sign in with Google
                    </Button>

                    <p className="text-center text-xs text-gray-500 mt-4">
                        Demo: <span className="text-indigo-600">admin@rkinstitute.com</span> / <span className="text-indigo-600">admin123</span>
                    </p>
                </form>
            )}

            {/* Parent Login Form */}
            {activeTab === "parent" && (
                <form onSubmit={handleParentSubmit} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-700">
                            Enter your registered phone number to view your child&apos;s details and fee status.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Registered Phone Number
                        </label>
                        <div className="relative">
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                placeholder="9876543210"
                                maxLength={10}
                                className="pl-12"
                                required
                                disabled={isLoading}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                +91
                            </span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || phone.length !== 10}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Phone className="mr-2 h-4 w-4" />
                                View Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>

                    <p className="text-center text-xs text-gray-500 mt-4">
                        Can&apos;t find your account? Contact the institute office.
                    </p>
                </form>
            )}

            {/* Staff Login Form (Placeholder) */}
            {activeTab === "staff" && (
                <div className="text-center py-8">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-amber-700">
                            Staff portal with OTP login is coming soon.
                        </p>
                    </div>

                    <p className="text-gray-600 text-sm">
                        For now, staff members can use the Admin login if they have admin credentials.
                    </p>

                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveTab("admin")}
                    >
                        Go to Admin Login
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <Suspense fallback={<div className="text-center">Loading...</div>}>
                <LoginFormContent />
            </Suspense>
        </div>
    );
}
