
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"
import { GlassCard } from "@/components/modern/Card"

interface RevenueChartProps {
    data: { name: string; total: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#f5f3ff'];

    return (
        <GlassCard className="col-span-1 lg:col-span-7 p-6" intensity="low">
            <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-cta ml-1">
                    Financial Performance
                </h3>
                <h2 className="text-xl font-black text-foreground"> Revenue Collected </h2>
            </div>

            <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                        <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            fontWeight={600}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            fontWeight={600}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value}`}
                            dx={-10}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--primary) / 0.05)', radius: 8 }}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(12px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: number | string | undefined) => [`₹${Number(value || 0).toLocaleString()}`, "Revenue"]}
                            itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 700 }}
                            labelStyle={{ fontWeight: 800, marginBottom: '4px', color: 'hsl(var(--foreground))' }}
                        />
                        <Bar
                            dataKey="total"
                            radius={[8, 8, 0, 0]}
                            barSize={40}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    )
}
