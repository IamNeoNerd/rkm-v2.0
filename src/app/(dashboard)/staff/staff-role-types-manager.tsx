"use client";

import { useState, useEffect, useCallback } from "react";
import { getStaffRoleTypes, createStaffRoleType, deleteStaffRoleType } from "@/actions/staff-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Shield, Cpu, Tag, Trash2, Hash } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/modern/Card";

interface RoleType {
    id: number;
    name: string;
}

export function StaffRoleTypesManager() {
    const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
    const [newName, setNewName] = useState("");
    const [loading, setLoading] = useState(false);
    const [showManager, setShowManager] = useState(false);

    const loadRoleTypes = useCallback(async () => {
        const res = await getStaffRoleTypes();
        if (res.success && res.roleTypes) {
            setRoleTypes(res.roleTypes);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadRoleTypes();
        };
        init();
    }, [loadRoleTypes]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setLoading(true);
        const res = await createStaffRoleType({ name: newName.trim() });
        setLoading(false);
        if (res.success) {
            toast.success("Role signature registered");
            setNewName("");
            loadRoleTypes();
        } else {
            toast.error(res.error || "Signature registration failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to evoke this role signature?")) return;
        const res = await deleteStaffRoleType(id);
        if (res.success) {
            toast.success("Role signature revoked");
            loadRoleTypes();
        } else {
            toast.error(res.error || "Revocation failed");
        }
    };

    if (!showManager) {
        return (
            <Button
                variant="outline"
                onClick={() => setShowManager(true)}
                className="rounded-xl border-dashed border-slate-300 h-12 px-6 hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
            >
                <Tag className="mr-2 h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">
                    Configure Role Vectors
                </span>
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
            <GlassCard className="w-full max-w-2xl border-white/20 p-0 overflow-hidden rounded-[40px] shadow-2xl" intensity="high">
                <div className="p-8 pb-6 border-b border-white/20 flex items-center justify-between bg-white/40">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Role Architect</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Functional Signature Management</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowManager(false)} className="rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* New Role Matrix */}
                    <form onSubmit={handleAdd} className="flex gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl relative group">
                        <div className="flex-1 relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                            <Input
                                placeholder="ENTER NEW ROLE SIGNATURE (e.g. DRIVER, SECURITY)..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="pl-12 h-14 bg-white/50 border-white rounded-xl font-black uppercase text-[10px] tracking-widest focus:ring-indigo-500/20"
                            />
                        </div>
                        <Button
                            disabled={loading}
                            type="submit"
                            className="h-14 px-8 bg-slate-900 text-white rounded-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group/btn"
                        >
                            <Plus className="mr-2 h-4 w-4 group-hover/btn:rotate-90 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deploy</span>
                        </Button>
                    </form>

                    {/* Active Signatures Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {roleTypes.length > 0 ? (
                            roleTypes.map((rt) => (
                                <div key={rt.id} className="group relative">
                                    <div className="absolute inset-0 bg-indigo-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                    <div className="relative p-4 bg-white/60 border border-white/80 rounded-2xl flex items-center justify-between group-hover:border-indigo-200 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-indigo-500 font-black">
                                                <Hash className="h-3 w-3" />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{rt.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(rt.id)}
                                            className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                                <Shield className="h-12 w-12 text-slate-300 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Custom Vectors Found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 bg-slate-950 flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <Cpu className="h-5 w-5 text-indigo-400 animate-pulse" />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed italic opacity-80">
                        [Protocol] role signatures are operational anchors. removing a signature will not affect existing personnel but will prevent future assignments.
                    </p>
                </div>
            </GlassCard>
        </div>
    );
}
