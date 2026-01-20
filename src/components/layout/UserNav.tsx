"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function UserNav() {
    const { data: session } = useSession();

    if (!session) return null;

    const initials = session.user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U";

    return (
        <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-1">
                <p className="text-xs font-bold text-slate-900 leading-tight">{session.user?.name}</p>
                <p className="text-[10px] text-slate-500 leading-tight capitalize">{session.user?.role}</p>
            </div>
            <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                <AvatarFallback className="bg-indigo-600 text-white font-bold">{initials}</AvatarFallback>
            </Avatar>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sign Out"
            >
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
    );
}
