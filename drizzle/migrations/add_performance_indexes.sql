-- Performance Indexes Migration
-- Run this migration to add indexes for better query performance

-- ============================================
-- Users & Auth
-- ============================================

-- Email lookup (already has unique constraint, but explicit index for clarity)
CREATE INDEX IF NOT EXISTS idx_users_email ON "user"(email);

-- Role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON "user"(role);

-- Verification status filtering
CREATE INDEX IF NOT EXISTS idx_users_verified ON "user"(is_verified);

-- ============================================
-- Families
-- ============================================

-- Phone lookup (commonly used for search)
CREATE INDEX IF NOT EXISTS idx_families_phone ON families(phone);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_families_status ON families(status);

-- Balance filtering (for dues reports)
CREATE INDEX IF NOT EXISTS idx_families_balance ON families(balance);

-- ============================================
-- Students
-- ============================================

-- Family lookup (foreign key index)
CREATE INDEX IF NOT EXISTS idx_students_family_id ON students(family_id);

-- Class grouping
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- Composite: Active students by family
CREATE INDEX IF NOT EXISTS idx_students_family_status ON students(family_id, status);

-- ============================================
-- Staff
-- ============================================

-- Role filtering
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

-- Active status
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);

-- ============================================
-- Transactions
-- ============================================

-- Family transactions
CREATE INDEX IF NOT EXISTS idx_transactions_family_id ON transactions(family_id);

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Type filtering (CREDIT/DEBIT)
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Category filtering (FEE/SALARY/EXPENSE)
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- Composite: Recent transactions by family
CREATE INDEX IF NOT EXISTS idx_transactions_family_date ON transactions(family_id, created_at DESC);

-- ============================================
-- Batches & Enrollments
-- ============================================

-- Teacher batches
CREATE INDEX IF NOT EXISTS idx_batches_teacher_id ON batches(teacher_id);

-- Enrollment lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch_id ON enrollments(batch_id);

-- Active enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_is_active ON enrollments(is_active);

-- Composite: Active student enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_student_active ON enrollments(student_id, is_active);

-- ============================================
-- Attendance
-- ============================================

-- Attendance by batch and date
CREATE INDEX IF NOT EXISTS idx_attendance_batch_date ON attendance(batch_id, date DESC);

-- Student attendance history
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);

-- ============================================
-- Academic Sessions
-- ============================================

-- Current session lookup
CREATE INDEX IF NOT EXISTS idx_academic_sessions_is_current ON academic_sessions(is_current);

-- ============================================
-- Fee Structures
-- ============================================

-- Session fee structures
CREATE INDEX IF NOT EXISTS idx_fee_structures_session_id ON fee_structures(session_id);

-- Class fee lookup
CREATE INDEX IF NOT EXISTS idx_fee_structures_class ON fee_structures(class_name);

-- ============================================
-- Notifications
-- ============================================

-- User notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Composite: User's unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- Audit Logs
-- ============================================

-- User audit trail
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Action filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
