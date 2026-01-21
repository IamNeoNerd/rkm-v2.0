"use client";

import { Search, Filter } from "lucide-react";

interface TransactionFiltersProps {
    search: string;
    type: string;
    mode: string;
}

export function TransactionFilters({ search, type, mode }: TransactionFiltersProps) {
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const val = (e.target as HTMLInputElement).value;
            const params = new URLSearchParams(window.location.search);
            if (val) params.set("search", val);
            else params.delete("search");
            params.set("page", "1");
            window.location.href = `?${params.toString()}`;
        }
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(window.location.search);
        params.set("type", e.target.value);
        params.set("page", "1");
        window.location.href = `?${params.toString()}`;
    };

    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(window.location.search);
        params.set("mode", e.target.value);
        params.set("page", "1");
        window.location.href = `?${params.toString()}`;
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search receipt or family..."
                    defaultValue={search}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={handleSearchKeyDown}
                />
            </div>

            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                    defaultValue={type}
                    onChange={handleTypeChange}
                    className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">All Types</option>
                    <option value="CREDIT">Payment (Credit)</option>
                    <option value="DEBIT">Charge (Debit)</option>
                </select>

                <select
                    defaultValue={mode}
                    onChange={handleModeChange}
                    className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">All Modes</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                </select>
            </div>
        </div>
    );
}
