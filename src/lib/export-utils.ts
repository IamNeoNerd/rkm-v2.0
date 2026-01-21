/**
 * CSV Export Utility
 * Converts data to CSV format and triggers download
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string,
    columns?: { key: keyof T; label: string }[]
) {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    // Determine columns
    const cols = columns || Object.keys(data[0]).map(key => ({
        key: key as keyof T,
        label: String(key)
    }));

    // Build header row
    const headerRow = cols.map(col => `"${col.label}"`).join(',');

    // Build data rows
    const dataRows = data.map(item => {
        return cols.map(col => {
            const value = item[col.key];
            // Handle different types
            if (value === null || value === undefined) {
                return '""';
            }
            if (Object.prototype.toString.call(value) === '[object Date]') {
                return `"${(value as Date).toISOString()}"`;
            }
            if (typeof value === 'string') {
                // Escape quotes in strings
                return `"${value.replace(/"/g, '""')}"`;
            }
            return `"${String(value)}"`;
        }).join(',');
    }).join('\n');

    const csvContent = `${headerRow}\n${dataRows}`;

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Format currency for export (without symbol)
 */
export function formatCurrencyForExport(amount: number): string {
    return amount.toFixed(2);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
}
