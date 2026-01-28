"use client";

import { GlassCard } from "@/components/modern/Card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartData {
    name: string;
    total?: number;
    value?: number;
    [key: string]: string | number | undefined | null;
}

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export function TeacherLoadChart({ data }: { data: ChartData[] }) {
    return (
        <GlassCard className="p-8 h-[400px] flex flex-col" intensity="medium">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Personnel Node (Teaching Load)</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            hide={false}
                            width={100}
                            tick={{ fontSize: 10, fontWeight: 900 }}
                            className="uppercase"
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                        />
                        <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}

export function BatchActivityChart({ data }: { data: ChartData[] }) {
    return (
        <GlassCard className="p-8 h-[400px] flex flex-col" intensity="medium">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Instructional Node (Activity Index)</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 9, fontWeight: 900 }}
                            className="uppercase"
                        />
                        <YAxis tick={{ fontSize: 10, fontWeight: 900 }} />
                        <Tooltip
                            cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: 'none' }}
                        />
                        <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}

export function SettlementMaturityChart({ data }: { data: ChartData[] }) {
    return (
        <GlassCard className="p-8 h-[400px] flex flex-col" intensity="medium">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Financial Pulse (Settlement Mode)</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: 'none' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
                {data.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{entry.name}</span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}

export function EngagementLeaderboard({ data }: { data: ChartData[] }) {
    return (
        <GlassCard className="p-8 h-[400px] flex flex-col" intensity="medium">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Engagement Node (Performance Proxy)</h3>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {data.map((student, index) => (
                        <div key={student.name} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black border",
                                    index === 0 ? "bg-amber-50 text-amber-600 border-amber-100" :
                                        index === 1 ? "bg-slate-50 text-slate-500 border-slate-100" :
                                            index === 2 ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                "bg-white text-slate-400 border-slate-100"
                                )}>
                                    {index + 1}
                                </div>
                                <span className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-primary transition-colors">{student.name}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-slate-900 font-mono italic">{student.total}%</span>
                                <div className="w-24 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000"
                                        style={{ width: `${student.total}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div className="text-center py-20 opacity-30 text-xs font-black uppercase tracking-widest">No Participation Data</div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}
