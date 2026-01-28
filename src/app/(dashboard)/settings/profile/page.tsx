"use client";

import { useState } from "react";
import { changePassword } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Eye, EyeOff, ShieldCheck, Zap, Lock } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/modern/Card";
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
            toast.success("Security signatures updated successfully");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } else {
            toast.error(result.error || "Failed to sync new credentials");
        }
    }

    return (
        <SettingsPageLayout
            title="Secret Keys"
            description="Rotate credentials and update security signatures."
            icon={<KeyRound className="h-8 w-8 text-rose-500" />}
            maxWidth="lg"
            showNavigation={false}
            showHeader={false}
        >
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Pulsar Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3">
                            Secret Keys
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            Rotate credentials & security signatures
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                        <Lock className="h-4 w-4 text-rose-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">Protocol: High Encryption</span>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <GlassCard className="p-8 relative overflow-hidden" intensity="high">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                        Current Signature
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="currentPassword"
                                            type={showPasswords ? "text" : "password"}
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            required
                                            className="bg-white/50 border-white/40 h-12 pr-12 focus:ring-rose-500/20 focus:border-rose-500/30 rounded-xl font-mono"
                                            placeholder="••••••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(!showPasswords)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            New Encryption Key
                                        </Label>
                                        <Input
                                            id="newPassword"
                                            type={showPasswords ? "text" : "password"}
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            required
                                            minLength={8}
                                            className="bg-white/50 border-white/40 h-12 focus:ring-rose-500/20 focus:border-rose-500/30 rounded-xl font-mono"
                                            placeholder="MIN 8 CHARS"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Verify New Key
                                        </Label>
                                        <Input
                                            id="confirmPassword"
                                            type={showPasswords ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            required
                                            className="bg-white/50 border-white/40 h-12 focus:ring-rose-500/20 focus:border-rose-500/30 rounded-xl font-mono"
                                            placeholder="CONFIRM KEY"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                size="lg"
                                className="w-full bg-slate-900 border-white/10 hover:bg-slate-800 text-white rounded-xl h-14 shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 animate-pulse text-amber-400" />
                                        <span className="font-black uppercase tracking-widest text-[11px]">Synchronizing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                        <span className="font-black uppercase tracking-widest text-[11px]">Update Security Signatures</span>
                                    </div>
                                )}
                            </Button>
                        </form>
                    </GlassCard>
                </div>

                {/* Security Advisory */}
                <div className="p-8 bg-slate-100/50 border border-white rounded-[32px] max-w-2xl flex gap-6 items-start">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                        <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Security Advisory</h4>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-relaxed italic">
                            Rotating credentials regularly ensures the integrity of the neural network.
                            use a combination of alphanumeric symbols for maximum entropy.
                        </p>
                    </div>
                </div>
            </div>
        </SettingsPageLayout>
    );
}
