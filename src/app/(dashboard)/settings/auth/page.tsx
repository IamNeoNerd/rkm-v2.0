"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Shield, ShieldCheck, Globe, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAuthSettings, updateAuthSettings, AuthSettings } from "@/actions/auth-settings";

import { Button } from "@/components/modern/Button";
import { Input } from "@/components/modern/Input";
import { GlassCard } from "@/components/modern/Card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

const authFormSchema = z.object({
    googleEnabled: z.boolean(),
    googleDomains: z.string().optional(),
    autoVerifyStaff: z.boolean(),
    credentialsEnabled: z.boolean(),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

export default function AuthSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<AuthFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(authFormSchema) as any,
        defaultValues: {
            googleEnabled: true,
            googleDomains: "",
            autoVerifyStaff: true,
            credentialsEnabled: true,
        },
    });

    useEffect(() => {
        async function loadSettings() {
            try {
                const result = await getAuthSettings();
                if (result.success) {
                    form.reset({
                        googleEnabled: result.settings.googleEnabled,
                        googleDomains: result.settings.googleDomains.join(", "),
                        autoVerifyStaff: result.settings.autoVerifyStaff,
                        credentialsEnabled: result.settings.credentialsEnabled,
                    });
                } else {
                    toast.error(result.error || "Failed to load settings");
                }
            } catch (error) {
                console.error(error);
                toast.error("An error occurred while loading settings");
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, [form]);

    const onSubmit: SubmitHandler<AuthFormValues> = async (data) => {
        setIsSaving(true);
        try {
            const settings: AuthSettings = {
                googleEnabled: data.googleEnabled,
                googleDomains: data.googleDomains
                    ? data.googleDomains.split(",").map((d) => d.trim()).filter(Boolean)
                    : [],
                autoVerifyStaff: data.autoVerifyStaff,
                credentialsEnabled: data.credentialsEnabled,
            };

            const result = await updateAuthSettings(settings);

            if (result.success) {
                toast.success("Authentication settings updated successfully");
            } else {
                toast.error(result.error || "Failed to update settings");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving settings");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="h-12 bg-slate-200 rounded-2xl w-1/3 opacity-50" />
                <div className="h-64 bg-slate-100 rounded-3xl" />
                <div className="h-64 bg-slate-100 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3 font-satoshi">
                        Auth Protocol
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Identity Verification & Access Governance
                    </p>
                </div>
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Security Layer Active</span>
                </div>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Google OAuth Section */}
                    <GlassCard className="p-10 relative overflow-hidden" intensity="high">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                                <Globe className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Social Sync</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">OAuth 2.0 Configuration</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <FormField
                                control={form.control}
                                name="googleEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between p-6 rounded-2xl bg-white/40 border border-white/20 transition-all hover:bg-white/60">
                                        <div className="space-y-1">
                                            <FormLabel className="text-sm font-black text-slate-900 uppercase tracking-tight">Enable Google Login</FormLabel>
                                            <FormDescription className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                                Allow users to hydrate identity via Google accounts.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="googleDomains"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center justify-between ml-1">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Allowed Environments (Domains)</FormLabel>
                                            <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-400 uppercase">Input Array</div>
                                        </div>
                                        <FormControl>
                                            <Input
                                                placeholder="example.com, rkinstitute.com"
                                                {...field}
                                                disabled={!form.watch("googleEnabled")}
                                                className="h-14 text-base font-bold bg-white/50 border-white/30 backdrop-blur-sm"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-[10px] font-medium text-slate-400 flex items-start gap-2 pt-1">
                                            <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-amber-500" />
                                            <span>Enter comma-separated domains. Global access if left null.</span>
                                        </FormDescription>
                                        <FormMessage className="text-[10px] font-black uppercase tracking-widest text-red-500" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </GlassCard>

                    {/* Security & Policy Section */}
                    <GlassCard className="p-10 relative overflow-hidden" intensity="high">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Access Policy</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verification & Persistence</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="autoVerifyStaff"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between p-6 rounded-2xl bg-white/40 border border-white/20 transition-all hover:bg-white/60">
                                        <div className="space-y-1">
                                            <FormLabel className="text-sm font-black text-slate-900 uppercase tracking-tight">Autonomous Verification</FormLabel>
                                            <FormDescription className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                                Instantly validate entities matching Staff signatures.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-emerald-500"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="credentialsEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between p-6 rounded-2xl bg-white/40 border border-white/20 transition-all hover:bg-white/60">
                                        <div className="space-y-1">
                                            <FormLabel className="text-sm font-black text-slate-900 uppercase tracking-tight">Traditional Credentials</FormLabel>
                                            <FormDescription className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                                Permit Email/Password ingestion (OAuth bypass).
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </GlassCard>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            variant="primary"
                            className="h-14 px-10 text-[12px] font-black uppercase tracking-[0.2em] gap-3 shadow-2xl"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Commit Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
