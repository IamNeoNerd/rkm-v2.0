"use client";

import { useState, useEffect, useCallback } from "react";
import { getDuesAgingReport } from "@/actions/reports";
import { AlertTriangle, Clock, TrendingDown, Users, Download, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { exportToCSV, formatDateForExport } from "@/lib/export-utils";

type AgingBucket = '0-30' | '31-60' | '61-90' | '90+';

interface ReportItem {
    id: number;
    fatherName: string;
    phone: string;
    dueAmount: number;
    daysSincePayment: number;
    agingBucket: AgingBucket;
    lastPaymentDate: Date | null;
}

interface Summary {
    '0-30': { count: number; total: number };
    '31-60': { count: number; total: number };
    '61-90': { count: number; total: number };
    '90+': { count: number; total: number };
}

export default function DuesAgingReportPage() {
    const [report, setReport] = useState<ReportItem[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [totalDue, setTotalDue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<AgingBucket | 'all'>('all');

    const loadReport = useCallback(async () => {
        const result = await getDuesAgingReport();
        if (result.success) {
            setReport(result.report || []);
            setSummary(result.summary || null);
            setTotalDue(result.totalDue || 0);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadReport();
        };
        init();
    }, [loadReport]);

    const filteredReport = filter === 'all'
        ? report
        : report.filter(r => r.agingBucket === filter);

    const bucketColors: Record<AgingBucket, string> = {
        '0-30': 'bg-green-100 text-green-800 border-green-200',
        '31-60': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        '61-90': 'bg-orange-100 text-orange-800 border-orange-200',
        '90+': 'bg-red-100 text-red-800 border-red-200',
    };

    const bucketIcons: Record<AgingBucket, typeof Clock> = {
        '0-30': Clock,
        '31-60': TrendingDown,
        '61-90': AlertTriangle,
        '90+': AlertTriangle,
    };

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingDown className="h-7 w-7 text-red-600" />
                        Outstanding Dues Aging
                    </h1>
                    <p className="text-gray-600 mt-1">Track overdue payments by age</p>
                </div>

                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => exportToCSV(filteredReport, 'dues_report', [
                        { key: 'fatherName', label: 'Family Name' },
                        { key: 'phone', label: 'Phone' },
                        { key: 'dueAmount', label: 'Due Amount' },
                        { key: 'daysSincePayment', label: 'Days Overdue' },
                        { key: 'agingBucket', label: 'Aging Bucket' },
                        { key: 'lastPaymentDate', label: 'Last Payment' },
                    ])}
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    {(['0-30', '31-60', '61-90', '90+'] as AgingBucket[]).map((bucket) => {
                        const Icon = bucketIcons[bucket];
                        const isActive = filter === bucket;
                        return (
                            <button
                                key={bucket}
                                onClick={() => setFilter(filter === bucket ? 'all' : bucket)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${isActive
                                    ? bucketColors[bucket] + ' ring-2 ring-offset-2 ring-gray-400'
                                    : 'bg-white border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="text-xs font-medium uppercase">{bucket} Days</span>
                                </div>
                                <p className="text-2xl font-bold">₹{summary[bucket].total.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-gray-500 mt-1">{summary[bucket].count} familie(s)</p>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Total Due Banner */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 sm:p-6 text-white mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-red-100">Total Outstanding</p>
                        <p className="text-3xl sm:text-4xl font-bold">₹{totalDue.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>{report.length} families with dues</span>
                    </div>
                </div>
            </div>

            {/* Filter Info */}
            {filter !== 'all' && (
                <div className="mb-4 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${bucketColors[filter]}`}>
                        Showing: {filter} days
                    </span>
                    <button
                        onClick={() => setFilter('all')}
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        Clear filter
                    </button>
                </div>
            )}

            {/* Report Table */}
            {filteredReport.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No outstanding dues</h3>
                    <p className="text-gray-500 mt-1">
                        {filter !== 'all' ? 'No families in this aging bucket' : 'All families have cleared their dues'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Family</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Contact</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due Amount</th>
                                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Age</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Last Payment</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReport.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 sm:px-6 py-4">
                                            <p className="font-medium text-gray-900">{item.fatherName}</p>
                                            <p className="text-sm text-gray-500 sm:hidden">{item.phone}</p>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <Phone className="h-3 w-3" />
                                                <span className="text-sm">{item.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <span className="text-red-600 font-bold text-lg">
                                                ₹{item.dueAmount.toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-center">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${bucketColors[item.agingBucket]}`}>
                                                {item.daysSincePayment}d
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                <Calendar className="h-3 w-3" />
                                                {item.lastPaymentDate
                                                    ? format(item.lastPaymentDate, "dd MMM yyyy")
                                                    : <span className="text-gray-400 italic">Never</span>
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
