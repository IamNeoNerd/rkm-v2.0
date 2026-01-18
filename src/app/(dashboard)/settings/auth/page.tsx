"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { getAuthSettings, updateAuthSettings, AuthSettings } from "@/actions/auth-settings";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";

import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <SettingsPageLayout
            title="Authentication Settings"
            description="Configure how users log in and access the system."
            icon={Save}
            maxWidth="lg"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <Card>
                        <CardHeader>
                            <CardTitle>Google Authentication</CardTitle>
                            <CardDescription>
                                Configure &quot;Sign in with Google&quot; settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="googleEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Enable Google Login</FormLabel>
                                            <FormDescription>
                                                Allow users to sign in using their Google accounts.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="googleDomains"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Allowed Domains</FormLabel>
                                        <FormControl>
                                            <Input placeholder="example.com, school.edu" {...field} disabled={!form.watch("googleEnabled")} />
                                        </FormControl>
                                        <FormDescription>
                                            Comma-separated list of allowed email domains. Leave empty to allow any Google account.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Security & Access Control</CardTitle>
                            <CardDescription>
                                Manage user verification and access policies.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="autoVerifyStaff"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Auto-verify Staff</FormLabel>
                                            <FormDescription>
                                                Automatically verify users whose email matches a valid Staff member.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="credentialsEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Email/Password Login</FormLabel>
                                            <FormDescription>
                                                Allow users to sign in with an email and password. Disabling this enforces Google Login only.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Form>
        </SettingsPageLayout>
    );
}
