/**
 * Drizzle-inferred types from database schema
 * 
 * These types are automatically derived from the schema definitions,
 * ensuring perfect type safety with the database.
 */

import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
    users,
    accounts,
    sessions,
    verificationTokens,
    families,
    students,
    staff,
    staffRoleTypes,
    academicSessions,
    feeStructures,
    auditLogs,
    systemSettings,
    rolePermissions,
    notifications,
    batches,
    enrollments,
    attendance,
    transactions,
} from './schema';

// ============ SELECT TYPES (for reading from DB) ============

/** User record from the users table */
export type User = InferSelectModel<typeof users>;

/** Account record from the accounts table */
export type Account = InferSelectModel<typeof accounts>;

/** Session record from the sessions table */
export type Session = InferSelectModel<typeof sessions>;

/** Verification token record */
export type VerificationToken = InferSelectModel<typeof verificationTokens>;

/** Family record with balance and status */
export type Family = InferSelectModel<typeof families>;

/** Student record with family reference */
export type Student = InferSelectModel<typeof students>;

/** Staff member record */
export type Staff = InferSelectModel<typeof staff>;

/** Custom staff role type (e.g., Sweeper, Peon) */
export type StaffRoleType = InferSelectModel<typeof staffRoleTypes>;

/** Academic session (e.g., 2025-26) */
export type AcademicSession = InferSelectModel<typeof academicSessions>;

/** Fee structure by class and session */
export type FeeStructure = InferSelectModel<typeof feeStructures>;

/** Audit log entry */
export type AuditLog = InferSelectModel<typeof auditLogs>;

/** System setting key-value pair */
export type SystemSetting = InferSelectModel<typeof systemSettings>;

/** Role permission entry for RBAC */
export type RolePermission = InferSelectModel<typeof rolePermissions>;

/** Notification record */
export type Notification = InferSelectModel<typeof notifications>;

/** Batch/class record */
export type Batch = InferSelectModel<typeof batches>;

/** Student enrollment in a batch */
export type Enrollment = InferSelectModel<typeof enrollments>;

/** Attendance record */
export type Attendance = InferSelectModel<typeof attendance>;

/** Financial transaction record */
export type Transaction = InferSelectModel<typeof transactions>;

// ============ INSERT TYPES (for creating new records) ============

export type NewUser = InferInsertModel<typeof users>;
export type NewFamily = InferInsertModel<typeof families>;
export type NewStudent = InferInsertModel<typeof students>;
export type NewStaff = InferInsertModel<typeof staff>;
export type NewBatch = InferInsertModel<typeof batches>;
export type NewEnrollment = InferInsertModel<typeof enrollments>;
export type NewAttendance = InferInsertModel<typeof attendance>;
export type NewTransaction = InferInsertModel<typeof transactions>;
export type NewNotification = InferInsertModel<typeof notifications>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;

// ============ COMMON QUERY RESULT TYPES ============

/** Student with family data */
export type StudentWithFamily = Student & {
    family: Family;
};

/** Family with students array */
export type FamilyWithStudents = Family & {
    students: Student[];
};

/** Batch with teacher info */
export type BatchWithTeacher = Batch & {
    teacher: Staff | null;
};

/** Transaction with related entities */
export type TransactionWithRelations = Transaction & {
    family?: Family | null;
    student?: Student | null;
    staff?: Staff | null;
};

/** Enrollment with batch and student */
export type EnrollmentWithDetails = Enrollment & {
    batch: Batch;
    student: Student;
};

// ============ ENUM TYPES ============

/** Transaction type: CREDIT (money in) or DEBIT (money out) */
export type TransactionType = 'CREDIT' | 'DEBIT';

/** Transaction category */
export type TransactionCategory = 'FEE' | 'SALARY' | 'EXPENSE' | 'REFUND';

/** Staff system role */
export type StaffRole = 'ADMIN' | 'TEACHER' | 'RECEPTIONIST' | 'STAFF';

/** User role for RBAC */
export type UserRole = 'super-admin' | 'admin' | 'teacher' | 'cashier' | 'parent' | 'student' | 'user';

/** Notification type */
export type NotificationType = 'FEE_REMINDER' | 'PAYMENT_RECEIVED' | 'ATTENDANCE_ALERT' | 'BATCH_UPDATE' | 'SYSTEM_ALERT' | 'GENERAL';

/** Attendance status */
export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

/** Family account status */
export type FamilyStatus = 'active' | 'inactive';

/** Payment mode */
export type PaymentMode = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';

