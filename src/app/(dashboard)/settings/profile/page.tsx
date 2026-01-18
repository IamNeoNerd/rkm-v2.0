"use client";

import { useState } from "react";
import { changePassword } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";

export default function ProfileSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const result = await changePassword(formData);

        setLoading(false);

        if (result.success) {
            toast.success("Password changed successfully");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } else {
            toast.error(result.error || "Failed to change password");
        }
    }

    return (
        <SettingsPageLayout
            title="Change Password"
            description="Update your account password"
            icon={KeyRound}
            maxWidth="lg"
        >
            <div className="bg-white rounded-lg shadow-md p-6 max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showPasswords ? "text" : "password"}
                                value={formData.currentPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                required
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type={showPasswords ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                            minLength={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type={showPasswords ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? "Changing..." : "Change Password"}
                    </Button>
                </form>
            </div>
        </SettingsPageLayout>
    );
}
