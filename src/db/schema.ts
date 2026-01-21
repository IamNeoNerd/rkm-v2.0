
import { pgTable, serial, text, integer, boolean, timestamp, date, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const transactionTypeEnum = pgEnum("transaction_type", ["CREDIT", "DEBIT"]);
export const transactionCategoryEnum = pgEnum("transaction_category", ["FEE", "SALARY", "EXPENSE", "REFUND"]);
export const staffRoleEnum = pgEnum("staff_role", ["ADMIN", "TEACHER", "RECEPTIONIST", "STAFF"]);

// Authentication Tables (NextAuth.js required tables)
export const users = pgTable("user", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    password: text("password"), // For credentials provider
    role: text("role").notNull().default("user"),
    isVerified: boolean("is_verified").notNull().default(false),
    phone: text("phone"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("account", {
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
}, (account) => [
    {
        compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
    }
]);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => [
    {
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    }
]);


// Core Tables
export const families = pgTable("families", {
    id: serial("id").primaryKey(),
    fatherName: text("father_name").notNull(),
    phone: text("phone").notNull().unique(), // Assuming phone is unique for family lookup
    balance: integer("balance").notNull().default(0),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const students = pgTable("students", {
    id: serial("id").primaryKey(),
    familyId: integer("family_id").references(() => families.id).notNull(),
    name: text("name").notNull(),
    class: text("class").notNull(),
    baseFeeOverride: integer("base_fee_override"), // Null means standard class fee applies
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const staff = pgTable("staff", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull().unique(),
    email: text("email").unique(), // For auto-matching with NextAuth users
    role: staffRoleEnum("role").notNull(), // System roles: ADMIN, TEACHER, RECEPTIONIST
    roleType: text("role_type"), // Custom role type (e.g., "Sweeper", "Peon", "Cook")
    authUserId: text("auth_user_id").unique(), // From external Auth provider (e.g., Clerk)
    baseSalary: integer("base_salary").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom Staff Role Types (for non-system roles like Sweeper, Peon, Cook, MTS)
export const staffRoleTypes = pgTable("staff_role_types", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// Configuration Tables
export const academicSessions = pgTable("academic_sessions", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(), // e.g., "2025-26"
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    isCurrent: boolean("is_current").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

export const feeStructures = pgTable("fee_structures", {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id").references(() => academicSessions.id),
    className: text("class_name").notNull(), // e.g., "Class 1", "Class 10"
    monthlyFee: integer("monthly_fee").notNull(),
    admissionFee: integer("admission_fee").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Logging - backward compatible with new structured logging
export const auditLogs = pgTable("audit_logs", {
    id: serial("id").primaryKey(),
    action: text("action").notNull(), // e.g., 'auth.login', 'payment.receive', etc.
    userId: text("user_id"), // Email or 'system'
    userName: text("user_name"), // Display name
    // Legacy fields (kept for backward compatibility)
    tableName: text("table_name"), // Legacy: table that was modified
    recordId: text("record_id"), // Legacy: ID of the modified record
    oldValues: text("old_values"), // Legacy: JSON string
    newValues: text("new_values"), // Legacy: JSON string
    // New structured fields
    entityType: text("entity_type"), // e.g., 'student', 'payment', 'batch'
    entityId: text("entity_id"), // ID of the affected entity
    details: text("details"), // JSON string with additional context
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    description: text("description"),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// User Roles enum for RBAC
export const userRoleEnum = pgEnum("user_role", [
    "super-admin",
    "admin",
    "teacher",
    "cashier",
    "parent",
    "user"
]);

// Role Permissions table for granular access control
export const rolePermissions = pgTable("role_permissions", {
    id: serial("id").primaryKey(),
    role: text("role").notNull(), // 'admin', 'teacher', 'cashier', 'parent'
    feature: text("feature").notNull(), // 'students', 'fees', 'attendance', etc.
    canView: boolean("can_view").default(false),
    canCreate: boolean("can_create").default(false),
    canEdit: boolean("can_edit").default(false),
    canDelete: boolean("can_delete").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const notificationTypeEnum = pgEnum("notification_type", [
    "FEE_REMINDER",
    "PAYMENT_RECEIVED",
    "ATTENDANCE_ALERT",
    "BATCH_UPDATE",
    "SYSTEM_ALERT",
    "GENERAL"
]);

// Notifications Table
export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: text("data"), // JSON string with additional context
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Academic Tables
export const batches = pgTable("batches", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    fee: integer("fee").notNull().default(0),
    schedule: text("schedule"), // E.g., "Mon-Wed-Fri 4-5 PM"
    teacherId: integer("teacher_id").references(() => staff.id),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").references(() => students.id).notNull(),
    batchId: integer("batch_id").references(() => batches.id).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    enrolledAt: timestamp("enrolled_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id").references(() => batches.id).notNull(),
    studentId: integer("student_id").references(() => students.id).notNull(),
    date: date("date").notNull(),
    status: text("status").notNull(), // 'Present', 'Absent', 'Late'
    createdAt: timestamp("created_at").defaultNow(),
});

// Financial Table (Universal Ledger)
export const transactions = pgTable("transactions", {
    id: serial("id").primaryKey(),
    type: transactionTypeEnum("type").notNull(),
    category: transactionCategoryEnum("category").notNull(),
    amount: integer("amount").notNull(),
    familyId: integer("family_id").references(() => families.id), // Nullable
    staffId: integer("staff_id").references(() => staff.id),     // Nullable
    expenseHead: text("expense_head"),                           // Nullable
    isVoid: boolean("is_void").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    description: text("description"), // Optional description
    // Audit trail fields
    performedBy: text("performed_by").references(() => users.id), // Who created this transaction
    receiptNumber: text("receipt_number"), // Auto-generated receipt number for payments
    paymentMode: text("payment_mode"), // CASH, UPI, BANK_TRANSFER, etc.
});

// Relations
export const familiesRelations = relations(families, ({ many }) => ({
    students: many(students),
    transactions: many(transactions),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
    family: one(families, {
        fields: [students.familyId],
        references: [families.id],
    }),
    enrollments: many(enrollments),
    attendance: many(attendance),
}));

export const staffRelations = relations(staff, ({ many }) => ({
    batches: many(batches),
    transactions: many(transactions),
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
    teacher: one(staff, {
        fields: [batches.teacherId],
        references: [staff.id],
    }),
    enrollments: many(enrollments),
    attendance: many(attendance),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
    student: one(students, {
        fields: [enrollments.studentId],
        references: [students.id],
    }),
    batch: one(batches, {
        fields: [enrollments.batchId],
        references: [batches.id],
    }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
    student: one(students, {
        fields: [attendance.studentId],
        references: [students.id],
    }),
    batch: one(batches, {
        fields: [attendance.batchId],
        references: [batches.id],
    }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
    family: one(families, {
        fields: [transactions.familyId],
        references: [families.id],
    }),
    staff: one(staff, {
        fields: [transactions.staffId],
        references: [staff.id],
    }),
}));
