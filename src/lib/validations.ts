/**
 * Centralized Zod Validation Schemas
 * 
 * This file contains reusable validation schemas for common data types
 * used across server actions. Centralizing validation ensures consistency
 * and makes it easier to update validation rules.
 */

import { z } from "zod";

// ============================================
// Primitive Types
// ============================================

/** ID fields - positive integers */
export const idSchema = z.number().int().positive();

/** String ID (for UUID fields like userId) */
export const stringIdSchema = z.string().uuid();

/** Optional ID - allows null/undefined */
export const optionalIdSchema = z.number().int().positive().optional();

// ============================================
// Common Field Schemas
// ============================================

/** Email with proper format validation */
export const emailSchema = z.string().email().max(255).toLowerCase().trim();

/** Phone number - Indian format */
export const phoneSchema = z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .regex(/^[+]?[\d\s-()]+$/, "Invalid phone number format");

/** Person name - letters, spaces, some punctuation */
export const nameSchema = z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim();

/** Amount - positive number for money */
export const amountSchema = z.number()
    .positive("Amount must be positive")
    .max(10000000, "Amount exceeds maximum limit"); // 1 crore max

/** Optional amount */
export const optionalAmountSchema = amountSchema.optional();

/** Date string in ISO format */
export const dateStringSchema = z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
}, "Invalid date format");

/** Date object */
export const dateSchema = z.date();

// ============================================
// Class/Academic Schemas
// ============================================

/** Valid class names */
export const classNameSchema = z.string()
    .min(1, "Class name required")
    .max(50, "Class name too long")
    .trim();

/** Session name (e.g., "2025-26") */
export const sessionNameSchema = z.string()
    .min(4, "Session name must be at least 4 characters")
    .max(20, "Session name too long")
    .regex(/^[\d\w\s-]+$/, "Invalid session name format");

/** Time slot (HH:MM format) */
export const timeSchema = z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (use HH:MM)");

// ============================================
// User & Auth Schemas
// ============================================

/** User role enum */
export const userRoleSchema = z.enum(["super-admin", "admin", "teacher", "parent"]);

/** Password - strong requirements */
export const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long");
// For stronger validation, add:
// .regex(/[A-Z]/, "Must contain uppercase")
// .regex(/[a-z]/, "Must contain lowercase")
// .regex(/[0-9]/, "Must contain number")

// ============================================
// Payment Schemas
// ============================================

/** Payment mode */
export const paymentModeSchema = z.enum(["CASH", "UPI"]);

/** Payment data */
export const paymentSchema = z.object({
    familyId: z.string().or(z.number()),
    amount: amountSchema,
    mode: paymentModeSchema,
});

// ============================================
// Admission Schemas
// ============================================

export const admissionSchema = z.object({
    fatherName: nameSchema,
    phone: phoneSchema,
    studentName: nameSchema,
    studentClass: classNameSchema,
    monthlyFee: amountSchema,
    joiningDate: z.date().or(dateStringSchema),
    initialPayment: optionalAmountSchema,
});

// ============================================
// Staff Schemas
// ============================================

export const staffRoleSchema = z.enum(["ADMIN", "TEACHER", "RECEPTIONIST"]);

export const createStaffSchema = z.object({
    name: nameSchema,
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    role: staffRoleSchema,
    baseSalary: amountSchema,
    joiningDate: dateStringSchema.optional(),
});

export const updateStaffSchema = z.object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    role: staffRoleSchema.optional(),
    baseSalary: amountSchema.optional(),
});

// ============================================
// Batch Schemas
// ============================================

export const createBatchSchema = z.object({
    name: z.string().min(1).max(100).trim(),
    subject: z.string().min(1).max(50).trim(),
    teacherId: idSchema.optional(),
    fee: amountSchema,
    schedule: z.string().max(500).optional(), // JSON string
    maxStudents: z.number().int().positive().max(100).optional(),
});

// ============================================
// Attendance Schemas
// ============================================

export const attendanceRecordSchema = z.object({
    studentId: idSchema,
    status: z.enum(["PRESENT", "ABSENT", "LATE"]),
});

export const markAttendanceSchema = z.object({
    batchId: idSchema,
    date: dateStringSchema,
    records: z.array(attendanceRecordSchema),
});

// ============================================
// Settings Schemas
// ============================================

export const authSettingsSchema = z.object({
    googleEnabled: z.boolean().optional(),
    googleDomains: z.string().max(500).optional(),
    autoVerifyStaff: z.boolean().optional(),
    credentialsEnabled: z.boolean().optional(),
});

// ============================================
// Pagination Schemas
// ============================================

export const paginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional(),
});

// ============================================
// Helper Functions
// ============================================

/**
 * Safely parse and validate data, returning a typed result
 */
export function validateInput<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string; errors?: Record<string, string[]> } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!errors[path]) {
            errors[path] = [];
        }
        errors[path].push(issue.message);
    }

    return {
        success: false,
        error: "Validation failed",
        errors,
    };
}

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export function sanitizeString(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, "") // Remove potential HTML tags
        .slice(0, 10000); // Limit length
}

/**
 * Validate and sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
    return query
        .trim()
        .replace(/[%_]/g, "") // Remove SQL wildcards
        .slice(0, 100);
}
