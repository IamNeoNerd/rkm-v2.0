"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { GlassCard } from "@/components/modern/Card"

interface OverviewChartProps {
    data: { name: string; total: number }[]
}

export function OverviewChart({ data }: OverviewChartProps) {
    return (
        <GlassCard className="col-span-1 lg:col-span-4 p-6" intensity="low">
            <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Growth Analytics
                </h3>
                <h2 className="text-xl font-black text-foreground"> Admissions Overview </h2>
            </div>

            <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                                <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="hsl(var(--border) / 0.5)" />
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
                            tickFormatter={(value) => `${value}`}
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
                            itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 700 }}
                            labelStyle={{ fontWeight: 800, marginBottom: '4px', color: 'hsl(var(--foreground))' }}
                        />
                        <Bar
                            dataKey="total"
                            fill="url(#barGradient)"
                            radius={[8, 8, 0, 0]}
                            barSize={32}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    )
}
