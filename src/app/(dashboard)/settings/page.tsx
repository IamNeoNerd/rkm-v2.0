import {
    Users,
    Settings as SettingsIcon,
    Database,
    Key,
    ChevronRight,
    IndianRupee,
    Calendar,
    History,
    Bell
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await auth();

    // Fallback protection just in case middleware is bypassed
    if (session?.user?.role !== "super-admin") {
        redirect("/");
    }

    const sections = [
        {
            title: "User Management",
            description: "Control access and assign administrative roles.",
            href: "/settings/users",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Fee Structure",
            description: "Configure class-wise monthly and admission fees.",
            href: "/settings/fees",
            icon: IndianRupee,
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            title: "Academic Sessions",
            description: "Manage academic years and session periods.",
            href: "/settings/sessions",
            icon: Calendar,
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            title: "Activity Logs",
            description: "View transaction history and audit trail.",
            href: "/settings/audit-logs",
            icon: History,
            color: "text-orange-600",
            bgColor: "bg-orange-50"
        },
        {
            title: "Change Password",
            description: "Update your account password.",
            href: "/settings/profile",
            icon: Key,
            color: "text-rose-600",
            bgColor: "bg-rose-50"
        },
        {
            title: "Authentication",
            description: "Manage security settings and OAuth providers.",
            href: "/settings/auth",
            icon: Key,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50"
        },
        {
            title: "Notifications",
            description: "Control communication preferences and alerts.",
            href: "/settings/notifications",
            icon: Bell,
            color: "text-amber-600",
            bgColor: "bg-amber-50"
        },
        {
            title: "Database & Backups",
            description: "Configure data retention and backup schedules.",
            href: "#",
            icon: Database,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            comingSoon: true
        }
    ];

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <SettingsIcon className="h-8 w-8 text-indigo-600" />
                    System Settings
                </h1>
                <p className="text-gray-600 mt-1">Configure your ERP system parameters and access controls.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => {
                    const Content = (
                        <div className="flex items-start gap-4">
                            <div className={`${section.bgColor} p-3 rounded-xl ${section.color}`}>
                                <section.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {section.title}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                    {section.description}
                                </p>
                            </div>
                            {!section.comingSoon && <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />}
                        </div>
                    );

                    if (section.comingSoon) {
                        return (
                            <div
                                key={section.title}
                                className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm opacity-60 cursor-not-allowed"
                            >
                                {Content}
                                <div className="absolute top-4 right-4 capitalize text-[10px] font-bold tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                    Coming Soon
                                </div>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={section.title}
                            href={section.href}
                            className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            {Content}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
