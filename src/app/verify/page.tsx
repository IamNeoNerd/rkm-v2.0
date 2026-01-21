import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut, Clock, Mail, GraduationCap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VerifyPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    if (session.user.isVerified) {
        redirect("/");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-amber-50 rounded-full">
                        <ShieldAlert className="h-10 w-10 text-amber-500" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900">Account Pending</h1>
                        <p className="text-slate-500">
                            Welcome, <span className="font-semibold text-slate-700">{session.user.name}</span>.
                            Your account is currently waiting for verification.
                        </p>
                    </div>

                    <div className="w-full space-y-4 py-4">
                        <div className="flex items-start gap-4 text-left p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <Clock className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Manual Verification</p>
                                <p className="text-xs text-slate-500">A super-admin will review your access request shortly.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-left p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <Mail className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Auto-Matching</p>
                                <p className="text-xs text-slate-500">If your email matches our staff records, access will be granted automatically on next login.</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full pt-4 space-y-3">
                        <Link
                            href="/browse"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <GraduationCap className="h-4 w-4" />
                            Browse Available Courses
                        </Link>

                        <form action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/login" });
                        }}>
                            <Button variant="outline" className="w-full flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
                                <LogOut className="h-4 w-4" />
                                Sign out & try another account
                            </Button>
                        </form>

                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                            RK Institute ERP • Production
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
