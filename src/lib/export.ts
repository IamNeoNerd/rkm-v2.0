/**
 * Export Utilities
 * 
 * Functions for exporting data to CSV and Excel formats
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(
    data: T[],
    columns: { key: keyof T; label: string }[]
): string {
    if (data.length === 0) return "";

    // Header row
    const header = columns.map(col => `"${col.label}"`).join(",");

    // Data rows
    const rows = data.map(item =>
        columns
            .map(col => {
                const value = item[col.key];
                if (value === null || value === undefined) return '""';
                if (typeof value === "string") {
                    // Escape quotes and wrap in quotes
                    return `"${value.replace(/"/g, '""')}"`;
                }
                if (value instanceof Date) {
                    return `"${value.toISOString()}"`;
                }
                return `"${String(value)}"`;
            })
            .join(",")
    );

    return [header, ...rows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    columns: { key: keyof T; label: string }[],
    filename: string
) {
    const csv = arrayToCSV(data, columns);
    downloadCSV(csv, filename);
}

// ============================================
// Pre-defined Export Configurations
// ============================================

export const StudentExportColumns = [
    { key: "id" as const, label: "ID" },
    { key: "name" as const, label: "Name" },
    { key: "class" as const, label: "Class" },
    { key: "familyName" as const, label: "Father Name" },
    { key: "phone" as const, label: "Phone" },
    { key: "isActive" as const, label: "Status" },
];

export const TransactionExportColumns = [
    { key: "id" as const, label: "Transaction ID" },
    { key: "receiptNumber" as const, label: "Receipt No" },
    { key: "familyName" as const, label: "Family" },
    { key: "type" as const, label: "Type" },
    { key: "amount" as const, label: "Amount" },
    { key: "mode" as const, label: "Mode" },
    { key: "description" as const, label: "Description" },
    { key: "createdAt" as const, label: "Date" },
];

export const DuesExportColumns = [
    { key: "familyId" as const, label: "Family ID" },
    { key: "familyName" as const, label: "Father Name" },
    { key: "phone" as const, label: "Phone" },
    { key: "totalDue" as const, label: "Amount Due" },
    { key: "studentCount" as const, label: "Students" },
];

export const StaffExportColumns = [
    { key: "id" as const, label: "ID" },
    { key: "name" as const, label: "Name" },
    { key: "role" as const, label: "Role" },
    { key: "phone" as const, label: "Phone" },
    { key: "email" as const, label: "Email" },
    { key: "baseSalary" as const, label: "Salary" },
    { key: "isActive" as const, label: "Status" },
];

export const AttendanceExportColumns = [
    { key: "studentName" as const, label: "Student" },
    { key: "batchName" as const, label: "Batch" },
    { key: "date" as const, label: "Date" },
    { key: "status" as const, label: "Status" },
];

/**
 * Format data for export (prepare data before exporting)
 */
export function formatDataForExport<T>(
    data: T[],
    formatter: (item: T) => Record<string, unknown>
): Record<string, unknown>[] {
    return data.map(formatter);
}

/**
 * Generate filename with date
 */
export function generateExportFilename(prefix: string): string {
    const date = new Date().toISOString().split("T")[0];
    return `${prefix}_${date}`;
}
